import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, BackHandler } from 'react-native';
import { ListaPedidos } from './src/screens/ListaPedidos';
import { FormularioPedido } from './src/screens/FormularioPedido';
import { DetalhesPedido } from './src/screens/DetalhesPedido';
import { Pedido, Parcela } from './src/types';
import { atualizarPedido, salvarPedidos } from './src/storage';

type TelaAtual = 'lista' | 'formulario' | 'detalhes';

function App(): React.JSX.Element {
  const [telaAtual, setTelaAtual] = useState<TelaAtual>('lista');
  const [pedidoEdicao, setPedidoEdicao] = useState<Pedido | undefined>();
  const [pedidoDetalhes, setPedidoDetalhes] = useState<Pedido | undefined>();

  const atualizarParcela = async (
    pedidoId: string,
    parcelaId: string,
    status: 'pendente' | 'pago',
  ) => {
    if (!pedidoDetalhes) {
      return;
    }

    const parcelasAtualizadas = pedidoDetalhes.parcelas?.map(
      (parcela: Parcela) => {
        if (parcela.id !== parcelaId) {
          return parcela;
        }

        return {
          ...parcela,
          status,
          dataPagamento:
            status === 'pago' ? new Date().toISOString() : undefined,
        };
      },
    );

    await atualizarPedido(pedidoId, {
      parcelas: parcelasAtualizadas,
    });

    setPedidoDetalhes({
      ...pedidoDetalhes,
      parcelas: parcelasAtualizadas,
    });
  };

  useEffect(() => {
    const backAction = () => {
      if (telaAtual === 'formulario' || telaAtual === 'detalhes') {
        setTelaAtual('lista');
        setPedidoEdicao(undefined);
        setPedidoDetalhes(undefined);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [telaAtual]);

  const handleAdicionarPedido = () => {
    setPedidoEdicao(undefined);
    setTelaAtual('formulario');
  };

  const handleEditarPedido = (pedido: Pedido) => {
    setPedidoEdicao(pedido);
    setTelaAtual('formulario');
  };

  const handleVerDetalhes = (pedido: Pedido) => {
    setPedidoDetalhes(pedido);
    setTelaAtual('detalhes');
  };

  const handleSalvar = () => {
    setTelaAtual('lista');
    setPedidoEdicao(undefined);
    setPedidoDetalhes(undefined);
  };

  const handleCancelar = () => {
    setTelaAtual('lista');
    setPedidoEdicao(undefined);
    setPedidoDetalhes(undefined);
  };

  const handleVoltarDetalhes = () => {
    setTelaAtual('lista');
    setPedidoDetalhes(undefined);
  };

  const handleEditarFromDetalhes = (pedido: Pedido) => {
    setPedidoEdicao(pedido);
    setTelaAtual('formulario');
  };

  const handleAtualizarStatus = async (
    pedidoId: string,
    novoStatus: 'pendente' | 'em-progresso' | 'concluido',
  ) => {
    try {
      await atualizarPedido(pedidoId, { status: novoStatus });
      if (pedidoDetalhes) {
        setPedidoDetalhes({ ...pedidoDetalhes, status: novoStatus });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleAtualizarStatusPagamento = async (
    pedidoId: string,
    novoStatusPagamento: 'pendente' | 'sinal-recebido' | 'parcial' | 'pago',
  ) => {
    try {
      await atualizarPedido(pedidoId, {
        statusPagamento: novoStatusPagamento,
      });

      if (pedidoDetalhes) {
        setPedidoDetalhes({
          ...pedidoDetalhes,
          statusPagamento: novoStatusPagamento,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      {telaAtual === 'lista' && (
        <ListaPedidos
          onAdicionarPress={handleAdicionarPedido}
          onEditarPress={handleEditarPedido}
          onVerDetalhes={handleVerDetalhes}
        />
      )}
      {telaAtual === 'formulario' && (
        <FormularioPedido
          pedidoEdicao={pedidoEdicao}
          onSalvar={handleSalvar}
          onCancelar={handleCancelar}
        />
      )}
      {telaAtual === 'detalhes' && pedidoDetalhes && (
        <DetalhesPedido
          pedido={pedidoDetalhes}
          onVoltar={handleVoltarDetalhes}
          onEditar={handleEditarFromDetalhes}
          onAtualizarStatus={handleAtualizarStatus}
          onAtualizarStatusPagamento={handleAtualizarStatusPagamento}
          onAtualizarParcela={atualizarParcela}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default App;
