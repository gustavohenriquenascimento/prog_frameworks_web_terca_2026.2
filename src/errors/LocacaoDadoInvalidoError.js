const ApiError = require("./ApiError");

class LocacaoDadoInvalidoError extends ApiError {
    constructor(message = "Dados inválidos para locação", statusCode = 400) {
        super(message, statusCode, "DADOS_INVALIDOS");
    }
}

module.exports = LocacaoDadoInvalidoError;