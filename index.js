const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");
const { ClientRequest } = require("http");
const e = require("express");

const app = express();

// midlaware
app.use(express.json()); // express usar json
app.use(cors());
app.use(bodyparser.json());

//

var conString = config.urlConnection;
var client = new Client(conString);

//
client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", function (err, result) {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

// Rotas
app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok");
});
app.get("/usuarios", (req, res) => {
  try {
    client.query("SELECT * FROM Usuarios order by id", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.send(result.rows);
      console.log("Chamou get usuarios");
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/usuarios/:id", (req, res) => {
  try {
    console.log(`Chamou o usuario: ${req.params.id}`);
    client.query(
      "select * from usuarios where id = $1",
      [req.params.id],
      (err, result) => {
        if (err) console.log(err);
        else res.send(result.rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.delete("/usuarios/:id", (req, res) => {
  try {
    client.query(
      "delete from usuarios where id = $1",
      [req.params.id],
      (err, result) => {
        if (err) console.log(err);
        else {
          if (result.rowCount == 0)
            res.status(400).json(`info: "Usuário não encontrado!"`);
          else
            res
              .status(200)
              .json(
                `info:"Usuário deletado com sucesso! ID = ${req.params.id}"`
              );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});
app.post("/usuarios", (req, res) => {
  try {
    client.query(
      "insert into usuarios (nome, email) values($1,$2) returning *",
      [req.body.nome, req.body.email],
      (err, result) => {
        if (err) console.log(err);
        else {
          res.setHeader("id", `${result.rows[0].id}`);
          res.status(201).json(result.rows[0]);
          // console.log(result);
        }
      }
    );
  } catch (err) {
    console.log(result);
  }
});

app.put("/usuarios/:id", (req, res) => {
  try {
    console.log("Chamou update", req.body);
    const id = req.params.id;
    const { nome, email } = req.body;
    client.query(
      "UPDATE Usuarios SET nome=$1, email=$2 WHERE id =$3 ",
      [nome, email, id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de UPDATE", err);
        } else {
          res.setHeader("id", id);
          res.status(202).json({ id: id });
          console.log(result);
        }
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});
// Listen
app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;