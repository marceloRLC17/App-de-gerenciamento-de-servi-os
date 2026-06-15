import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedido } from './types';

const STORAGE_KEY = '@tempapp:pedidos';

const getPedidosSalvos = async (): Promise<Pedido[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as Pedido[]) : [];
  } catch (error) {
    console.error('Erro ao carregar pedidos do AsyncStorage:', error);
    return [];
  }
};

export const salvarPedidos = async (pedidos: Pedido[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
  } catch (error) {
    console.error('Erro ao salvar pedidos no AsyncStorage:', error);
    throw error;
  }
};

export const carregarPedidos = async (): Promise<Pedido[]> => {
  return getPedidosSalvos();
};

export const adicionarPedido = async (pedido: Pedido): Promise<void> => {
  try {
    const pedidos = await carregarPedidos();
    await salvarPedidos([...pedidos, pedido]);
  } catch (error) {
    console.error('Erro ao adicionar pedido:', error);
    throw error;
  }
};

export const atualizarPedido = async (id: string, pedidoAtualizado: Partial<Pedido>): Promise<void> => {
  try {
    const pedidos = await carregarPedidos();
    const index = pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
      const atualizados = [...pedidos];
      atualizados[index] = { ...atualizados[index], ...pedidoAtualizado };
      await salvarPedidos(atualizados);
    }
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }
};

export const deletarPedido = async (id: string): Promise<void> => {
  try {
    const pedidos = await carregarPedidos();
    const filtrados = pedidos.filter(p => p.id !== id);
    await salvarPedidos(filtrados);
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    throw error;
  }
};
