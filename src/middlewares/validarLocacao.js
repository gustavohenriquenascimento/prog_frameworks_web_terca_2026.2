const locacaoSchema = require("../schemas/locacaoSchema");

const validarLocacao = (request, response, next) => {
    const result = locacaoSchema.safeParse(request.body);
    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            campo: issue.path[0],
            message: issue.message
        }));
        return response.status(400).json({ error: errors });
    }

    request.body = result.data;
    next();
};

module.exports = validarLocacao;