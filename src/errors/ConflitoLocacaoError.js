const ApiError = require("./ApiError");

class ConflitoLocacaoError extends ApiError {
    constructor(message = "Conflito ao processar locação", statusCode = 409) {
        super(message, statusCode);
    }
}

module.exports = ConflitoLocacaoError;