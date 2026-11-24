const ApiError = require("./ApiError");

class TokenInvalidoError extends ApiError {
    constructor(message = "Token de acesso inválido.", statusCode = 401) {
        super(message, statusCode, "TOKEN_INVALIDO");
    }
}

module.exports = TokenInvalidoError;
