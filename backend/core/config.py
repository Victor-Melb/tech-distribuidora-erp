import os
from pathlib import Path

def _load_dotenv():
    """Carrega variáveis do arquivo .env sem expor segredos no código-fonte."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())

_load_dotenv()

class Settings:
    PROJECT_NAME: str = "TechDistribuidora ERP API"
    VERSION: str = "2.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "chave-padrao-apenas-dev-trocar-em-producao")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./techdistribuidora.db")
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
        if origin.strip()
    ]

settings = Settings()
