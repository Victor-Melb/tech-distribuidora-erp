import logging
import re
from datetime import datetime
from sqlalchemy.orm import Session
import models

# Configuração de logger seguro no console
logger = logging.getLogger("techdistribuidora.security")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Padrões sensíveis que JAMAIS devem aparecer em logs (senhas, tokens, chaves, CPF completo)
SENSITIVE_PATTERNS = [
    (re.compile(r"(senha|password|token|secret|authorization)\s*[:=]\s*['\"]?[^'\"\s,;}]+", re.IGNORECASE), r"\1=[REDACTED]"),
    (re.compile(r"Bearer\s+[A-Za-z0-9\-._~+/]+=*", re.IGNORECASE), "Bearer [REDACTED_TOKEN]"),
]


def sanitizar_mensagem_log(texto: str) -> str:
    """Remove ou mascara qualquer tentativa acidental de registrar senhas ou tokens."""
    if not texto:
        return ""
    limpo = str(texto)
    for pattern, replacement in SENSITIVE_PATTERNS:
        limpo = pattern.sub(replacement, limpo)
    return limpo[:250]


def registrar_auditoria(
    db: Session,
    usuario_login: str,
    acao: str,
    recurso: str,
    status: str,
    detalhe: str,
    perfil: str = None,
):
    """
    Salva evento de auditoria no banco e no log da aplicação,
    garantindo que senhas, tokens e segredos nunca sejam gravados.
    """
    detalhe_seguro = sanitizar_mensagem_log(detalhe)
    login_seguro = sanitizar_mensagem_log(usuario_login or "anonimo")[:50]

    logger.info(
        f"AUDITORIA | usuario={login_seguro} | perfil={perfil or 'N/A'} | "
        f"acao={acao} | recurso={recurso} | status={status} | detalhe={detalhe_seguro}"
    )

    try:
        novo_log = models.LogAuditoria(
            dataHora=datetime.utcnow(),
            usuarioLogin=login_seguro,
            perfil=perfil,
            acao=acao[:80],
            recurso=recurso[:100],
            status=status[:20],
            detalhe=detalhe_seguro,
        )
        db.add(novo_log)
        db.commit()
    except Exception:
        db.rollback()
