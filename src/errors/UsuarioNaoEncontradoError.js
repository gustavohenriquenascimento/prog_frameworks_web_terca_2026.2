const ApiError = require("./ApiError");

class UsuarioNaoEncontradoError extends ApiError {
    constructor(message = "Usuário não encontrado", statusCode = 404) {
        super(message, statusCode);
    }
}

module.exports = UsuarioNaoEncontradoError;