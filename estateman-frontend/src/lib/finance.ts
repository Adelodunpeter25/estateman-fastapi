export type Installment = {
  amount: number
  dueDate: string
  status: 'paid' | 'upcoming' | 'overdue'
  paidDate?: string | null
}

export function recalcFutureInstallments(
  installments: Installment[],
  newTotalAmount: number,
  paidAmount: number
): Installment[] {
  const updated = [...installments]
  const remainingInstallmentsIdx = updated
    .map((it, idx) => ({ it, idx }))
    .filter(({ it }) => it.status !== 'paid')
    .map(({ idx }) => idx)

  if (remainingInstallmentsIdx.length === 0) return updated

  const remainingAmount = Math.max(newTotalAmount - paidAmount, 0)
  const n = remainingInstallmentsIdx.length
  const base = Math.floor((remainingAmount / n) * 100) / 100
  const remainder = Math.round((remainingAmount - base * n) * 100) / 100

  remainingInstallmentsIdx.forEach((idx, i) => {
    const add = i === remainingInstallmentsIdx.length - 1 ? remainder : 0
    updated[idx] = { ...updated[idx], amount: base + add }
  })

  return updated
}
