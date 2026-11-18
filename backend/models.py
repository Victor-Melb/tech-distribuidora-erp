from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class Usuario(Base):
    __tablename__ = "usuario"
    idUsuario = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    login = Column(String(50), nullable=False, unique=True, index=True)
    senha = Column(String(255), nullable=False)  # Armazena exclusivamente Hash PBKDF2-SHA256
    perfil = Column(String(30), nullable=False, default="Vendedor")  # Vendedor, Gerente, Administrador
    ativo = Column(Boolean, nullable=False, default=True)


class LogAuditoria(Base):
    """Registra eventos de segurança e auditoria sem jamais armazenar senhas, chaves ou tokens."""
    __tablename__ = "log_auditoria"
    idLog = Column(Integer, primary_key=True, index=True)
    dataHora = Column(DateTime, nullable=False, default=datetime.utcnow)
    usuarioLogin = Column(String(50), nullable=False)
    perfil = Column(String(30), nullable=True)
    acao = Column(String(80), nullable=False)
    recurso = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False)  # SUCESSO, FALHA, BLOQUEADO
    detalhe = Column(String(255), nullable=False)


class Cliente(Base):
    __tablename__ = "cliente"
    idCliente = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    cpf_cnpj = Column(String(18), nullable=False, unique=True)
    telefone = Column(String(20))
    email = Column(String(100))
    endereco = Column(String(150))

    vendas = relationship("Venda", back_populates="cliente")


class Categoria(Base):
    __tablename__ = "categoria"
    idCategoria = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)

    produtos = relationship("Produto", back_populates="categoria")


class Produto(Base):
    __tablename__ = "produto"
    idProduto = Column(Integer, primary_key=True, index=True)
    idCategoria = Column(Integer, ForeignKey("categoria.idCategoria"))
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    preco = Column(Numeric(10, 2), nullable=False)
    custo = Column(Numeric(10, 2), nullable=False, default=0)
    estoque = Column(Integer, nullable=False, default=0)

    categoria = relationship("Categoria", back_populates="produtos")
    itens_venda = relationship("ItemVenda", back_populates="produto")


class Venda(Base):
    __tablename__ = "venda"
    idVenda = Column(Integer, primary_key=True, index=True)
    idCliente = Column(Integer, ForeignKey("cliente.idCliente"))
    data = Column(Date, nullable=False)
    formaPagamento = Column(String(50))
    valorTotal = Column(Numeric(10, 2), nullable=False)

    cliente = relationship("Cliente", back_populates="vendas")
    itens_venda = relationship("ItemVenda", back_populates="venda")


class ItemVenda(Base):
    __tablename__ = "item_venda"
    idItemVenda = Column(Integer, primary_key=True, index=True)
    idVenda = Column(Integer, ForeignKey("venda.idVenda"))
    idProduto = Column(Integer, ForeignKey("produto.idProduto"))
    quantidade = Column(Integer, nullable=False)
    precoUnitario = Column(Numeric(10, 2), nullable=False)

    venda = relationship("Venda", back_populates="itens_venda")
    produto = relationship("Produto", back_populates="itens_venda")


class TransacaoFinanceira(Base):
    __tablename__ = "transacao_financeira"
    idTransacao = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(20), nullable=False)  # 'Receber' ou 'Pagar'
    descricao = Column(String(255), nullable=False)
    valor = Column(Numeric(10, 2), nullable=False)
    dataVencimento = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="Pendente")  # 'Pendente', 'Pago'


class Entrega(Base):
    __tablename__ = "entrega"
    idEntrega = Column(Integer, primary_key=True, index=True)
    idVenda = Column(Integer, ForeignKey("venda.idVenda"), unique=True)
    status = Column(String(50), nullable=False, default="Preparando")  # 'Preparando', 'Em Trânsito', 'Entregue'
    codigoRastreio = Column(String(50))
    dataPrevisao = Column(Date)

    venda = relationship("Venda")
