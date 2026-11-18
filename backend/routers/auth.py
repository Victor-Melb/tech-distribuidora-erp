from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from core.logger import registrar_auditoria
from core.security import (
    criar_token_acesso,
    gerar_hash_senha,
    get_current_user,
    verificar_senha,
)
from database import get_db

router = APIRouter(prefix="/auth", tags=["Autenticação e Sessão"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(credenciais: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Autentica o usuário validando login e hash PBKDF2-SHA256 da senha.
    Retorna mensagem genérica em caso de falha para evitar enumeração de usuários.
    """
    usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.login == credenciais.login)
        .first()
    )

    if not usuario or not verificar_senha(credenciais.senha, usuario.senha):
        registrar_auditoria(
            db=db,
            usuario_login=credenciais.login,
            acao="LOGIN_FALHA",
            recurso="POST /auth/login",
            status="FALHA",
            detalhe="Tentativa de login com credenciais inválidas",
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário ou senha inválidos.",
        )

    if not usuario.ativo:
        registrar_auditoria(
            db=db,
            usuario_login=usuario.login,
            perfil=usuario.perfil,
            acao="LOGIN_CONTA_INATIVA",
            recurso="POST /auth/login",
            status="BLOQUEADO",
            detalhe="Tentativa de login em conta desativada pelo Administrador",
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sua conta está desativada. Contate o Administrador do sistema.",
        )

    token = criar_token_acesso(
        {
            "sub": str(usuario.idUsuario),
            "login": usuario.login,
            "perfil": usuario.perfil,
            "nome": usuario.nome,
        }
    )

    registrar_auditoria(
        db=db,
        usuario_login=usuario.login,
        perfil=usuario.perfil,
        acao="LOGIN_SUCESSO",
        recurso="POST /auth/login",
        status="SUCESSO",
        detalhe=f"Sessão autenticada com sucesso para o perfil {usuario.perfil}",
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario,
    }


@router.post("/register", response_model=schemas.Usuario, status_code=status.HTTP_201_CREATED)
def register_publico(dados: schemas.UsuarioRegisterPublic, db: Session = Depends(get_db)):
    """
    Auto-cadastro público seguro:
    - Valida formato de login e força da senha no servidor;
    - Aplica Hash PBKDF2-HMAC-SHA256 com salt;
    - Fixa o perfil obrigatoriamente como 'Vendedor' (impede escalação de privilégio!).
    """
    existente = (
        db.query(models.Usuario)
        .filter(models.Usuario.login == dados.login)
        .first()
    )
    if existente:
        registrar_auditoria(
            db=db,
            usuario_login=dados.login,
            acao="CADASTRO_DUPLICADO",
            recurso="POST /auth/register",
            status="FALHA",
            detalhe="Tentativa de cadastro com login já existente",
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este login já está em uso por outro colaborador.",
        )

    novo_usuario = models.Usuario(
        nome=dados.nome,
        login=dados.login,
        senha=gerar_hash_senha(dados.senha),
        perfil="Vendedor",  # Regra de segurança: auto-cadastro nunca cria Administrador!
        ativo=True,
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    registrar_auditoria(
        db=db,
        usuario_login=novo_usuario.login,
        perfil=novo_usuario.perfil,
        acao="AUTO_CADASTRO",
        recurso="POST /auth/register",
        status="SUCESSO",
        detalhe="Novo colaborador registrado com perfil padrão restrito (Vendedor)",
    )

    return novo_usuario


@router.get("/me", response_model=schemas.Usuario)
def obter_usuario_logado(usuario_atual: models.Usuario = Depends(get_current_user)):
    """Retorna os dados do próprio usuário autenticado (sem expor o hash de senha)."""
    return usuario_atual
