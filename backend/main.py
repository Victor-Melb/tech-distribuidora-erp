from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import models
from core.config import settings
from core.logger import logger
from database import engine
from routers import auth, clientes, estoque, financeiro, logistica, usuarios, vendas
from seed import popular_dados_iniciais


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    popular_dados_iniciais()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API do ERP TechDistribuidora com Autenticação JWT, Hash PBKDF2-SHA256, RBAC e Auditoria.",
    lifespan=lifespan,
)

# Configuração segura de CORS a partir do .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)


# ==============================================================================
# TRATAMENTO DE ERROS SEGURO (NÃO VAZA DETALHES INTERNOS OU STACK TRACE)
# ==============================================================================
_NOMES_CAMPOS_PT = {
    "cpf_cnpj": "CPF/CNPJ",
    "nome": "Nome",
    "login": "Login",
    "senha": "Senha",
    "nova_senha": "Nova senha",
    "email": "E-mail",
    "telefone": "Telefone",
    "endereco": "Endereço",
    "preco": "Preço",
    "custo": "Custo",
    "estoque": "Estoque",
    "quantidade": "Quantidade",
    "valor": "Valor",
    "descricao": "Descrição",
    "formaPagamento": "Forma de pagamento",
    "idCliente": "Cliente",
    "idProduto": "Produto",
    "idCategoria": "Categoria",
    "dataVencimento": "Data de vencimento",
}


def _formatar_erro_validacao(err: dict) -> str:
    msg = err.get("msg", "Valor inválido.")
    if msg.startswith("Value error, "):
        return msg.removeprefix("Value error, ").strip()

    locs = [str(loc) for loc in err.get("loc", []) if loc != "body"]
    campo_bruto = locs[-1] if locs else ""
    rotulo = _NOMES_CAMPOS_PT.get(campo_bruto, campo_bruto)
    tipo = err.get("type", "")
    ctx = err.get("ctx") or {}

    if tipo == "string_too_short" and "min_length" in ctx:
        texto = f"deve ter no mínimo {ctx['min_length']} caracteres."
    elif tipo == "string_too_long" and "max_length" in ctx:
        texto = f"deve ter no máximo {ctx['max_length']} caracteres."
    elif tipo == "missing":
        texto = "campo obrigatório."
    elif tipo == "greater_than" and "gt" in ctx:
        texto = f"deve ser maior que {ctx['gt']}."
    elif tipo == "greater_than_equal" and "ge" in ctx:
        texto = f"deve ser maior ou igual a {ctx['ge']}."
    else:
        texto = msg

    return f"{rotulo}: {texto}" if rotulo else texto


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formata erros de validação Pydantic em mensagens amigáveis sem expor estrutura interna."""
    erros_amigaveis = [_formatar_erro_validacao(err) for err in exc.errors()]

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Dados de entrada inválidos. Verifique os campos preenchidos.",
            "erros": erros_amigaveis,
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Impede que erros internos inesperados exponham stack traces ou caminhos de banco ao cliente."""
    logger.error(f"Erro interno tratado em {request.method} {request.url.path}: {type(exc).__name__}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Ocorreu um erro interno ao processar a solicitação. Tente novamente mais tarde."
        },
    )


@app.get("/")
def read_root():
    return {
        "message": "API TechDistribuidora ERP operando com segurança.",
        "version": settings.VERSION,
        "security": ["JWT HS256", "PBKDF2-HMAC-SHA256", "RBAC", "Input Validation", "Safe Audit Logs"],
    }


# Registro dos Routers Modulares
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(clientes.router)
app.include_router(estoque.router)
app.include_router(vendas.router)
app.include_router(financeiro.router)
app.include_router(logistica.router)
