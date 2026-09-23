const ApiError = require("./ApiError");


class AlunoNaoEncontradoError extends ApiError{
    constructor(message="aluno não encontrado", statuscode=404){
        super(message, statuscode);
    }
}

module.exports = AlunoNaoEncontradoError;
