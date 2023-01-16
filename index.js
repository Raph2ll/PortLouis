const fs = require('fs');
const path = require('path');

// Cruzamento de pedidos e notas

const validateInput = (notas, pedidos) => {
  for (const nota of Object.values(notas)) {
    for (const item of nota) {

      // Validate Notas
      if (typeof item.id_pedido !== 'number' || typeof item['número_item'] !== 'number' || typeof item.quantidade_produto !== 'number') {
        throw new Error('Invalid type for one of the values in a nota item');
      }
    }
  }
  for (const pedido of Object.values(pedidos)) {
    for (const item of pedido) {

      // Validate Pedidos
      if (typeof item['número_item'] !== 'number' || typeof item['código_produto'] !== 'string' || typeof item.quantidade_produto !== 'number' || typeof item['quantidade_produto'] !== 'number') {
        throw new Error('Invalid type for one of the values in a nota item');
      }

      // Validate se não há números de itens repetidos
      if (pedido.filter(i => i.número_item === item.número_item).length > 1) {
        throw new Error(`Repeated número_item ${item.número_item} found in pedido`);
      }
    }
  }
}

try {
  let dataPedidos = fs.readFileSync(`allPedidos.json`).toString('utf-8').replace(/^\uFEFF/, '');
  let dataNotas = fs.readFileSync(`allNotas.json`).toString('utf-8').replace(/^\uFEFF/, '');

  let parsePedidos = JSON.parse(dataPedidos)
  let parseNotas = JSON.parse(dataNotas)
  validateInput(parseNotas, parsePedidos);
  console.log('O pedidos e as notas são validos');
} catch (error) {
  console.error(error.message);
}

// Geração de listagem de pedidos pendentes

const isPending = (notas, pedidos) => {
  const pedidosPendentes = [];
  for (let pedido in pedidos) {
    let pedidoPendente = false;
    let itensPendentes = [];
    let valorTotalPedido = 0;

    for (let item of pedidos[pedido]) {
      let quantidadeAtendida = 0;
      for (let nota in notas) {
        for (let itemNota of notas[nota]) {
          if (itemNota.id_pedido === Number(pedido.split("Pedido")
          [1]) && itemNota.número_item === item.número_item) {
            quantidadeAtendida += itemNota.quantidade_produto;
          }
        }
      }

      if (quantidadeAtendida < item.quantidade_produto) {

        pedidoPendente = true;
        item.quantidade_pendente = item.quantidade_produto - quantidadeAtendida;

        item.valor_total = item.quantidade_produto * item.valor_unitário_produto;

        item.valor_total_pendente = item.quantidade_pendente * item.valor_unitário_produto;

        valorTotalPedido += item.valor_total;

        itensPendentes.push(item);
      } else if (quantidadeAtendida > item.quantidade_produto) {
        throw new Error(`The quantity fulfilled for the item ${item.número_item} of the order ${pedido} is greater than the quantity of the item in the order`);
      }
    }

    if (pedidoPendente) {
      pedidosPendentes.push({ pedido, valorTotalPedido, itensPendentes });
    }
  }
  fs.writeFileSync('./allPendentes.txt', JSON.stringify(pedidosPendentes))
  return pedidosPendentes
}

try {

  let parsePedidos = JSON.parse(dataPedidos)
  let parseNotas = JSON.parse(dataNotas)
  isPending(parseNotas, parsePedidos)
  console.log('Pedidos pendentes');
} catch (error) {
  console.error(error.message);
}