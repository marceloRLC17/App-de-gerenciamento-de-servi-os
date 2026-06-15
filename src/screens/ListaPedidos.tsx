import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Pedido } from '../types';
import { carregarPedidos, deletarPedido } from '../storage';
import { Linking } from 'react-native';

interface ListaPedidosProps {
  onAdicionarPress: () => void;
  onEditarPress: (pedido: Pedido) => void;
  onVerDetalhes: (pedido: Pedido) => void;
}

const getStatusOrder = (status: 'pendente' | 'em-progresso' | 'concluido') => {
  switch (status) {
    case 'pendente':
      return 0;
    case 'em-progresso':
      return 1;
    case 'concluido':
      return 2;
    default:
      return 3;
  }
};

const enviarWhatsApp = (pedido: Pedido) => {
  if (!pedido.telefone) {
    Alert.alert('Aviso', 'Esse cliente não possui telefone cadastrado');
    return;
  }

  const telefoneLimpo = pedido.telefone.replace(/\D/g, '');

  const mensagem = `
Mensagem automática

Olá ${pedido.cliente}! 👋

Segue abaixo informações do pedido.

📌 Serviço: ${pedido.tipoServico}
📍 Endereço: ${pedido.endereco}

🛠️ Materiais: ${pedido.materiais || 'Nenhum'}

${
  pedido.descricao && pedido.descricao.trim() !== ''
    ? `📃 Descrição: ${pedido.descricao}`
    : ''
}

💰 Total: R$ ${Number(pedido.valorTotal || 0)
    .toFixed(2)
    .replace('.', ',')}

💳 Forma de pagamento: ${pedido.formaPagamento}

${
  pedido.dataServico
    ? `📅 Data do serviço: ${new Date(pedido.dataServico).toLocaleDateString(
        'pt-BR',
      )}`
    : ''
}

⚠️ Esta é uma mensagem automática. 
Para dúvidas ou alterações, responda este WhatsApp.
`;

  const url = `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(
    mensagem,
  )}`;

  Linking.openURL(url);
};

