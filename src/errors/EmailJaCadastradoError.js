const ApiError = require("./ApiError");

class EmailJaCadastradoError extends ApiError {
    constructor(message = "Já existe um usuário cadastrado com esse e-mail.", statusCode = 409) {
        super(message, statusCode, "EMAIL_JA_CADASTRADO");
    }
}

module.exports = EmailJaCadastradoError;
