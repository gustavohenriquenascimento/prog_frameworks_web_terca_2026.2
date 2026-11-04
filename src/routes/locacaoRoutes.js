const express = require("express");
const locacaoController = require("../controllers/LocacaoController");
const validarLocacao = require("../middlewares/validarLocacao");
const validarUsuarioId = require("../middlewares/validarUsuarioId");

const router = express.Router();

router.post("/", validarLocacao, locacaoController.create);
router.get("/", validarUsuarioId, locacaoController.findByUsuario);
router.patch("/:id/finalizar", locacaoController.finalize);

module.exports = router;