const ApiError = require("./ApiError");

class VeiculoDadoInvalidoError extends ApiError {
    constructor(message = "Dados inválidos para cadastro do veículo", statusCode = 400) {
        super(message, statusCode);
    }
}

module.exports = VeiculoDadoInvalidoError;