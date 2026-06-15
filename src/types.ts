export interface Parcela {
  id: string;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago';
  dataPagamento?: string;
}

export interface Pedido {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  tipoServico: string;
  materiais: string;
  dataCriacao: string;
  dataServico?: string;
  descricao?: string;
  status: 'pendente' | 'em-progresso' | 'concluido';

  valorServico?: number;
  valorMaterial?: number;
  valorTotal?: number;

  formaPagamento?: string;

  statusPagamento?: 'pendente' | 'sinal-recebido' | 'parcial' | 'pago';

  observacoes?: string;

  parcelas?: Parcela[];

}
