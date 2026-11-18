import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Iterable
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import models
from core.config import settings
from core.logger import registrar_auditoria
from database import get_db

# Esquema Bearer Token para autenticação nas rotas protegidas
security_scheme = HTTPBearer(auto_error=False)

HASH_PREFIX = "pbkdf2_sha256"
HASH_ITERATIONS = 100_000


# ==============================================================================
# 1. CRIPTOGRAFIA DE SENHAS (PBKDF2-HMAC-SHA256 + SALT ALEATÓRIO)
# ==============================================================================
def gerar_hash_senha(senha_pura: str) -> str:
    """
    Transforma a senha em texto puro em um hash criptográfico irreversível
    utilizando PBKDF2-HMAC-SHA256 com salt aleatório de 16 bytes e 100.000 iterações.
    """
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        senha_pura.encode("utf-8"),
        salt.encode("utf-8"),
        HASH_ITERATIONS,
    )
    return f"{HASH_PREFIX}${HASH_ITERATIONS}${salt}${dk.hex()}"


def verificar_senha(senha_pura: str, senha_armazenada: str) -> bool:
    """
    Compara uma senha informada com o hash salvo no banco em tempo constante
    (protegendo contra ataques de temporização / timing attacks).
    """
    if not senha_armazenada or not senha_armazenada.startswith(f"{HASH_PREFIX}$"):
        # Se existir registro legado sem hash, rejeita por segurança
        return False

    try:
        _, iter_str, salt, hash_hex = senha_armazenada.split("$", 3)
        iterations = int(iter_str)
        dk = hashlib.pbkdf2_hmac(
            "sha256",
            senha_pura.encode("utf-8"),
            salt.encode("utf-8"),
            iterations,
        )
        return hmac.compare_digest(dk.hex(), hash_hex)
    except Exception:
        return False


# ==============================================================================
# 2. TOKENS JWT (JSON WEB TOKEN - RFC 7519 HS256)
# ==============================================================================
def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def criar_token_acesso(dados: dict, expires_minutes: int | None = None) -> str:
    """Assina digitalmente um token JWT com expiração usando SECRET_KEY do .env."""
    exp_seconds = (expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES) * 60
    agora = int(time.time())

    header = {"alg": settings.ALGORITHM, "typ": "JWT"}
    payload = {
        **dados,
        "iat": agora,
        "exp": agora + exp_seconds,
    }

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    mensagem = f"{header_b64}.{payload_b64}".encode("ascii")

    assinatura = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        mensagem,
        hashlib.sha256,
    ).digest()
    assinatura_b64 = _b64url_encode(assinatura)

    return f"{header_b64}.{payload_b64}.{assinatura_b64}"


def decodificar_token_acesso(token: str) -> dict:
    """Valida a assinatura HMAC-SHA256 e o tempo de expiração do JWT."""
    try:
        partes = token.split(".")
        if len(partes) != 3:
            raise ValueError("Formato de token inválido")

        header_b64, payload_b64, assinatura_recebida = partes
        mensagem = f"{header_b64}.{payload_b64}".encode("ascii")

        assinatura_esperada = _b64url_encode(
            hmac.new(
                settings.SECRET_KEY.encode("utf-8"),
                mensagem,
                hashlib.sha256,
            ).digest()
        )

        if not hmac.compare_digest(assinatura_recebida, assinatura_esperada):
            raise ValueError("Assinatura do token inválida")

        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Token expirado")

        return payload
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão inválida ou expirada. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


# ==============================================================================
# 3. DEPENDÊNCIAS DE AUTENTICAÇÃO E AUTORIZAÇÃO POR PERFIL (RBAC)
# ==============================================================================
def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> models.Usuario:
    """Verifica se o usuário enviou um token JWT válido e se está ativo no banco."""
    if not credentials or not credentials.credentials:
        registrar_auditoria(
            db=db,
            usuario_login="anonimo",
            acao="ACESSO_SEM_TOKEN",
            recurso=request.url.path,
            status="BLOQUEADO",
            detalhe="Tentativa de acesso a rota protegida sem cabeçalho Authorization Bearer",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária. Informe um token de acesso válido.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decodificar_token_acesso(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acesso malformado.",
        )

    usuario = db.query(models.Usuario).filter(models.Usuario.idUsuario == int(user_id)).first()
    if not usuario or not usuario.ativo:
        registrar_auditoria(
            db=db,
            usuario_login=str(payload.get("login", "desconhecido")),
            acao="USUARIO_INATIVO_OU_INEXISTENTE",
            recurso=request.url.path,
            status="BLOQUEADO",
            detalhe="Token pertence a usuário inexistente ou desativado",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário inativo ou não encontrado.",
        )

    return usuario


def require_roles(perfis_permitidos: Iterable[str]):
    """
    Fábrica de dependência RBAC (Role-Based Access Control):
    Garante que somente usuários com o perfil exigido executem a operação.
    """
    perfis_set = set(perfis_permitidos)

    def _verificar_permissao(
        request: Request,
        usuario_atual: models.Usuario = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> models.Usuario:
        if usuario_atual.perfil not in perfis_set:
            registrar_auditoria(
                db=db,
                usuario_login=usuario_atual.login,
                perfil=usuario_atual.perfil,
                acao="ACESSO_NEGADO_RBAC",
                recurso=f"{request.method} {request.url.path}",
                status="BLOQUEADO",
                detalhe=f"Perfil '{usuario_atual.perfil}' tentou acessar recurso restrito a {sorted(perfis_set)}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Acesso negado: seu perfil ('{usuario_atual.perfil}') não possui "
                    f"permissão para esta operação. Perfis exigidos: {', '.join(sorted(perfis_set))}."
                ),
            )
        return usuario_atual

    return _verificar_permissao
