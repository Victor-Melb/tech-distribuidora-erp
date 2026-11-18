from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from core.security import get_current_user, require_roles
from core.validators import variantes_cpf_cnpj
from database import get_db

router = APIRouter(prefix="/clientes", tags=["Clientes"])


def _verificar_duplicidade_cliente(
    db: Session,
    cliente: schemas.ClienteCreate,
    excluir_id: Optional[int] = None,
) -> None:
    def filtrar_outros(query):
        return (
            query.filter(models.Cliente.idCliente != excluir_id)
            if excluir_id is not None
            else query
        )

    doc_digitos, doc_formatado = variantes_cpf_cnpj(cliente.cpf_cnpj)
    doc_existente = filtrar_outros(
        db.query(models.Cliente).filter(
            models.Cliente.cpf_cnpj.in_([doc_digitos, doc_formatado])
        )
    ).first()
    if doc_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um cliente cadastrado com este CPF/CNPJ.",
        )

    nome_existente = filtrar_outros(
        db.query(models.Cliente).filter(
            func.lower(func.trim(models.Cliente.nome)) == cliente.nome.lower()
        )
    ).first()
    if nome_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um cliente cadastrado com este nome / razão social.",
        )

    if cliente.email:
        email_existente = filtrar_outros(
            db.query(models.Cliente).filter(
                func.lower(func.trim(models.Cliente.email)) == cliente.email
            )
        ).first()
        if email_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe um cliente cadastrado com este e-mail.",
            )


@router.get("/", response_model=List[schemas.Cliente])
def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Cliente).offset(skip).limit(min(limit, 100)).all()


@router.post("/", response_model=schemas.Cliente, status_code=status.HTTP_201_CREATED)
def criar_cliente(
    cliente: schemas.ClienteCreate,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _verificar_duplicidade_cliente(db, cliente)

    db_cliente = models.Cliente(**cliente.model_dump())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.put("/{cliente_id}", response_model=schemas.Cliente)
def atualizar_cliente(
    cliente_id: int,
    cliente: schemas.ClienteCreate,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_cliente = (
        db.query(models.Cliente)
        .filter(models.Cliente.idCliente == cliente_id)
        .first()
    )
    if not db_cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")

    _verificar_duplicidade_cliente(db, cliente, excluir_id=cliente_id)

    for key, value in cliente.model_dump().items():
        setattr(db_cliente, key, value)

    db.commit()
    db.refresh(db_cliente)
    return db_cliente


@router.delete("/{cliente_id}")
def excluir_cliente(
    cliente_id: int,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    db_cliente = (
        db.query(models.Cliente)
        .filter(models.Cliente.idCliente == cliente_id)
        .first()
    )
    if not db_cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")
    db.delete(db_cliente)
    db.commit()
    return {"ok": True}
