const ApiError = require("./ApiError");


class AlunoNaoEncontradoError extends ApiError{
    constructor(message="aluno não encontrado", statusCode=404){
        super(message, statusCode);
    }
}

module.exports = AlunoNaoEncontradoError;
