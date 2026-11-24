const ApiError = require("./ApiError");

class CredenciaisInvalidasError extends ApiError {
    constructor(message = "E-mail ou senha inválidos.", statusCode = 401) {
        super(message, statusCode, "CREDENCIAIS_INVALIDAS");
    }
}

module.exports = CredenciaisInvalidasError;
