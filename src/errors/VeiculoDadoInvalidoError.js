const ApiError = require("./ApiError");

class VeiculoDadoInvalidoError extends ApiError {
    constructor(message = "Dados inválidos para cadastro do veículo", statusCode = 400) {
        super(message, statusCode, "DADOS_INVALIDOS");
    }
}

module.exports = VeiculoDadoInvalidoError;