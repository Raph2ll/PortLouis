const fs = require('fs');
const path = require('path');

let dataPedidos = fs.readFileSync(`allPedidos.json`).toString('utf-8').replace(/^\uFEFF/, '');
let dataNotas = fs.readFileSync(`allNotas.json`).toString('utf-8').replace(/^\uFEFF/, '');

// Pedidos

const Pedidos = () => {
  const directoryPath = path.join(__dirname, 'Pedidos');

  let jsonStr = '{"Pedido1": [],"Pedido2": [], "Pedido3": [], "Pedido4": [], "Pedido5": []}';
  let obj = JSON.parse(jsonStr);

  fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach((file, index) => {
      let data = fs.readFileSync(`./Pedidos/${file}`).toString('utf-8').replace(/^\uFEFF/, '');
      let allLines = data.split('\n');

      allLines.forEach((line) => {

        const element = JSON.parse(line);

        element['valor_unitário_produto'] = parseFloat(element['valor_unitário_produto'].replace(",", "."));

        obj[`Pedido${index + 1}`].push(element);
      });
    })
    //Add JSON to a file
    fs.writeFileSync('./allPedidos.json', JSON.stringify(obj))
  });
}

Pedidos()


//Notas

const Notas = () => {
  const directoryPath = path.join(__dirname, 'Notas');

  let jsonStr = '{"Nota1": [],"Nota2": [], "Nota3": [], "Nota4": [], "Nota5": [], "Nota6": [], "Nota7": [], "Nota8": [], "Nota9": []}';
  let obj = JSON.parse(jsonStr);

  fs.readdir(directoryPath, (err, files) => {
    //handling error
    if (err) {
      throw new Error('Unable to scan directory: ' + err);
    }
    //listing all files using forEach
    files.forEach((file, index) => {
      let data = fs.readFileSync(`./Notas/${file}`).toString('utf-8').replace(/^\uFEFF/, '');
      let allLines = data.split('\n');

      allLines.forEach((line) => {
        obj[`Nota${index + 1}`].push(JSON.parse(line));
      })
    })
    //Add JSON to a file
    fs.writeFileSync('./allNotas.json', JSON.stringify(obj))
  });
}

Notas()


// Cruzamento de pedidos e notas

let parsePedidos = JSON.parse(dataPedidos)
let parseNotas = JSON.parse(dataNotas)

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
        throw new Error(`A quantidade atendida para o item ${item.número_item} do pedido ${pedido} é maior que a quantidade do item no pedido`);
      }
    }

    if (pedidoPendente) {
      pedidosPendentes.push({ pedido, valorTotalPedido, itensPendentes });
    }
  }
  fs.writeFileSync('./allPendentes.txt', JSON.stringify(pedidosPendentes))
  return pedidosPendentes
}

isPending(parseNotas, parsePedidos)
