from datetime import date, timedelta
from sqlalchemy import text
from sqlalchemy.orm import Session

import models
from core.logger import registrar_auditoria
from core.security import HASH_PREFIX, gerar_hash_senha
from database import SessionLocal, engine


def garantir_colunas_legadas():
    """Garante compatibilidade caso o banco SQLite tenha sido criado na versão antiga."""
    with engine.connect() as conn:
        try:
            cols_usuario = [row[1] for row in conn.execute(text("PRAGMA table_info(usuario)")).fetchall()]
            if "ativo" in cols_usuario:
                pass
            elif cols_usuario:
                conn.execute(text("ALTER TABLE usuario ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT 1"))
                conn.commit()

            cols_produto = [row[1] for row in conn.execute(text("PRAGMA table_info(produto)")).fetchall()]
            if cols_produto and "custo" not in cols_produto:
                conn.execute(text("ALTER TABLE produto ADD COLUMN custo NUMERIC(10, 2) NOT NULL DEFAULT 0"))
                conn.commit()
        except Exception:
            pass


def popular_dados_iniciais():
    """Popula o banco com dados fictícios seguros e converte senhas legadas para hash."""
    models.Base.metadata.create_all(bind=engine)
    garantir_colunas_legadas()

    db: Session = SessionLocal()
    try:
        # 1. Migrar eventuais senhas em texto puro do banco antigo para Hash PBKDF2-SHA256
        usuarios_existentes = db.query(models.Usuario).all()
        for u in usuarios_existentes:
            if not u.senha.startswith(f"{HASH_PREFIX}$"):
                u.senha = gerar_hash_senha(u.senha if len(u.senha) >= 6 else "Mudar123")
            if u.ativo is None:
                u.ativo = True
        db.commit()

        # 2. Garantir os 3 perfis fictícios padrão para demonstração (Admin, Gerente, Vendedor)
        contas_padrao = [
            {
                "nome": "Carlos Eduardo (Admin TI)",
                "login": "admin",
                "senha_pura": "Admin123",
                "perfil": "Administrador",
            },
            {
                "nome": "Mariana Costa (Gerente)",
                "login": "gerente",
                "senha_pura": "Gerente123",
                "perfil": "Gerente",
            },
            {
                "nome": "Lucas Mendes (Vendedor)",
                "login": "vendedor",
                "senha_pura": "Vendedor123",
                "perfil": "Vendedor",
            },
        ]

        for conta in contas_padrao:
            existe = db.query(models.Usuario).filter(models.Usuario.login == conta["login"]).first()
            if not existe:
                novo = models.Usuario(
                    nome=conta["nome"],
                    login=conta["login"],
                    senha=gerar_hash_senha(conta["senha_pura"]),
                    perfil=conta["perfil"],
                    ativo=True,
                )
                db.add(novo)
        db.commit()

        # 3. Categorias e Produtos fictícios
        if db.query(models.Categoria).count() == 0:
            cat_perifericos = models.Categoria(nome="Periféricos Gamer", descricao="Teclados, mouses e headsets")
            cat_hardware = models.Categoria(nome="Hardware & Componentes", descricao="Processadores, SSDs e memórias")
            cat_redes = models.Categoria(nome="Redes Corporativas", descricao="Switches, roteadores e cabos")
            db.add_all([cat_perifericos, cat_hardware, cat_redes])
            db.commit()
            db.refresh(cat_perifericos)
            db.refresh(cat_hardware)
            db.refresh(cat_redes)

            produtos_iniciais = [
                models.Produto(
                    idCategoria=cat_perifericos.idCategoria,
                    nome="Teclado Mecânico Pro RGB Switch Blue",
                    descricao="Teclado ABNT2 com anti-ghosting completo",
                    preco=289.90,
                    custo=165.00,
                    estoque=24,
                ),
                models.Produto(
                    idCategoria=cat_perifericos.idCategoria,
                    nome="Mouse Óptico Wireless 16000 DPI",
                    descricao="Sensor de alta precisão com bateria recarregável",
                    preco=199.00,
                    custo=110.00,
                    estoque=6,  # Estoque baixo para demonstrar alerta
                ),
                models.Produto(
                    idCategoria=cat_hardware.idCategoria,
                    nome="SSD NVMe M.2 1TB Gen4",
                    descricao="Leitura até 5000MB/s",
                    preco=489.00,
                    custo=310.00,
                    estoque=18,
                ),
                models.Produto(
                    idCategoria=cat_redes.idCategoria,
                    nome="Switch Gigabit 24 Portas Gerenciável",
                    descricao="Rackmount 1U corporativo",
                    preco=1150.00,
                    custo=780.00,
                    estoque=4,  # Estoque baixo
                ),
            ]
            db.add_all(produtos_iniciais)
            db.commit()

        # 4. Clientes fictícios
        if db.query(models.Cliente).count() == 0:
            clientes_iniciais = [
                models.Cliente(
                    nome="Horizonte Tecnologia LTDA",
                    cpf_cnpj="12.345.678/0001-90",
                    telefone="(12) 3941-2200",
                    email="compras@horizontetech.com.br",
                    endereco="Av. Cassiano Ricardo, 800 - São José dos Campos/SP",
                ),
                models.Cliente(
                    nome="Vanguard Sistemas e Redes S.A.",
                    cpf_cnpj="98.765.432/0001-10",
                    telefone="(11) 4002-8922",
                    email="suprimentos@vanguardsistemas.com.br",
                    endereco="Rua Funchal, 418 - São Paulo/SP",
                ),
            ]
            db.add_all(clientes_iniciais)
            db.commit()

        # 5. Venda, Financeiro e Logística fictícios iniciais
        if db.query(models.Venda).count() == 0:
            cliente1 = db.query(models.Cliente).first()
            prod1 = db.query(models.Produto).first()
            if cliente1 and prod1:
                venda1 = models.Venda(
                    idCliente=cliente1.idCliente,
                    data=date.today(),
                    formaPagamento="PIX",
                    valorTotal=869.70,
                )
                db.add(venda1)
                db.flush()

                db.add(
                    models.ItemVenda(
                        idVenda=venda1.idVenda,
                        idProduto=prod1.idProduto,
                        quantidade=3,
                        precoUnitario=prod1.preco,
                    )
                )
                db.add(
                    models.TransacaoFinanceira(
                        tipo="Receber",
                        descricao=f"Venda #{venda1.idVenda} - {cliente1.nome}",
                        valor=869.70,
                        dataVencimento=date.today(),
                        status="Pago",
                    )
                )
                db.add(
                    models.TransacaoFinanceira(
                        tipo="Pagar",
                        descricao="Lote Importação Hardware #804",
                        valor=3250.00,
                        dataVencimento=date.today() + timedelta(days=7),
                        status="Pendente",
                    )
                )
                db.add(
                    models.Entrega(
                        idVenda=venda1.idVenda,
                        status="Em Trânsito",
                        codigoRastreio="BR482910394SP",
                        dataPrevisao=date.today() + timedelta(days=3),
                    )
                )
                db.commit()

        # 6. Log inicial de auditoria
        if db.query(models.LogAuditoria).count() == 0:
            registrar_auditoria(
                db=db,
                usuario_login="sistema",
                perfil="Sistema",
                acao="INICIALIZACAO_SEGURA",
                recurso="STARTUP",
                status="SUCESSO",
                detalhe="Módulo IAM inicializado com Hash PBKDF2-SHA256 e controle RBAC ativo",
            )
    finally:
        db.close()
