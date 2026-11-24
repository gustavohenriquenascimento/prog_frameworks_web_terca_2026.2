const ApiError = require("./ApiError");

class TokenExpiradoError extends ApiError {
    constructor(message = "O token de acesso expirou.", statusCode = 401) {
        super(message, statusCode, "TOKEN_EXPIRADO");
    }
}

module.exports = TokenExpiradoError;
