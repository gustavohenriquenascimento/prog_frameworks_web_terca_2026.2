const ApiError = require("./ApiError");

class LocacaoDadoInvalidoError extends ApiError {
    constructor(message = "Dados inválidos para locação", statusCode = 400) {
        super(message, statusCode);
    }
}

module.exports = LocacaoDadoInvalidoError;