const ApiError = require("../errors/ApiError");

const tratarErros = (error, request, response, next) => {
    if (response.headersSent) {
        return next(error);
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return response.status(400).json({
            error: "O corpo da requisição não contém JSON válido.",
            code: "JSON_INVALIDO"
        });
    }

    if (error.type === "entity.too.large") {
        return response.status(413).json({
            error: "O corpo da requisição excede o limite permitido.",
            code: "CORPO_MUITO_GRANDE"
        });
    }

    if (error instanceof ApiError) {
        return response.status(error.statusCode).json({
            error: error.message,
            code: error.code
        });
    }

    console.error("Erro não tratado na API:", error);
    return response.status(500).json({
        error: "Erro interno do servidor.",
        code: "ERRO_INTERNO"
    });
};

module.exports = tratarErros;
