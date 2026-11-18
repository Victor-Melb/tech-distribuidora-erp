from datetime import date, timedelta
import decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from core.security import get_current_user
from database import get_db

router = APIRouter(prefix="/vendas", tags=["Vendas e PDV"])


@router.post("/realizar")
def realizar_venda(
    req: schemas.VendaRequest,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cliente = (
        db.query(models.Cliente)
        .filter(models.Cliente.idCliente == req.idCliente)
        .first()
    )
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")

    valor_total = decimal.Decimal("0.00")
    itens_db = []

    for req_item in req.itens:
        produto = (
            db.query(models.Produto)
            .filter(models.Produto.idProduto == req_item.idProduto)
            .first()
        )
        if not produto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produto {req_item.idProduto} não encontrado.",
            )
        if produto.estoque < req_item.quantidade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estoque insuficiente para {produto.nome} (disponível: {produto.estoque}).",
            )

        produto.estoque -= req_item.quantidade
        valor_item = decimal.Decimal(str(produto.preco)) * req_item.quantidade
        valor_total += valor_item

        item_model = models.ItemVenda(
            idProduto=produto.idProduto,
            quantidade=req_item.quantidade,
            precoUnitario=produto.preco,
        )
        itens_db.append(item_model)

    nova_venda = models.Venda(
        idCliente=req.idCliente,
        data=date.today(),
        formaPagamento=req.formaPagamento,
        valorTotal=valor_total,
    )
    db.add(nova_venda)
    db.flush()

    for item in itens_db:
        item.idVenda = nova_venda.idVenda
        db.add(item)

    nova_conta = models.TransacaoFinanceira(
        tipo="Receber",
        descricao=f"Venda #{nova_venda.idVenda} - {cliente.nome}",
        valor=valor_total,
        dataVencimento=date.today(),
        status="Pago" if req.formaPagamento in ["PIX", "Dinheiro", "Débito"] else "Pendente",
    )
    db.add(nova_conta)

    nova_entrega = models.Entrega(
        idVenda=nova_venda.idVenda,
        status="Preparando",
        dataPrevisao=date.today() + timedelta(days=5),
    )
    db.add(nova_entrega)

    db.commit()
    return {
        "message": "Venda realizada com sucesso",
        "idVenda": nova_venda.idVenda,
        "valor": float(valor_total),
    }


@router.get("/", response_model=List[schemas.Venda])
def listar_vendas(
    skip: int = 0,
    limit: int = 100,
    usuario_atual: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(models.Venda).offset(skip).limit(min(limit, 100)).all()
