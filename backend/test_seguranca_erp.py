"""
Suíte de Testes de Segurança (DAST) - Módulo de Autenticação e Usuários (IAM)
Executa 5 testes obrigatórios (Uso Normal, Entrada Inválida e Uso Indevido / RBAC)
com o servidor FastAPI em execução real.
"""
import json
import threading
import time
import urllib.error
import urllib.request
import uvicorn

from main import app

HOST = "127.0.0.1"
PORT = 8015
BASE_URL = f"http://{HOST}:{PORT}"


def fazer_requisicao(metodo: str, caminho: str, body: dict | None = None, token: str | None = None):
    url = f"{BASE_URL}{caminho}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=metodo)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            conteudo = resp.read().decode("utf-8")
            return resp.status, json.loads(conteudo) if conteudo else {}
    except urllib.error.HTTPError as err:
        conteudo = err.read().decode("utf-8")
        try:
            payload = json.loads(conteudo)
        except Exception:
            payload = {"raw": conteudo}
        return err.code, payload


def executar_suite_dast():
    config = uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    # Aguarda servidor iniciar
    for _ in range(30):
        try:
            status_code, _ = fazer_requisicao("GET", "/")
            if status_code == 200:
                break
        except Exception:
            time.sleep(0.1)

    print("=" * 78)
    print("  RELATÓRIO DE EXECUÇÃO DE TESTES DE SEGURANÇA (DAST) - TECHDISTRIBUIDORA ERP")
    print("=" * 78)

    resultados = []

    # -------------------------------------------------------------------------
    # TESTE 1 (USO NORMAL): Login válido com Administrador e consulta de sessão
    # -------------------------------------------------------------------------
    status_1, resp_1 = fazer_requisicao(
        "POST", "/auth/login", {"login": "admin", "senha": "Admin123"}
    )
    token_admin = resp_1.get("access_token")
    usuario_admin = resp_1.get("usuario", {})
    passou_1 = (
        status_1 == 200
        and bool(token_admin)
        and usuario_admin.get("perfil") == "Administrador"
        and "senha" not in usuario_admin
    )
    resultados.append(("Teste 1 [Uso Normal - Login Admin e Omissão de Hash]", passou_1, status_1, resp_1))
    print(f"\n[TESTE 1 - USO NORMAL] Login com credenciais válidas (admin)")
    print(f" -> HTTP Status: {status_1} | Perfil: {usuario_admin.get('perfil')} | Senha oculta no JSON: {'senha' not in usuario_admin}")
    print(f" -> Resultado: {'APROVADO' if passou_1 else 'FALHOU'}")

    # -------------------------------------------------------------------------
    # TESTE 2 (ENTRADA INVÁLIDA): Cadastro com senha fraca (< 6 chars / sem número)
    # e tentativa de caracteres inválidos no login
    # -------------------------------------------------------------------------
    status_2, resp_2 = fazer_requisicao(
        "POST",
        "/auth/register",
        {"nome": "Jo", "login": "admin' OR '1'='1", "senha": "123"},
    )
    passou_2 = status_2 == 422 and "erros" in resp_2
    resultados.append(("Teste 2 [Entrada Inválida - Validação de Servidor e Limites]", passou_2, status_2, resp_2))
    print(f"\n[TESTE 2 - ENTRADA INVÁLIDA] Envio de login com SQLi/formato inválido e senha fraca ('123')")
    print(f" -> HTTP Status: {status_2} | Mensagem: {resp_2.get('detail')} | Erros: {resp_2.get('erros')}")
    print(f" -> Resultado: {'APROVADO' if passou_2 else 'FALHOU'}")

    # -------------------------------------------------------------------------
    # TESTE 3 (USO INDEVIDO - ESCALAÇÃO DE PRIVILÉGIO NO AUTO-CADASTRO):
    # Usuário tenta se auto-cadastrar enviando "perfil": "Administrador" no JSON
    # -------------------------------------------------------------------------
    login_teste = f"colaborador_teste_{int(time.time()) % 10000}"
    status_3, resp_3 = fazer_requisicao(
        "POST",
        "/auth/register",
        {
            "nome": "Colaborador Externo",
            "login": login_teste,
            "senha": "SenhaSegura123",
            "perfil": "Administrador",  # Tentativa maliciosa de escalar privilégio!
        },
    )
    passou_3 = status_3 == 201 and resp_3.get("perfil") == "Vendedor"
    resultados.append(("Teste 3 [Uso Indevido - Prevenção de Escalação de Privilégio]", passou_3, status_3, resp_3))
    print(f"\n[TESTE 3 - USO INDEVIDO] Tentativa de auto-cadastro forçando 'perfil': 'Administrador'")
    print(f" -> HTTP Status: {status_3} | Perfil atribuído pelo servidor: {resp_3.get('perfil')}")
    print(f" -> Resultado: {'APROVADO (Servidor forçou perfil Vendedor)' if passou_3 else 'FALHOU'}")

    # -------------------------------------------------------------------------
    # TESTE 4 (USO INDEVIDO - QUEBRA DE CONTROLE DE ACESSO / RBAC):
    # Vendedor autenticado tenta listar todos os usuários ou criar um Administrador
    # -------------------------------------------------------------------------
    _, resp_login_vend = fazer_requisicao(
        "POST", "/auth/login", {"login": "vendedor", "senha": "Vendedor123"}
    )
    token_vendedor = resp_login_vend.get("access_token")
    status_4, resp_4 = fazer_requisicao("GET", "/usuarios/", token=token_vendedor)
    passou_4 = status_4 == 403
    resultados.append(("Teste 4 [Uso Indevido - Bloqueio RBAC para perfil Vendedor]", passou_4, status_4, resp_4))
    print(f"\n[TESTE 4 - USO INDEVIDO / RBAC] Vendedor tenta acessar GET /usuarios/ (Restrito a Admin/Gerente)")
    print(f" -> HTTP Status: {status_4} | Detalhe: {resp_4.get('detail')}")
    print(f" -> Resultado: {'APROVADO (Acesso Negado 403)' if passou_4 else 'FALHOU'}")

    # -------------------------------------------------------------------------
    # TESTE 5 (USO INDEVIDO - ACESSO SEM TOKEN / CREDENCIAIS ERRADAS):
    # Requisição sem cabeçalho Authorization e tentativa de senha incorreta
    # -------------------------------------------------------------------------
    status_5a, resp_5a = fazer_requisicao("GET", "/usuarios/")
    status_5b, resp_5b = fazer_requisicao(
        "POST", "/auth/login", {"login": "admin", "senha": "SenhaErrada999"}
    )
    passou_5 = status_5a == 401 and status_5b == 401
    resultados.append(("Teste 5 [Uso Indevido - Bloqueio 401 Sem Token e Senha Incorreta]", passou_5, status_5a, resp_5b))
    print(f"\n[TESTE 5 - AUTENTICAÇÃO E AUDITORIA] Acesso sem JWT ({status_5a}) e Login com senha errada ({status_5b})")
    print(f" -> Mensagem erro login (sem enumeração): {resp_5b.get('detail')}")
    print(f" -> Resultado: {'APROVADO' if passou_5 else 'FALHOU'}")

    print("\n" + "=" * 78)
    total_ok = sum(1 for _, ok, _, _ in resultados if ok)
    print(f"  RESUMO FINAL: {total_ok}/{len(resultados)} TESTES DE SEGURANÇA APROVADOS COM SUCESSO!")
    print("=" * 78)

    server.should_exit = True
    thread.join(timeout=2)
    assert total_ok == len(resultados), "Algum teste de segurança falhou!"


if __name__ == "__main__":
    executar_suite_dast()
