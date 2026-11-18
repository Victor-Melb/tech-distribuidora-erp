from typing import List, Literal, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

import models
import schemas
from core.security import get_current_user
from database import get_db

router = APIRouter(prefix="/entregas", tags=["Logística e Entregas"])


@router.get("/", response_model=List[schemas.Entrega])
def listar_entregas(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Entrega).offset(skip).limit(min(limit, 100)).all()


@router.put("/{id_entrega}/status")
def atualizar_status_entrega(
    id_entrega: int,
    status_entrega: Literal["Preparando", "Em Trânsito", "Entregue"] = Query(..., alias="status"),
    codigoRastreio: Optional[str] = Query(default=None, max_length=50),
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    entrega = (
        db.query(models.Entrega)
        .filter(models.Entrega.idEntrega == id_entrega)
        .first()
    )
    if not entrega:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrega não encontrada.")
    entrega.status = status_entrega
    if codigoRastreio:
        entrega.codigoRastreio = codigoRastreio
    db.commit()
    return {"message": "Status atualizado com sucesso"}
