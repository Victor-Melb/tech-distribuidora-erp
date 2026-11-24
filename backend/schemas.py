import re
from datetime import date, datetime
from decimal import Decimal
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

from core.validators import (
    normalizar_espacos,
    validar_e_formatar_cpf_cnpj,
    validar_email_opcional,
)

PerfilTipo = Literal["Vendedor", "Gerente", "Administrador"]
LOGIN_REGEX = re.compile(r"^[a-zA-Z0-9._-]+$")

# 1. AUTENTICAÇÃO E USUÁRIOS (MÓDULO FOCO DE SEGURANÇA)

class LoginRequest(BaseModel):
    login: str = Field(..., min_length=3, max_length=50, description="Identificador de login do usuário")
    senha: str = Field(..., min_length=1, max_length=100, description="Senha de acesso")

    @field_validator("login")
    @classmethod
    def validar_login_formato(cls, v: str) -> str:
        limpo = v.strip().lower()
        if not LOGIN_REGEX.match(limpo):
            raise ValueError("O login deve conter apenas letras, números, ponto, hífen ou sublinhado.")
        return limpo


class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=100, description="Nome completo do colaborador")
    login: str = Field(..., min_length=3, max_length=50, description="Login único do colaborador")

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, v: str) -> str:
        limpo = " ".join(v.strip().split())
        if len(limpo) < 3:
            raise ValueError("O nome deve possuir pelo menos 3 caracteres válidos.")
        return limpo

    @field_validator("login")
    @classmethod
    def validar_login(cls, v: str) -> str:
        limpo = v.strip().lower()
        if not LOGIN_REGEX.match(limpo):
            raise ValueError("O login só pode conter letras, números, '.', '_' ou '-'.")
        return limpo


def _validar_forca_senha(senha: str) -> str:
    if len(senha) < 6:
        raise ValueError("A senha deve ter no mínimo 6 caracteres.")
    if len(senha) > 72:
        raise ValueError("A senha deve ter no máximo 72 caracteres.")
    tem_letra = any(c.isalpha() for c in senha)
    tem_numero = any(c.isdigit() for c in senha)
    if not (tem_letra and tem_numero):
        raise ValueError("A senha deve conter pelo menos uma letra e um número.")
    return senha


class UsuarioRegisterPublic(UsuarioBase):
    """Schema de auto-cadastro público: não permite escolher perfil privilegiado."""
    senha: str = Field(..., min_length=6, max_length=72)

    @field_validator("senha")
    @classmethod
    def check_senha(cls, v: str) -> str:
        return _validar_forca_senha(v)


class UsuarioCreate(UsuarioBase):
    """Schema para criação de usuário por Administrador (com validação estrita de perfil)."""
    senha: str = Field(..., min_length=6, max_length=72)
    perfil: PerfilTipo = Field(default="Vendedor")
    ativo: bool = Field(default=True)

    @field_validator("senha")
    @classmethod
    def check_senha(cls, v: str) -> str:
        return _validar_forca_senha(v)


class UsuarioUpdate(BaseModel):
    """Schema para atualização segura de usuário pelo Administrador."""
    nome: Optional[str] = Field(None, min_length=3, max_length=100)
    perfil: Optional[PerfilTipo] = None
    ativo: Optional[bool] = None
    nova_senha: Optional[str] = Field(None, min_length=6, max_length=72)

    @field_validator("nova_senha")
    @classmethod
    def check_nova_senha(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v != "":
            return _validar_forca_senha(v)
        return None


class Usuario(BaseModel):
    """Schema de resposta: NUNCA retorna o campo senha/hash."""
    idUsuario: int
    nome: str
    login: str
    perfil: str
    ativo: bool = True

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: Usuario


class LogAuditoriaResponse(BaseModel):
    idLog: int
    dataHora: datetime
    usuarioLogin: str
    perfil: Optional[str] = None
    acao: str
    recurso: str
    status: str
    detalhe: str

    model_config = ConfigDict(from_attributes=True)

# 2. CLIENTES

class ClienteBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=100)
    cpf_cnpj: str = Field(..., min_length=11, max_length=18)
    telefone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    endereco: Optional[str] = Field(default=None, max_length=150)

    @field_validator("nome")
    @classmethod
    def limpar_nome_cliente(cls, v: str) -> str:
        limpo = normalizar_espacos(v)
        if len(limpo) < 3:
            raise ValueError("O nome ou razão social deve ter pelo menos 3 caracteres válidos.")
        return limpo

    @field_validator("cpf_cnpj")
    @classmethod
    def validar_documento(cls, v: str) -> str:
        return validar_e_formatar_cpf_cnpj(v)

    @field_validator("email")
    @classmethod
    def validar_email_cliente(cls, v: Optional[str]) -> Optional[str]:
        return validar_email_opcional(v)

    @field_validator("telefone", "endereco")
    @classmethod
    def limpar_opcionais(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        limpo = normalizar_espacos(v)
        return limpo or None


class ClienteCreate(ClienteBase):
    pass


class Cliente(BaseModel):
    """Schema de resposta: aceita registros legados sem revalidar restrições de entrada."""
    idCliente: int
    nome: str
    cpf_cnpj: str
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)



