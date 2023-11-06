let { banco, contas, depositos, saques, transferencias } = require('../bancodedados');

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (contas.some(usuario => usuario.usuario.cpf === cpf)) {
        return res.status(400).send({ mensagem: "Esse CPF já está cadastrado em outra conta." });
    };

    if (contas.some(usuario => usuario.usuario.email === email)) {
        return res.status(400).send({ mensagem: "Esse e-mail já está cadastrado em outra conta." });
    };

    const numero_conta = contas.length + 1;
    const contaNova = {
        numero_conta,
        saldo: 0,
        usuario: { nome, cpf, data_nascimento, telefone, email, senha }
    };
    contas.push(contaNova);

    return res.status(201).send();
};


const listarContas = (req, res) => {
    const { senha_banco } = req.query;

    if (senha_banco === banco.senha) {
        return res.json(contas);
    };
};


const atualizarUsuario = (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    const conta = contas.find((conta) => {
        return conta.numero_conta === Number(numeroConta);
    });

    const cpfValidar = contas.find((conta) => {
        return conta.usuario.cpf === (cpf);
    });

    const emailValidar = contas.find((conta) => {
        return conta.usuario.email === (email);
    });

    if (!conta) {
        return res.status(404).send({ mensagem: "Conta não encontrada!" });
    };

    if ((conta.usuario.cpf === cpf || !cpfValidar) && (conta.usuario.email === email || !emailValidar)) {
        conta.usuario.cpf = cpf;
        conta.usuario.email = email;
        conta.usuario.nome = nome;
        conta.usuario.data_nascimento = data_nascimento;
        conta.usuario.telefone = telefone;
        conta.usuario.senha = senha;
        return res.status(200).send();
    };

    if ((cpfValidar.usuario.cpf !== conta.usuario.cpf) && cpfValidar) {
        return res.status(400).json({ mensagem: "Esse CPF já está cadastrado em outra conta." });
    };

    if ((emailValidar.usuario.email !== conta.usuario.email) && emailValidar) {
        return res.status(400).json({ mensagem: "Esse e-mail já está cadastrado em outra conta." });
    };
};


const excluirConta = (req, res) => {
    const { numeroConta } = req.params;

    const conta = contas.find((conta) => {
        return conta.numero_conta === Number(numeroConta);
    });

    if (!conta) {
        return res.status(404).send({ mensagem: "Conta não encontrada!" });
    };

    if (conta.saldo > 0) {
        return res.status(400).send({ mensagem: "A conta só pode ser excluída se o saldo for zero." });
    };

    contas = contas.find((conta) => {
        return conta.numero_conta !== Number(numeroConta);
    });

    return res.status(204).send();
};


const deposito = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta) {
        return res.status(400).send({ mensagem: "Informe o número da conta!" });
    };

    if (!valor) {
        return res.status(400).send({ mensagem: "Informe um valor!" });
    };

    const contaExistente = contas.find((conta) => conta.numero_conta === numero_conta);

    if (!contaExistente) {
        return res.status(400).send({ mensagem: "Conta não encontrada!" });
    };

    if (valor <= 0) {
        return res.status(400).send({ mensagem: "Não é permitido depósito com valor negativo ou zerado." });
    };

    contaExistente.saldo += valor;

    // Comprovante do Depósito
    const dataHoraAtual = new Date();
    const dataFormatada = dataHoraAtual.toLocaleDateString();
    const horaFormatada = dataHoraAtual.toLocaleTimeString();

    const comprovanteDeposito = {
        "data": dataFormatada + " " + horaFormatada,
        numero_conta,
        valor
    };
    depositos.push(comprovanteDeposito);

    return res.status(200).send();
};


const saque = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta) {
        return res.status(400).send({ mensagem: "Informe o número da conta!" });
    };

    if (!senha) {
        return res.status(400).send({ mensagem: "Informe a senha!" });
    };

    if (!valor) {
        return res.status(400).send({ mensagem: "Informe um valor!" });
    };

    const conta = contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta);
    });

    if (!conta) {
        return res.status(400).send({ mensagem: "Conta não encontrada!" });
    };

    if (conta.usuario.senha !== senha) {
        return res.status(401).send({ mensagem: "Senha incorreta!" });
    };

    if (conta.saldo < valor) {
        return res.status(400).send({ mensagem: "Saldo insuficiente!" });
    };
    conta.saldo -= valor;

    // Comprovante do Saque
    const dataHora = new Date();
    const dataAtual = dataHora.toLocaleDateString();
    const horaAtual = dataHora.toLocaleTimeString();

    const comprovanteSaque = {
        "data": dataAtual + " " + horaAtual,
        numero_conta,
        valor
    };
    saques.push(comprovanteSaque);

    return res.status(200).send();
};


const transferencia = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).send({ mensagem: "O preenchimento de todos os campos é obrigatório!" });
    };

    const contaOrigem = contas.find((conta) => {
        return conta.numero_conta == numero_conta_origem;
    });

    if (!contaOrigem) {
        return res.status(404).send({ mensagem: "Conta Origem não encontrada!" });
    };

    const contaDestino = contas.find((conta) => {
        return conta.numero_conta == numero_conta_destino;
    });

    if (!contaDestino) {
        return res.status(404).send({ mensagem: "Conta Destino não encontrada!" });
    };

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(401).send({ mensagem: "Senha incorreta!" });
    };

    if (contaOrigem.saldo < valor) {
        return res.status(400).send({ mensagem: "Saldo insuficiente!" });
    };
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    // Registro de Transferência
    const dataHora = new Date();
    const dataAtual = dataHora.toLocaleDateString();
    const horaAtual = dataHora.toLocaleTimeString();

    const comprovanteTransferencia = {
        "data": dataAtual + " " + horaAtual,
        "numero_conta_origem": contaOrigem.numero_conta,
        "numero_conta_destino": contaDestino.numero_conta,
        valor
    };
    transferencias.push(comprovanteTransferencia);

    return res.status(200).send();
};


const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta) {
        return res.status(400).send({ mensagem: "Informe o número da conta!" });
    };

    if (!senha) {
        return res.status(400).send({ mensagem: "Informe a senha!" });
    };

    const conta = contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta);
    });

    if (!conta) {
        return res.status(400).send({ mensagem: "Conta não encontrada!" });
    };

    if (conta.usuario.senha != senha) {
        return res.status(401).send({ mensagem: "Senha incorreta!" });
    };

    return res.status(200).json({ saldo: conta.saldo });
};


const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta) {
        return res.status(400).send({ mensagem: "Informe o número da conta!" });
    };

    if (!senha) {
        return res.status(400).send({ mensagem: "Informe a senha!" });
    };

    const conta = contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta);
    });

    if (!conta) {
        return res.status(400).send({ mensagem: "Conta não encontrada!" });
    };

    if (conta.usuario.senha != senha) {
        return res.status(401).send({ mensagem: "Senha incorreta!" });
    };

    const extratoDaConta = {
        deposito: depositos.filter((deposito) => {
            return deposito.numero_conta == numero_conta;
        }),
        saque: saques.filter((saque) => {
            return saque.numero_conta == numero_conta;
        }),
        transferenciaEnviada: transferencias.filter((trans) => {
            return trans.numero_conta_origem == numero_conta;
        }),
        transferenciaRecebida: transferencias.filter((trans) => {
            return trans.numero_conta_destino == numero_conta;
        })
    };

    return res.json({ extratoDaConta });
};



module.exports = {
    criarConta,
    listarContas,
    atualizarUsuario,
    excluirConta,
    deposito,
    saque,
    transferencia,
    saldo,
    extrato
};