export const ListaPedidos: React.FC<ListaPedidosProps> = ({
  onAdicionarPress,
  onEditarPress,
  onVerDetalhes,
}) => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'pendente' | 'em-progresso' | 'concluido'
  >('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [ordem, setOrdem] = useState<'data' | 'prioridade'>('data');

  useEffect(() => {
    carregarPedidosDoStorage();
  }, []);

  const carregarPedidosDoStorage = async () => {
    try {
      setCarregando(true);
      const dados = await carregarPedidos();
      setPedidos(dados);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os pedidos');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = (id: string) => {
    Alert.alert(
      'Deletar Pedido',
      'Tem certeza que deseja deletar este pedido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletarPedido(id);
              carregarPedidosDoStorage();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar o pedido');
            }
          },
        },
      ],
    );
  };

  const statusCor = (status: string) => {
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

  const pedidosFiltrados = useMemo(() => {
    const consulta = searchQuery.trim().toLowerCase();
    const filtradosPorBusca = pedidos.filter(
      pedido =>
        pedido.cliente.toLowerCase().includes(consulta) ||
        pedido.endereco.toLowerCase().includes(consulta),
    );

    const filtradosPorStatus =
      filtroStatus === 'todos'
        ? filtradosPorBusca
        : filtradosPorBusca.filter(pedido => pedido.status === filtroStatus);

    return [...filtradosPorStatus].sort((a, b) => {
      if (ordem === 'prioridade') {
        const prioridade = getStatusOrder(a.status) - getStatusOrder(b.status);
        if (prioridade !== 0) {
          return prioridade;
        }
      }

      const dataA = new Date(a.dataServico || a.dataCriacao).getTime();
      const dataB = new Date(b.dataServico || b.dataCriacao).getTime();
      return dataA - dataB;
    });
  }, [pedidos, searchQuery, filtroStatus, ordem]);

  const renderPedido = ({ item }: { item: Pedido }) => (
    <TouchableOpacity
      style={styles.cartaoPedido}
      onPress={() => onVerDetalhes(item)}
      activeOpacity={0.85}
    >
      <View style={styles.cabecalhoPedido}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nomeCliente}>{item.cliente}</Text>
          <Text style={styles.endereco}>{item.endereco}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusCor(item.status) },
          ]}
        >
          <Text style={styles.statusTexto}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.tipoServico}>{item.tipoServico}</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Valor</Text>
          <Text style={styles.infoValor}>
            R${' '}
            {Number(item.valorTotal || 0)
              .toFixed(2)
              .replace('.', ',')}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Pagamento</Text>
          <Text
            style={[
              styles.pagamentoStatus,
              {
                color: item.statusPagamento === 'pago' ? '#4CAF50' : '#FF9800',
              },
            ]}
          >
            {item.statusPagamento || 'pendente'}
          </Text>
        </View>
      </View>

      <Text style={styles.formaPagamento}>
        Forma de pagamento: {item.formaPagamento || 'Não informado'}
      </Text>

      <Text style={styles.data}></Text>

      <View style={styles.rodapePedido}>
        <View style={styles.rodapeAcoes}>
          <TouchableOpacity
            style={[styles.btnWhats, styles.btnMini]}
            onPress={() => enviarWhatsApp(item)}
          >
            <Text style={styles.textoBotaoWhats}>WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.btnDeletar}
          onPress={() => handleDeletar(item.id)}
        >
          <Text style={styles.textoDeletar}>Deletar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (carregando) {
    return (
      <View style={styles.containerCarregando}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente ou endereço"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {pedidos.length === 0 ? (
          <View style={styles.containerVazio}>
            <Text style={styles.textoVazio}>Nenhum pedido cadastrado</Text>
            <TouchableOpacity
              style={styles.botaoPrimario}
              onPress={onAdicionarPress}
            >
              <Text style={styles.textoBotao}>+ Novo Pedido</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.filtroContainer}>
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'pendente', label: 'Pendente' },
                { key: 'em-progresso', label: 'Em Progresso' },
                { key: 'concluido', label: 'Concluído' },
              ].map(item => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.filtroBotao,
                    filtroStatus === item.key && styles.filtroBotaoAtivo,
                  ]}
                  onPress={() => setFiltroStatus(item.key as any)}
                >
                  <Text
                    style={[
                      styles.filtroTexto,
                      filtroStatus === item.key && styles.filtroTextoAtivo,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filtroOrdenacaoContainer}>
              <TouchableOpacity
                style={[
                  styles.filtroBotao,
                  ordem === 'data' && styles.filtroBotaoAtivo,
                ]}
                onPress={() => setOrdem('data')}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    ordem === 'data' && styles.filtroTextoAtivo,
                  ]}
                >
                  Ordenar por data
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filtroBotao,
                  ordem === 'prioridade' && styles.filtroBotaoAtivo,
                ]}
                onPress={() => setOrdem('prioridade')}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    ordem === 'prioridade' && styles.filtroTextoAtivo,
                  ]}
                >
                  Ordenar por prioridade
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pedidosFiltrados}
              renderItem={renderPedido}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.lista}
              refreshControl={
                <RefreshControl
                  refreshing={carregando}
                  onRefresh={carregarPedidosDoStorage}
                  colors={['#2196F3']}
                />
              }
              ListEmptyComponent={
                <View style={styles.containerVazio}>
                  <Text style={styles.textoVazio}>
                    Nenhum pedido encontrado para o filtro atual.
                  </Text>
                </View>
              }
            />
            <TouchableOpacity
              style={styles.botaoFlutante}
              onPress={onAdicionarPress}
            >
              <Text style={styles.textoBotaoFlutante}>+</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  containerCarregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerVazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoVazio: {
    fontSize: 18,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  lista: {
    padding: 16,
    paddingBottom: 80,
  },
  cartaoPedido: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cabecalhoPedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nomeCliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  endereco: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTexto: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  tipoServico: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 12,
  },
  rodapePedido: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  data: {
    fontSize: 12,
    color: '#999',
  },
  btnDeletar: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  textoDeletar: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  botaoPrimario: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  textoBotao: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoFlutante: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  textoBotaoFlutante: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchInput: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  rodapeAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnMini: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  btnSecundario: {
    backgroundColor: '#EEE',
    borderRadius: 8,
  },
  textoBotaoSecundario: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filtroContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filtroOrdenacaoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filtroBotao: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filtroBotaoAtivo: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filtroTexto: {
    fontSize: 12,
    color: '#333',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  filtroTextoAtivo: {
    color: '#FFF',
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 2,
  },

  infoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },

  pagamentoStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  formaPagamento: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },

  btnWhats: {
    backgroundColor: '#25D366',
    borderRadius: 8,
  },

  textoBotaoWhats: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
