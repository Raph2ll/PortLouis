const fs = require('fs');
const path = require('path');

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