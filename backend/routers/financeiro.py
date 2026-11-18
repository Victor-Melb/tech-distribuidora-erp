from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from core.security import get_current_user, require_roles
from database import get_db

router = APIRouter(prefix="/transacoes", tags=["Financeiro"])


@router.get("/", response_model=List[schemas.TransacaoFinanceira])
def listar_transacoes(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.TransacaoFinanceira).offset(skip).limit(min(limit, 100)).all()


@router.post("/", response_model=schemas.TransacaoFinanceira, status_code=status.HTTP_201_CREATED)
def criar_transacao(
    transacao: schemas.TransacaoFinanceiraCreate,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    db_trans = models.TransacaoFinanceira(**transacao.model_dump())
    db.add(db_trans)
    db.commit()
    db.refresh(db_trans)
    return db_trans


@router.put("/{transacao_id}/pagar")
def pagar_transacao(
    transacao_id: int,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    trans = (
        db.query(models.TransacaoFinanceira)
        .filter(models.TransacaoFinanceira.idTransacao == transacao_id)
        .first()
    )
    if not trans:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada.")
    trans.status = "Pago"
    db.commit()
    return {"message": "Transação marcada como paga"}
