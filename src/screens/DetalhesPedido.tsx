import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Pedido } from '../types';

interface DetalhesPedidoProps {
  pedido: Pedido;
  onVoltar: () => void;
  onEditar: (pedido: Pedido) => void;
  onAtualizarStatus: (
    pedidoId: string,
    novoStatus: 'pendente' | 'em-progresso' | 'concluido',
  ) => void;

  onAtualizarStatusPagamento: (
    pedidoId: string,
    novoStatus: 'pendente' | 'sinal-recebido' | 'parcial' | 'pago',
  ) => void;

  onAtualizarParcela: (
    pedidoId: string,
    parcelaId: string,
    status: 'pendente' | 'pago',
  ) => void;
}

export const DetalhesPedido: React.FC<DetalhesPedidoProps> = ({
  pedido,
  onVoltar,
  onEditar,
  onAtualizarStatus,
  onAtualizarStatusPagamento,
  onAtualizarParcela,
}) => {
  const statusBtnColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return '#FF9800';
      case 'em-progresso':
        return '#2196F3';
      case 'concluido':
        return '#4CAF50';
      default:
        return '#999';
    }
  };

  const corStatusPagamento = (status?: string) => {
    switch (status) {
      case 'pago':
        return '#4CAF50';

      case 'parcial':
        return '#2196F3';

      case 'sinal-recebido':
        return '#9C27B0';

      default:
        return '#FF9800';
    }
  };

  const handleMudarStatus = (
    novoStatus: 'pendente' | 'em-progresso' | 'concluido',
  ) => {
    if (novoStatus === pedido.status) return;
    onAtualizarStatus(pedido.id, novoStatus);
    Alert.alert('Sucesso', `Status alterado para ${novoStatus}`);
  };

  const handleMudarStatusPagamento = (
    novoStatus: 'pendente' | 'sinal-recebido' | 'parcial' | 'pago',
  ) => {
    if (novoStatus === pedido.statusPagamento) {
      return;
    }

    if (novoStatus === 'pago' && pedido.parcelas?.length) {
      const existeParcelaPendente = pedido.parcelas.some(
        parcela => parcela.status !== 'pago',
      );

      if (existeParcelaPendente) {
        Alert.alert(
          'Pagamento incompleto',
          'Todas as parcelas precisam estar pagas antes de marcar o pedido como pago.',
        );

        return;
      }
    }

    onAtualizarStatusPagamento(pedido.id, novoStatus);

    Alert.alert('Sucesso', 'Status do pagamento atualizado');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Detalhes do Pedido</Text>

      <View style={styles.campo}>
        <Text style={styles.label}>Cliente</Text>
        <Text style={styles.valor}>{pedido.cliente}</Text>
      </View>

      {pedido.telefone ? (
        <View style={styles.campo}>
          <Text style={styles.label}>Telefone</Text>
          <Text style={styles.valor}>{pedido.telefone}</Text>
        </View>
      ) : null}

      <View style={styles.campo}>
        <Text style={styles.label}>Endereço</Text>
        <Text style={styles.valor}>{pedido.endereco}</Text>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Serviço</Text>
        <Text style={styles.valor}>{pedido.tipoServico}</Text>
      </View>

      {pedido.descricao ? (
        <View style={styles.campo}>
          <Text style={styles.label}>Descrição</Text>
          <Text style={styles.valor}>{pedido.descricao}</Text>
        </View>
      ) : null}

      {pedido.materiais ? (
        <View style={styles.campo}>
          <Text style={styles.label}>Materiais</Text>
          <Text style={styles.valor}>{pedido.materiais}</Text>
        </View>
      ) : null}

      <View style={styles.campo}>
        <Text style={styles.label}>Data de Criação</Text>
        <Text style={styles.valor}>
          {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
        </Text>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Data do Serviço</Text>
        <Text style={styles.valor}>
          {pedido.dataServico
            ? new Date(pedido.dataServico).toLocaleDateString('pt-BR')
            : 'Não definida'}
        </Text>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Status Atual</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusBtnColor(pedido.status) },
          ]}
        >
          <Text style={styles.statusTexto}>{pedido.status}</Text>
        </View>
      </View>

      <View style={styles.statusControlsContainer}>
        <Text style={styles.label}>Alterar Status</Text>
        <View style={styles.statusBotoesContainer}>
          <TouchableOpacity
            style={[
              styles.statusBotao,
              pedido.status === 'pendente' && styles.statusBotaoAtivo,
            ]}
            onPress={() => handleMudarStatus('pendente')}
          >
            <Text style={styles.statusBotaoTexto}>Pendente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusBotao,
              pedido.status === 'em-progresso' && styles.statusBotaoAtivo,
            ]}
            onPress={() => handleMudarStatus('em-progresso')}
          >
            <Text style={styles.statusBotaoTexto}>Em Progresso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusBotao,
              pedido.status === 'concluido' && styles.statusBotaoAtivo,
            ]}
            onPress={() => handleMudarStatus('concluido')}
          >
            <Text style={styles.statusBotaoTexto}>Concluído</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.financeiroContainer}>
        <Text style={styles.financeiroTitulo}>Resumo Financeiro</Text>

        <View style={styles.financeiroLinha}>
          <Text style={styles.financeiroLabel}>Mão de Obra</Text>

          <Text style={styles.financeiroValor}>
            {Number(pedido.valorServico || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        <View style={styles.financeiroLinha}>
          <Text style={styles.financeiroLabel}>Materiais</Text>

          <Text style={styles.financeiroValor}>
            {Number(pedido.valorMaterial || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>

        <View style={styles.financeiroTotal}>
          <Text style={styles.financeiroTotalTexto}>Total</Text>

          <Text style={styles.financeiroTotalValor}>
            {Number(pedido.valorTotal || 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
      </View>

      {pedido.parcelas && pedido.parcelas.length > 0 ? (
        <View style={styles.parcelasContainer}>
          <Text style={styles.parcelasTitulo}>Parcelas</Text>

          {pedido.parcelas.map((parcela, index) => (
            <View
              key={parcela.id}
              style={[
                styles.parcelaCard,
                parcela.status === 'pago'
                  ? styles.parcelaCardPago
                  : styles.parcelaCardPendente,
              ]}
            >
              <View style={styles.parcelaLinha}>
                <Text style={styles.parcelaNumero}>
                  {index === 0 && parcela.id === 'entrada'
                    ? 'Entrada'
                    : `${index}ª Parcela`}
                </Text>

                <Text
                  style={[
                    styles.parcelaStatus,
                    {
                      color: parcela.status === 'pago' ? '#2E7D32' : '#FF9800',
                    },
                  ]}
                >
                  {parcela.status === 'pago' ? '✓ PAGO' : 'PENDENTE'}
                </Text>
              </View>

              <Text
                style={[
                  styles.parcelaValor,
                  parcela.status === 'pago' && {
                    color: '#2E7D32',
                    textDecorationLine: 'line-through',
                  },
                ]}
              >
                {Number(parcela.valor).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>

              <Text style={styles.parcelaVencimento}>
                Vencimento:{' '}
                {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
              </Text>

              {parcela.status === 'pago' && parcela.dataPagamento ? (
                <Text style={styles.dataPagamento}>
                  Pago em{' '}
                  {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.btnParcela,
                  {
                    backgroundColor:
                      parcela.status === 'pago' ? '#FF9800' : '#4CAF50',
                  },
                ]}
                onPress={() =>
                  onAtualizarParcela(
                    pedido.id,
                    parcela.id,
                    parcela.status === 'pago' ? 'pendente' : 'pago',
                  )
                }
              >
                <Text style={styles.btnParcelaTexto}>
                  {parcela.status === 'pago'
                    ? 'Marcar como pendente'
                    : 'Marcar como pago'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      {pedido.formaPagamento ? (
        <View style={styles.campo}>
          <Text style={styles.label}>Forma de Pagamento</Text>

          <Text style={styles.valor}>{pedido.formaPagamento}</Text>
        </View>
      ) : null}

      <View style={styles.statusControlsContainer}>
        <Text style={styles.label}>Status do Pagamento</Text>

        <View style={styles.statusBotoesContainer}>
          <TouchableOpacity
            style={[
              styles.statusBotao,
              pedido.statusPagamento === 'pendente' && styles.statusBotaoAtivo,
            ]}
            onPress={() => handleMudarStatusPagamento('pendente')}
          >
            <Text style={styles.statusBotaoTexto}>Pendente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusBotao,
              pedido.statusPagamento === 'pago' && styles.statusBotaoAtivo,
            ]}
            onPress={() => handleMudarStatusPagamento('pago')}
          >
            <Text style={styles.statusBotaoTexto}>Pago</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.botoesContainer}>
        <TouchableOpacity
          style={[
            styles.botao,
            styles.botaoSecundario,
            styles.botaoMargemDireita,
          ]}
          onPress={onVoltar}
        >
          <Text style={styles.textoBotao}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, styles.botaoPrincipal]}
          onPress={() => onEditar(pedido)}
        >
          <Text style={[styles.textoBotao, styles.textoBotaoClaro]}>
            Editar
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  campo: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  label: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valor: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusTexto: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statusControlsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statusBotoesContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  statusBotao: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBotaoAtivo: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusBotaoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  botao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoMargemDireita: {
    marginRight: 12,
  },
  botaoPrincipal: {
    backgroundColor: '#2196F3',
  },
  botaoSecundario: {
    backgroundColor: '#afdc28',
  },
  textoBotao: {
    fontSize: 16,
    fontWeight: 'bold',
    borderColor: '#333',
    color: '#333',
  },
  textoBotaoClaro: {
    color: '#FFF',
  },

  financeiroContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  financeiroTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  financeiroLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  financeiroLabel: {
    fontSize: 15,
    color: '#666',
  },

  financeiroValor: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },

  financeiroTotal: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  financeiroTotalTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  financeiroTotalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  parcelasContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  parcelasTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },

  badgeStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgePago: {
    backgroundColor: '#4CAF50',
  },

  badgePendente: {
    backgroundColor: '#FF9800',
  },

  badgeTexto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  parcelaPagamento: {
    marginTop: 6,
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 13,
  },

  parcelaLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  parcelaNumero: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  parcelaStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  parcelaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },

  parcelaVencimento: {
    fontSize: 13,
    color: '#666',
  },

  btnParcela: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnParcelaTexto: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  parcelaCardPago: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },

  parcelaCardPendente: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFB300',
    borderWidth: 1,
  },

  dataPagamento: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },

  parcelaCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
});
