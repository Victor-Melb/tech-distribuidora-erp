from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from core.security import get_current_user, require_roles
from database import get_db

router = APIRouter(tags=["Estoque (Categorias e Produtos)"])


@router.get("/categorias/", response_model=List[schemas.Categoria])
def listar_categorias(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Categoria).offset(skip).limit(min(limit, 100)).all()


@router.post("/categorias/", response_model=schemas.Categoria, status_code=status.HTTP_201_CREATED)
def criar_categoria(
    categoria: schemas.CategoriaCreate,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    db_categoria = models.Categoria(**categoria.model_dump())
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    return db_categoria


@router.get("/produtos/", response_model=List[schemas.Produto])
def listar_produtos(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Produto).offset(skip).limit(min(limit, 100)).all()


@router.post("/produtos/", response_model=schemas.Produto, status_code=status.HTTP_201_CREATED)
def criar_produto(
    produto: schemas.ProdutoCreate,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    db_produto = models.Produto(**produto.model_dump())
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto


@router.put("/produtos/{produto_id}", response_model=schemas.Produto)
def atualizar_produto(
    produto_id: int,
    produto: schemas.ProdutoCreate,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_produto = (
        db.query(models.Produto)
        .filter(models.Produto.idProduto == produto_id)
        .first()
    )
    if not db_produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado.")

    for key, value in produto.model_dump().items():
        setattr(db_produto, key, value)

    db.commit()
    db.refresh(db_produto)
    return db_produto


@router.delete("/produtos/{produto_id}")
def excluir_produto(
    produto_id: int,
    usuario_atual: models.Usuario = Depends(require_roles(["Administrador", "Gerente"])),
    db: Session = Depends(get_db),
):
    db_produto = (
        db.query(models.Produto)
        .filter(models.Produto.idProduto == produto_id)
        .first()
    )
    if not db_produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado.")
    db.delete(db_produto)
    db.commit()
    return {"ok": True}
