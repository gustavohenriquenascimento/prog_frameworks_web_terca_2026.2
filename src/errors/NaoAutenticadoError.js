const ApiError = require("./ApiError");

class NaoAutenticadoError extends ApiError {
    constructor(message = "Autenticação necessária.", statusCode = 401) {
        super(message, statusCode, "NAO_AUTENTICADO");
    }
}

module.exports = NaoAutenticadoError;