# 3. CATEGORIAS E PRODUTOS (ESTOQUE)

class CategoriaBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100)
    descricao: Optional[str] = Field(default=None, max_length=500)


class CategoriaCreate(CategoriaBase):
    pass


class Categoria(CategoriaBase):
    idCategoria: int
    model_config = ConfigDict(from_attributes=True)


class ProdutoBase(BaseModel):
    idCategoria: int = Field(..., gt=0)
    nome: str = Field(..., min_length=2, max_length=100)
    descricao: Optional[str] = Field(default=None, max_length=500)
    preco: float = Field(..., gt=0, le=1_000_000, description="Preço de venda deve ser positivo")
    custo: float = Field(default=0.0, ge=0, le=1_000_000, description="Custo não pode ser negativo")
    estoque: int = Field(..., ge=0, le=1_000_000, description="Estoque não pode ser negativo")


class ProdutoCreate(ProdutoBase):
    pass


class Produto(ProdutoBase):
    idProduto: int
    model_config = ConfigDict(from_attributes=True)



# VENDAS E ITENS DE VENDA

class ItemVendaRequest(BaseModel):
    idProduto: int = Field(..., gt=0)
    quantidade: int = Field(..., gt=0, le=10_000, description="A quantidade vendida deve ser maior que zero")


class VendaRequest(BaseModel):
    idCliente: int = Field(..., gt=0)
    formaPagamento: Literal["PIX", "Dinheiro", "Débito", "Cartão de Crédito", "Boleto"]
    itens: List[ItemVendaRequest] = Field(..., min_length=1)


class ItemVendaBase(BaseModel):
    idProduto: int
    quantidade: int
    precoUnitario: Decimal


class ItemVendaCreate(ItemVendaBase):
    pass


class ItemVenda(ItemVendaBase):
    idItemVenda: int
    idVenda: int
    model_config = ConfigDict(from_attributes=True)


class VendaBase(BaseModel):
    idCliente: int
    data: date
    formaPagamento: Optional[str] = None
    valorTotal: Decimal


class VendaCreate(VendaBase):
    pass


class Venda(VendaBase):
    idVenda: int
    itens_venda: List[ItemVenda] = []
    model_config = ConfigDict(from_attributes=True)


# FINANCEIRO E LOGÍSTICA
class TransacaoFinanceiraBase(BaseModel):
    tipo: Literal["Receber", "Pagar"]
    descricao: str = Field(..., min_length=3, max_length=255)
    valor: Decimal = Field(..., gt=0, le=10_000_000)
    dataVencimento: date
    status: Literal["Pendente", "Pago"] = "Pendente"


class TransacaoFinanceiraCreate(TransacaoFinanceiraBase):
    pass


class TransacaoFinanceira(TransacaoFinanceiraBase):
    idTransacao: int
    model_config = ConfigDict(from_attributes=True)


class EntregaBase(BaseModel):
    idVenda: int = Field(..., gt=0)
    status: Literal["Preparando", "Em Trânsito", "Entregue"] = "Preparando"
    codigoRastreio: Optional[str] = Field(default=None, max_length=50)
    dataPrevisao: Optional[date] = None


class EntregaCreate(EntregaBase):
    pass


class Entrega(EntregaBase):
    idEntrega: int
    model_config = ConfigDict(from_attributes=True)
