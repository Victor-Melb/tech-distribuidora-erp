from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from core.logger import registrar_auditoria
from core.security import gerar_hash_senha, get_current_user, require_roles
from database import get_db

router = APIRouter(prefix="/usuarios", tags=["Gestão de Usuários e Segurança (IAM)"])


@router.get("/", response_model=List[schemas.Usuario])
def listar_usuarios(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    """
    Lista todos os usuários cadastrados (nunca retorna o campo senha).
    Restrito aos perfis 'Administrador' e 'Gerente'.
    """
    return (
        db.query(models.Usuario)
        .order_by(models.Usuario.idUsuario.asc())
        .offset(skip)
        .limit(min(limit, 100))
        .all()
    )


@router.post("/", response_model=schemas.Usuario, status_code=status.HTTP_201_CREATED)
def criar_usuario_admin(
    usuario: schemas.UsuarioCreate,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador"])),
    db: Session = Depends(get_db),
):
    """
    Criação administrativa de usuários (permite definir perfil Vendedor, Gerente ou Administrador).
    Exige autenticação com perfil 'Administrador'.
    """
    existente = (
        db.query(models.Usuario)
        .filter(models.Usuario.login == usuario.login)
        .first()
    )
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um usuário cadastrado com este login.",
        )

    db_usuario = models.Usuario(
        nome=usuario.nome,
        login=usuario.login,
        senha=gerar_hash_senha(usuario.senha),
        perfil=usuario.perfil,
        ativo=usuario.ativo,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    registrar_auditoria(
        db=db,
        usuario_login=usuario_atual.login,
        perfil=usuario_atual.perfil,
        acao="CRIAR_USUARIO",
        recurso=f"POST /usuarios/ ({db_usuario.login})",
        status="SUCESSO",
        detalhe=f"Usuário '{db_usuario.login}' criado com perfil '{db_usuario.perfil}'",
    )
    return db_usuario


@router.put("/{usuario_id}", response_model=schemas.Usuario)
def atualizar_usuario(
    usuario_id: int,
    dados: schemas.UsuarioUpdate,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador"])),
    db: Session = Depends(get_db),
):
    """
    Atualiza nome, perfil, status ativo ou redefine senha de um usuário.
    Exige perfil 'Administrador' e impede que o admin desative ou rebaixe a própria conta.
    """
    db_usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.idUsuario == usuario_id)
        .first()
    )
    if not db_usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")

    if db_usuario.idUsuario == usuario_atual.idUsuario:
        if dados.ativo is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não pode desativar a sua própria conta de Administrador.",
            )
        if dados.perfil and dados.perfil != "Administrador":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não pode remover o privilégio de Administrador da sua própria conta.",
            )

    alteracoes = []
    if dados.nome is not None:
        db_usuario.nome = dados.nome
        alteracoes.append("nome")
    if dados.perfil is not None and dados.perfil != db_usuario.perfil:
        alteracoes.append(f"perfil:{db_usuario.perfil}->{dados.perfil}")
        db_usuario.perfil = dados.perfil
    if dados.ativo is not None and dados.ativo != db_usuario.ativo:
        alteracoes.append(f"ativo:{db_usuario.ativo}->{dados.ativo}")
        db_usuario.ativo = dados.ativo
    if dados.nova_senha:
        db_usuario.senha = gerar_hash_senha(dados.nova_senha)
        alteracoes.append("senha_redefinida_hash")

    db.commit()
    db.refresh(db_usuario)

    registrar_auditoria(
        db=db,
        usuario_login=usuario_atual.login,
        perfil=usuario_atual.perfil,
        acao="ATUALIZAR_USUARIO",
        recurso=f"PUT /usuarios/{usuario_id} ({db_usuario.login})",
        status="SUCESSO",
        detalhe=f"Campos alterados: {', '.join(alteracoes) if alteracoes else 'nenhum'}",
    )
    return db_usuario


@router.delete("/{usuario_id}")
def excluir_usuario(
    usuario_id: int,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador"])),
    db: Session = Depends(get_db),
):
    """
    Remove um usuário do sistema.
    Exige perfil 'Administrador' e impede a auto-exclusão.
    """
    db_usuario = (
        db.query(models.Usuario)
        .filter(models.Usuario.idUsuario == usuario_id)
        .first()
    )
    if not db_usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")

    if db_usuario.idUsuario == usuario_atual.idUsuario:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Operação bloqueada: você não pode excluir a sua própria conta em uso.",
        )

    login_alvo = db_usuario.login
    db.delete(db_usuario)
    db.commit()

    registrar_auditoria(
        db=db,
        usuario_login=usuario_atual.login,
        perfil=usuario_atual.perfil,
        acao="EXCLUIR_USUARIO",
        recurso=f"DELETE /usuarios/{usuario_id} ({login_alvo})",
        status="SUCESSO",
        detalhe=f"Usuário '{login_alvo}' removido pelo Administrador",
    )
    return {"ok": True, "message": f"Usuário '{login_alvo}' removido com sucesso."}


@router.get("/auditoria/logs", response_model=List[schemas.LogAuditoriaResponse])
def listar_logs_auditoria(
    limit: int = 50,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    """
    Retorna a trilha de auditoria de segurança (logins, bloqueios RBAC, cadastros)
    sem expor senhas ou tokens.
    """
    return (
        db.query(models.LogAuditoria)
        .order_by(models.LogAuditoria.idLog.desc())
        .limit(min(limit, 200))
        .all()
    )
