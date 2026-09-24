const ApiError = require("./ApiError");

class AlunoDadosInvalidosError extends ApiError{

    constructor(message = "Dados inválidos para atualização", statusCode = 400){

    super(message, statusCode);

    }
}

module.exports = AlunoDadosInvalidosError;