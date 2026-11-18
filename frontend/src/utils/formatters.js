export function formatarMoeda(valor) {
  const num = Number.parseFloat(valor || 0)
  return `R$ ${num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatarDataBR(valorData) {
  if (!valorData) return '—'
  // Evita deslocamento de fuso horário em datas YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(valorData)) {
    const [ano, mes, dia] = valorData.split('-')
    return `${dia}/${mes}/${ano}`
  }
  const dt = new Date(valorData)
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('pt-BR')
}

export function formatarDataHoraBR(valorDataHora) {
  if (!valorDataHora) return '—'
  const dt = new Date(valorDataHora)
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleString('pt-BR')
}
