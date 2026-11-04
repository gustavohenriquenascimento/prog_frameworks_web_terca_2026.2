const veiculoSchema = require("../schemas/veiculoSchema");

const validarVeiculo = (request, response, next) => {
    const result = veiculoSchema.safeParse(request.body);
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

module.exports = validarVeiculo;