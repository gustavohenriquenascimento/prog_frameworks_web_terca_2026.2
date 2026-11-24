const express = require("express");
const locacaoController = require("../controllers/LocacaoController");
const validarLocacao = require("../middlewares/validarLocacao");
const autenticar = require("../middlewares/autenticar");

const router = express.Router();

router.use(autenticar);
router.post("/", validarLocacao, locacaoController.create);
router.get("/", locacaoController.findByUsuario);
router.patch("/:id/finalizar", locacaoController.finalize);

module.exports = router;