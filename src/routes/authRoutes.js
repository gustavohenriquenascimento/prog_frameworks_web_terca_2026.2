const express = require("express");
const usuarioController = require("../controllers/UsuarioController");
const autenticar = require("../middlewares/autenticar");
const validarCorpo = require("../middlewares/validarCorpo");
const { usuarioCadastroSchema, usuarioLoginSchema } = require("../schemas/usuarioSchema");

const router = express.Router();

router.post("/register", validarCorpo(usuarioCadastroSchema), usuarioController.register);
router.post("/login", validarCorpo(usuarioLoginSchema), usuarioController.login);
router.get("/me", autenticar, usuarioController.me);

module.exports = router;
