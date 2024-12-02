import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para salvar um produto no AsyncStorage
const salvarProdutoAsync = async (produto) => {
  try {
    const produtoString = JSON.stringify(produto); // Converte o produto para uma string JSON
    await AsyncStorage.setItem(`produto_${produto.codigo}`, produtoString); // Salva o produto no AsyncStorage
  } catch (error) {
    console.error("Erro ao salvar produto no AsyncStorage:", error);
  }
};

// Função para remover um produto do AsyncStorage
const removerProdutoAsync = async (codigo) => {
  try {
    await AsyncStorage.removeItem(`produto_${codigo}`); // Remove o produto usando seu código
  } catch (error) {
    console.error("Erro ao remover produto no AsyncStorage:", error);
  }
};

// Função para carregar todos os produtos do AsyncStorage
const carregarProdutosAsync = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys(); // Obtém todas as chaves armazenadas no AsyncStorage
    const produtos = [];
    
    // Itera sobre todas as chaves e carrega os produtos
    for (let key of keys) {
      if (key.startsWith('produto_')) {
        const produtoString = await AsyncStorage.getItem(key); // Carrega o produto
        const produto = JSON.parse(produtoString); // Converte a string de volta para um objeto
        produtos.push(produto); // Adiciona o produto à lista
      }
    }
    
    return produtos; // Retorna a lista de produtos
  } catch (error) {
    console.error("Erro ao carregar produtos do AsyncStorage:", error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};

export default {
  salvarProdutoAsync,
  removerProdutoAsync,
  carregarProdutosAsync,
};

import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import ProdutoAsyncStorage from './ProdutoAsyncStorage';  // Importa a lógica de AsyncStorage para gerenciar produtos

const App = () => {
  const [nome, setNome] = useState(''); // Nome do ingrediente
  const [quantidade, setQuantidade] = useState(''); // Quantidade do ingrediente
  const [produtos, setProdutos] = useState([]); // Lista de produtos

  // Função para adicionar um ingrediente (produto)
  const handleAddProduct = async () => {
    if (!nome || !quantidade) {
      // Valida se o nome e a quantidade foram preenchidos
      Alert.alert('Erro', 'Por favor, insira o nome e a quantidade do ingrediente.');
      return;
    }

    const novoProduto = {
      codigo: Date.now(), // Gerar um código único baseado no timestamp
      nome,
      quantidade: parseInt(quantidade), // Converte a quantidade para número
    };

    // Salva o produto no AsyncStorage
    await ProdutoAsyncStorage.salvarProdutoAsync(novoProduto);

    // Limpa os campos de entrada após adicionar
    setNome('');
    setQuantidade('');
    loadProdutos(); // Atualiza a lista de produtos
  };

  // Função para carregar os produtos do AsyncStorage
  const loadProdutos = async () => {
    const produtos = await ProdutoAsyncStorage.carregarProdutosAsync(); // Obtém a lista de produtos
    setProdutos(produtos); // Atualiza o estado com a lista de produtos
  };

  // Função para remover um ingrediente (produto)
  const handleRemoveProduct = async (codigo) => {
    await ProdutoAsyncStorage.removerProdutoAsync(codigo); // Remove o produto pelo código
    loadProdutos(); // Atualiza a lista de produtos após remoção
  };

  // Carrega os produtos ao montar o componente
  useEffect(() => {
    loadProdutos(); // Chama a função de carregamento
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Nome do Ingrediente"
        value={nome}
        onChangeText={setNome} // Atualiza o estado do nome do ingrediente
        style={styles.input}
      />
      <TextInput
        placeholder="Quantidade"
        value={quantidade}
        onChangeText={setQuantidade} // Atualiza o estado da quantidade do ingrediente
        keyboardType="numeric" // Exibe teclado numérico
        style={styles.input}
      />
      <Button title="Adicionar Ingrediente" onPress={handleAddProduct} /> {/* Botão para adicionar o ingrediente */}

      {/* Lista de produtos */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.codigo.toString()} // Usa o código do produto como chave única
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text>{item.nome} - {item.quantidade} unidades</Text>
            <Button
              title="Remover"
              onPress={() => handleRemoveProduct(item.codigo)} // Botão para remover o produto
            />
          </View>
        )}
      />
    </View>
  );
};

// Estilos para o aplicativo
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  productItem: {
    marginBottom: 15,
  },
});

export default App;
