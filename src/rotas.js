const express = require('express');
const rotas = express();
const {listarContaBancaria, criarContas, atualizarUsuarioConta, excluirConta, depositar, sacar, transferir, saldo, extrato,} = require('./controladores/contas');

rotas.get('/contas', listarContaBancaria);
rotas.post('/contas', criarContas);
rotas.put('/contas/:id', atualizarUsuarioConta);
rotas.delete('/contas/:id', excluirConta);

rotas.post('/transacoes/depositar', depositar);
rotas.post('/transacoes/sacar', sacar);
rotas.post('/transacoes/transferir', transferir);

rotas.get('/contas/saldo', saldo);
rotas.get('/contas/extrato', extrato);



module.exports = rotas