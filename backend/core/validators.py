import re
from typing import Tuple

_EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def normalizar_espacos(valor: str) -> str:
    """Remove espaços extras nas pontas e colapsa espaços internos."""
    return " ".join((valor or "").strip().split())


def somente_digitos(valor: str) -> str:
    """Extrai apenas os caracteres numéricos de uma string."""
    return re.sub(r"\D", "", valor or "")


def _calcular_digito_mod11(base: str, pesos: list[int]) -> str:
    soma = sum(int(d) * p for d, p in zip(base, pesos))
    resto = soma % 11
    return "0" if resto < 2 else str(11 - resto)


def _cpf_valido(digitos: str) -> bool:
    if len(digitos) != 11 or len(set(digitos)) == 1:
        return False
    d1 = _calcular_digito_mod11(digitos[:9], list(range(10, 1, -1)))
    d2 = _calcular_digito_mod11(digitos[:9] + d1, list(range(11, 1, -1)))
    return digitos[-2:] == d1 + d2


def _cnpj_valido(digitos: str) -> bool:
    if len(digitos) != 14 or len(set(digitos)) == 1:
        return False
    pesos_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos_2 = [6] + pesos_1
    d1 = _calcular_digito_mod11(digitos[:12], pesos_1)
    d2 = _calcular_digito_mod11(digitos[:12] + d1, pesos_2)
    return digitos[-2:] == d1 + d2


def formatar_cpf_cnpj(digitos: str) -> str:
    """Formata 11 dígitos como CPF ou 14 dígitos como CNPJ."""
    if len(digitos) == 11:
        return f"{digitos[:3]}.{digitos[3:6]}.{digitos[6:9]}-{digitos[9:]}"
    if len(digitos) == 14:
        return f"{digitos[:2]}.{digitos[2:5]}.{digitos[5:8]}/{digitos[8:12]}-{digitos[12:]}"
    return digitos


def validar_e_formatar_cpf_cnpj(valor: str) -> str:
    """Valida CPF/CNPJ pelo algoritmo Módulo 11 e retorna formato mascarado padrão."""
    digitos = somente_digitos(valor)
    if len(digitos) not in (11, 14):
        raise ValueError("O CPF deve conter 11 dígitos ou o CNPJ deve conter 14 dígitos.")
    if len(digitos) == 11 and not _cpf_valido(digitos):
        raise ValueError("CPF inválido. Verifique os dígitos informados.")
    if len(digitos) == 14 and not _cnpj_valido(digitos):
        raise ValueError("CNPJ inválido. Verifique os dígitos informados.")
    return formatar_cpf_cnpj(digitos)


def variantes_cpf_cnpj(valor: str) -> Tuple[str, str]:
    """Retorna ambas as representações (somente dígitos e mascarado) para consulta de unicidade."""
    digitos = somente_digitos(valor)
    return digitos, formatar_cpf_cnpj(digitos)


def validar_email_opcional(valor: str | None) -> str | None:
    """Normaliza e-mail opcional para minúsculas ou None quando vazio."""
    if valor is None:
        return None
    limpo = valor.strip().lower()
    if not limpo:
        return None
    if not _EMAIL_REGEX.match(limpo):
        raise ValueError("Formato de e-mail inválido.")
    return limpo
