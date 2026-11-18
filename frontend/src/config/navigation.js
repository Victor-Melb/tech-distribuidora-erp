import {
  BarChart3,
  DollarSign,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react'

export const NAV_GROUPS = [
  {
    id: 'operacao',
    label: 'Operação',
    summary: 'Monitoramento e fluxo físico',
    items: [
      {
        label: 'Visão Executiva',
        description: 'Painel consolidado de indicadores',
        to: '/menu',
        icon: LayoutDashboard,
      },
      {
        label: 'Estoque e Lotes',
        description: 'Catálogo, custos e movimentações',
        to: '/estoque',
        icon: Package,
      },
      {
        label: 'Expedição',
        description: 'Despacho, rastreio e entregas',
        to: '/logistica',
        icon: Truck,
      },
    ],
  },
  {
    id: 'comercial',
    label: 'Comercial',
    summary: 'Faturamento e relacionamento B2B',
    items: [
      {
        label: 'Vendas (PDV)',
        description: 'Emissão de pedidos corporativos',
        to: '/vendas',
        icon: ShoppingCart,
      },
      {
        label: 'Clientes B2B',
        description: 'Carteira empresarial e CNPJ',
        to: '/clientes',
        icon: Users,
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    summary: 'Tesouraria e performance',
    items: [
      {
        label: 'Contas e Caixa',
        description: 'Recebíveis, despesas e conciliação',
        to: '/financeiro',
        icon: DollarSign,
      },
      {
        label: 'Indicadores',
        description: 'DRE, margens e relatórios executivos',
        to: '/relatorios',
        icon: BarChart3,
      },
    ],
  },
  {
    id: 'governanca',
    label: 'Governança',
    summary: 'Controle de acesso e compliance',
    items: [
      {
        label: 'Usuários & Segurança',
        description: 'Perfis RBAC, auditoria e testes DAST',
        to: '/usuarios',
        icon: ShieldCheck,
      },
    ],
  },
]

export const FLAT_NAV_ITEMS = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    ...item,
    groupId: group.id,
    groupLabel: group.label,
  }))
)
