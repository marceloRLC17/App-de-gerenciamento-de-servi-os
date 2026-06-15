export const gerarParcelas = (
  valorTotal: number,
  entrada: number,
  quantidade: number,
) => {
  const restante = valorTotal - entrada;

  const valorParcela = restante / quantidade;

  const parcelas = [];

  for (let i = 0; i < quantidade; i++) {
    const vencimento = new Date();

    vencimento.setMonth(vencimento.getMonth() + i + 1);

    parcelas.push({
      id: Date.now().toString() + i,
      valor: Number(valorParcela.toFixed(2)),
      vencimento: vencimento.toISOString(),
      status: 'pendente' as const,
    });
  }

  if (entrada > 0) {
    parcelas.unshift({
      id: 'entrada',
      valor: entrada,
      vencimento: new Date().toISOString(),
      status: 'pago' as const,
      dataPagamento: new Date().toISOString(),
    });
  }

  return parcelas;
};
