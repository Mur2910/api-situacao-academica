const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const pasta = path.join(__dirname, "data");
const arquivo = path.join(pasta, "situacoes.json");

if (!fs.existsSync(pasta)) fs.mkdirSync(pasta);
if (!fs.existsSync(arquivo)) fs.writeFileSync(arquivo, "[]");

function ler() {
    return JSON.parse(fs.readFileSync(arquivo, "utf8"));
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

app.post("/situacao", (req, res) => {
    const { nome, unidadeCurricular, aprovado } = req.body;

    if (typeof nome !== "string" || !nome.trim() ||
        typeof unidadeCurricular !== "string" ||
        !unidadeCurricular.trim() ||
        typeof aprovado !== "boolean") {
        return res.status(400).json({ mensagem: "Dados invalidos." });
    }

    const dados = ler();
    const registro = {
        id: dados.length ? Math.max(...dados.map(x => x.id)) + 1 : 1,
        nome,
        unidadeCurricular,
        aprovado
    };

    dados.push(registro);
    salvar(dados);
    res.status(201).json(registro);
});

app.get("/situacao/:id", (req, res) => {
    const dados = ler();
    const registro = dados.find(x => x.id === Number(req.params.id));

    if (!registro) {
        return res.status(404).json({ mensagem: "Estudante nao encontrado." });
    }

    res.json(registro);
});

app.put("/situacao/:id", (req, res) => {
    if (Object.keys(req.body).length !== 1 ||
        typeof req.body.aprovado !== "boolean") {
        return res.status(400).json({ mensagem: "Informe somente aprovado." });
    }

    const dados = ler();
    const registro = dados.find(x => x.id === Number(req.params.id));

    if (!registro) {
        return res.status(404).json({ mensagem: "Estudante nao encontrado." });
    }

    registro.aprovado = req.body.aprovado;
    salvar(dados);
    res.json(registro);
});

app.delete("/situacao/:id", (req, res) => {
    const dados = ler();
    const indice = dados.findIndex(x => x.id === Number(req.params.id));

    if (indice === -1) {
        return res.status(404).json({ mensagem: "Estudante nao encontrado." });
    }

    dados.splice(indice, 1);
    salvar(dados);

    res.json({ mensagem: "Registro removido com sucesso." });
});

app.listen(3000, () => {
    console.log("API funcionando em http://localhost:3000");
});
