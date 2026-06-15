import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Pedido, Parcela } from '../types';
import { adicionarPedido, atualizarPedido } from '../storage';
import { gerarParcelas } from '../utils/parcelas';

interface FormularioPedidoProps {
  pedidoEdicao?: Pedido;
  onSalvar: () => void;
  onCancelar: () => void;
}

export const FormularioPedido: React.FC<FormularioPedidoProps> = ({
  pedidoEdicao,
  onSalvar,
  onCancelar,
}) => {
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<
    'pendente' | 'em-progresso' | 'concluido'
  >('pendente');
  const [dataServico, setDataServico] = useState('');
  const [dataServicoDate, setDataServicoDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [valorServico, setValorServico] = useState('');
  const [valorMaterial, setValorMaterial] = useState('');
  const [materiais, setMateriais] = useState('');

  const [telefone, setTelefone] = useState('');

  const [formaPagamento, setFormaPagamento] = useState('');

  const [statusPagamento, setStatusPagamento] = useState<
    'pendente' | 'sinal-recebido' | 'parcial' | 'pago'
  >('pendente');

  const [entrada, setEntrada] = useState('');
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('1');

  const formatarTelefone = (texto: string) => {
    const numeros = texto.replace(/\D/g, '').slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(
        6,
      )}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(
      7,
    )}`;
  };

  const formatarMoeda = (valor: string) => {
    const numero = valor.replace(/\D/g, '');

    const valorFormatado = (Number(numero) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return valorFormatado;
  };

  const converterValor = (valor: string) => {
    return Number(
      valor
        .replace('R$', '')
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.'),
    );
  };

  const valorTotal =
    converterValor(valorServico) + converterValor(valorMaterial);

  const parcelas = gerarParcelas(
    valorTotal,
    converterValor(entrada),
    Number(quantidadeParcelas),
  );

  useEffect(() => {
    if (pedidoEdicao) {
      setCliente(pedidoEdicao.cliente || '');
      setEndereco(pedidoEdicao.endereco || '');
      setTipoServico(pedidoEdicao.tipoServico || '');
      setDescricao(pedidoEdicao.descricao || '');

      setStatus(pedidoEdicao.status || 'pendente');

      setDataServico(pedidoEdicao.dataServico || '');

      setDataServicoDate(
        pedidoEdicao.dataServico
          ? new Date(pedidoEdicao.dataServico)
          : new Date(),
      );

      setTelefone(pedidoEdicao.telefone || '');

      setMateriais(pedidoEdicao.materiais || '');

      setValorServico(
        pedidoEdicao.valorServico
          ? pedidoEdicao.valorServico.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '',
      );

      setValorMaterial(
        pedidoEdicao.valorMaterial
          ? pedidoEdicao.valorMaterial.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '',
      );

      setFormaPagamento(pedidoEdicao.formaPagamento || '');

      setStatusPagamento(pedidoEdicao.statusPagamento || 'pendente');

      setEntrada(
        pedidoEdicao.parcelas
          ?.find(p => p.id === 'entrada')
          ?.valor?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }) || '',
      );

      setQuantidadeParcelas(
        pedidoEdicao.parcelas
          ? String(pedidoEdicao.parcelas.filter(p => p.id !== 'entrada').length)
          : '1',
      );

      setTipoPagamento(
        pedidoEdicao.parcelas && pedidoEdicao.parcelas.length > 0
          ? 'parcelado'
          : 'avista',
      );
    } else {
      setCliente('');
      setEndereco('');
      setTipoServico('');
      setDescricao('');
      setStatus('pendente');

      setDataServico('');
      setDataServicoDate(new Date());

      setTelefone('');
      setMateriais('');

      setValorServico('');
      setValorMaterial('');

      setFormaPagamento('');

      setStatusPagamento('pendente');
    }
  }, [pedidoEdicao]);

  const validarFormulario = (): boolean => {
    if (!cliente.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do cliente');
      return false;
    }
    if (!endereco.trim()) {
      Alert.alert('Erro', 'Por favor, insira o endereço da obra');
      return false;
    }
    if (!tipoServico.trim()) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de serviço');
      return false;
    }
    return true;
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      return;
    }

    const currentDate = selectedDate || dataServicoDate;
    setDataServicoDate(currentDate);
    setDataServico(currentDate.toISOString());
  };

  const formatDataDisplay = (data?: string) =>
    data ? new Date(data).toLocaleDateString('pt-BR') : 'Selecionar data';

  const [tipoPagamento, setTipoPagamento] = useState<'avista' | 'parcelado'>(
    'avista',
  );

  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setCarregando(true);

      const valorServicoNumero = converterValor(valorServico);
      const valorMaterialNumero = converterValor(valorMaterial);

      let parcelas: Parcela[] = pedidoEdicao?.parcelas || [];

      if (
        tipoPagamento === 'parcelado' &&
        (!pedidoEdicao || parcelas.length === 0)
      ) {
        parcelas = gerarParcelas(
          valorTotal,
          converterValor(entrada),
          Number(quantidadeParcelas),
        );
      }

      if (pedidoEdicao) {
        await atualizarPedido(pedidoEdicao.id, {
          cliente,
          endereco,
          tipoServico,
          descricao,
          status,
          dataServico,
          telefone,
          materiais,
          valorServico: valorServicoNumero,
          valorMaterial: valorMaterialNumero,
          valorTotal,
          formaPagamento,
          statusPagamento,
          parcelas,
        });
      } else {
        const novoPedido: Pedido = {
          id: Date.now().toString(),
          cliente,
          endereco,
          tipoServico,
          descricao,
          status,
          dataServico,
          dataCriacao: new Date().toISOString(),
          telefone,
          materiais,
          valorServico: valorServicoNumero,
          valorMaterial: valorMaterialNumero,
          valorTotal,
          formaPagamento,
          statusPagamento,
          parcelas,
        };
        await adicionarPedido(novoPedido);
      }

      Alert.alert(
        'Sucesso',
        pedidoEdicao ? 'Pedido atualizado!' : 'Pedido criado com sucesso!',
      );
      onSalvar();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o pedido');
    } finally {
      setCarregando(false);
    }
  };

  const tiposServico = [
    'Reforma Completa',
    'Pintura',
    'Reboco',
    'Alvenaria',
    'Cobertura',
    'Piso',
    'Hidráulica',
    'Elétrica',
    'Outros',
  ];

  const formasPagamento = ['Pix', 'Dinheiro', 'Cartão'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>
          {pedidoEdicao ? 'Editar Pedido' : 'Novo Pedido'}
        </Text>

        <View style={styles.grupo}>
          <Text style={styles.label}>Nome do Cliente *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: João da Silva"
            value={cliente}
            onChangeText={setCliente}
            placeholderTextColor="#AAA"
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Telefone</Text>

          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={texto => setTelefone(formatarTelefone(texto))}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Endereço da Obra *</Text>
          <TextInput
            style={[styles.input, styles.inputGrande]}
            placeholder="Ex: Rua Principal, 123 - Centro"
            value={endereco}
            onChangeText={setEndereco}
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* <View style={styles.grupo}>
          <Text style={styles.label}>Tipo de Serviço *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoServico}
              onValueChange={setTipoServico}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um serviço..." value="" />
              {tiposServico.map((tipo) => (
                <Picker.Item key={tipo} label={tipo} value={tipo} />
              ))}
            </Picker>
          </View>
        </View> */}

        <View style={styles.servicosContainer}>
          {tiposServico.map(tipo => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.servicoChip,
                tipoServico === tipo && styles.servicoChipAtivo,
              ]}
              onPress={() => setTipoServico(tipo)}
            >
              <Text
                style={[
                  styles.servicoChipTexto,
                  tipoServico === tipo && styles.servicoChipTextoAtivo,
                ]}
              >
                {tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Tipo de Pagamento</Text>

          <View style={styles.servicosContainer}>
            <TouchableOpacity
              style={[
                styles.servicoChip,
                tipoPagamento === 'avista' && styles.servicoChipAtivo,
              ]}
              onPress={() => setTipoPagamento('avista')}
            >
              <Text
                style={[
                  styles.servicoChipTexto,
                  tipoPagamento === 'avista' && styles.servicoChipTextoAtivo,
                ]}
              >
                À Vista
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.servicoChip,
                tipoPagamento === 'parcelado' && styles.servicoChipAtivo,
              ]}
              onPress={() => setTipoPagamento('parcelado')}
            >
              <Text
                style={[
                  styles.servicoChipTexto,
                  tipoPagamento === 'parcelado' && styles.servicoChipTextoAtivo,
                ]}
              >
                Parcelado
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {tipoPagamento === 'parcelado' && (
          <>
            <View style={styles.grupo}>
              <Text style={styles.label}>Valor de Entrada</Text>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="R$ 0,00"
                value={entrada}
                onChangeText={texto => setEntrada(formatarMoeda(texto))}
              />
            </View>

            <View style={styles.grupo}>
              <Text style={styles.label}>Quantidade de Parcelas</Text>

              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Ex: 3"
                value={quantidadeParcelas}
                onChangeText={setQuantidadeParcelas}
              />
            </View>
          </>
        )}

        <View style={styles.grupo}>
          <Text style={styles.label}>Valor da Mão de Obra</Text>

          <TextInput
            style={styles.inputValor}
            keyboardType="numeric"
            placeholder="R$ 0,00"
            value={valorServico}
            onChangeText={texto => setValorServico(formatarMoeda(texto))}
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Valor dos Materiais</Text>

          <TextInput
            style={styles.inputValor}
            keyboardType="numeric"
            placeholder="R$ 0,00"
            value={valorMaterial}
            onChangeText={texto => setValorMaterial(formatarMoeda(texto))}
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Forma de Pagamento</Text>

          <View style={styles.servicosContainer}>
            {formasPagamento.map(forma => (
              <TouchableOpacity
                key={forma}
                style={[
                  styles.servicoChip,
                  formaPagamento === forma && styles.servicoChipAtivo,
                ]}
                onPress={() => setFormaPagamento(forma)}
              >
                <Text
                  style={[
                    styles.servicoChipTexto,
                    formaPagamento === forma && styles.servicoChipTextoAtivo,
                  ]}
                >
                  {forma}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Materiais</Text>
          <TextInput
            style={[styles.input, styles.inputGrande]}
            multiline
            numberOfLines={4}
            placeholder="Ex: 10 sacos de cimento, 3 latas de tinta..."
            value={materiais}
            onChangeText={setMateriais}
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Descrição (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.inputGrande]}
            placeholder="Detalhes adicionais do trabalho..."
            value={descricao}
            onChangeText={setDescricao}
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.grupo}>
          <Text style={styles.label}>Data do Serviço (Opcional)</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateSelectorText}>
              {formatDataDisplay(dataServico)}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dataServicoDate}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total do Serviço</Text>

          <Text style={styles.totalValor}>R$ {valorTotal.toFixed(2)}</Text>
        </View>

        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={[styles.botao, styles.botaoCancelar]}
            onPress={onCancelar}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botao, styles.botaoSalvar]}
            onPress={handleSalvar}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>
              {carregando ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  conteudo: {
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
  grupo: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#CCC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#111',
  },
  inputGrande: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  dateSelector: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  dateSelectorText: {
    color: '#444',
    fontSize: 16,
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  botao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#ee1616',
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    minHeight: 56,
  },
  textoBotao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  servicosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  servicoChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  servicoChipAtivo: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  servicoChipTexto: {
    color: '#333',
    fontWeight: '500',
  },

  servicoChipTextoAtivo: {
    color: '#FFF',
  },

  totalContainer: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },

  totalLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 6,
    fontWeight: '600',
  },

  totalValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
  },

  inputValor: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
});
