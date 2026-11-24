const ApiError = require("./ApiError");

class UsuarioNaoEncontradoError extends ApiError {
    constructor(message = "Usuário não encontrado", statusCode = 404) {
        super(message, statusCode, "USUARIO_NAO_ENCONTRADO");
    }
}

module.exports = UsuarioNaoEncontradoError;