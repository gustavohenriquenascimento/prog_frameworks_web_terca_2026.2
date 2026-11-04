const express = require("express");
const veiculoController = require("../controllers/VeiculoController");
const validarVeiculo = require("../middlewares/validarVeiculo");

const router = express.Router();

router.post("/", validarVeiculo, veiculoController.create);
router.get("/", veiculoController.findMany);

module.exports = router;