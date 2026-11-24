const validarCorpo = (schema) => (request, response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
        const details = result.error.issues.map((issue) => ({
            campo: issue.path.join("."),
            message: issue.message
        }));
        return response.status(400).json({
            error: "Dados inválidos.",
            code: "DADOS_INVALIDOS",
            details
        });
    }

    request.body = result.data;
    return next();
};

module.exports = validarCorpo;
