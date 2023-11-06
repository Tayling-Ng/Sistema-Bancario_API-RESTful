const express = require('express');

const { criarConta, listarContas, atualizarUsuario, excluirConta, deposito, saque, transferencia, saldo, extrato } = require('./controladores/controladores');
const { validarSenha, preencherCampos } = require('./intermediarios');

const rotas = express();

rotas.post('/contas', preencherCampos, criarConta);
rotas.get('/contas', validarSenha, listarContas);
rotas.put('/contas/:numeroConta/usuario', preencherCampos, atualizarUsuario);
rotas.delete('/contas/:numeroConta', excluirConta);
rotas.post('/transacoes/depositar', deposito);
rotas.post('/transacoes/sacar', saque);
rotas.post('/transacoes/transferir', transferencia);
rotas.get('/contas/saldo', saldo);
rotas.get('/contas/extrato', extrato);


module.exports = rotas;