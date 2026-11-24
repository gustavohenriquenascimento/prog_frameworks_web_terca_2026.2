const ApiError = require("./ApiError");

class VeiculoNaoEncontradoError extends ApiError {
    constructor(message = "Veículo não encontrado", statusCode = 404) {
        super(message, statusCode, "VEICULO_NAO_ENCONTRADO");
    }
}

module.exports = VeiculoNaoEncontradoError;