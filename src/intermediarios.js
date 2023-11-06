let { banco } = require('./bancodedados');

const validarSenha = (req, res, next) => {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(400).send({ mensagem: "Informe a senha!" });
    }

    if (!senha_banco || senha_banco != "Cubos123Bank") {
        return res.status(401).send({ mensagem: "Senha incorreta!" });
    }

    next();
};

const preencherCampos = (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (![nome, cpf, data_nascimento, telefone, email, senha].every(field => field && field.trim())) {
        return res.status(400).send({ mensagem: "O preenchimento de todos os campos é obrigatório!" });
    }

    next();
};

module.exports = {
    validarSenha,
    preencherCampos
};