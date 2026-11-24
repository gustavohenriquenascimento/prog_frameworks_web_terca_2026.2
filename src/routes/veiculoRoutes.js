const express = require("express");
const veiculoController = require("../controllers/VeiculoController");
const autenticar = require("../middlewares/autenticar");
const validarDisponibilidade = require("../middlewares/validarDisponibilidade");
const validarVeiculo = require("../middlewares/validarVeiculo");

const router = express.Router();

router.use(autenticar);
router.post("/", validarVeiculo, veiculoController.create);
router.get("/", validarDisponibilidade, veiculoController.findMany);

module.exports = router;