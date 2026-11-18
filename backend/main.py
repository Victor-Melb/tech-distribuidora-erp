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
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formata erros de validação Pydantic sem expor estrutura interna do servidor."""
    erros_amigaveis = []
    for err in exc.errors():
        campo = ".".join(str(loc) for loc in err.get("loc", []) if loc != "body")
        msg = err.get("msg", "Valor inválido")
        erros_amigaveis.append(f"{campo}: {msg}" if campo else msg)

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
