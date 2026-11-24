const z = require("zod");

const disponibilidadeSchema = z.enum(["true", "false"]).optional();

const validarDisponibilidade = (request, response, next) => {
    const result = disponibilidadeSchema.safeParse(request.query.disponiveis);
    if (!result.success) {
        return response.status(400).json({
            error: "O filtro disponiveis deve ser true ou false.",
            code: "DADOS_INVALIDOS",
            details: [{ campo: "disponiveis", message: result.error.issues[0].message }]
        });
    }

    return next();
};

module.exports = validarDisponibilidade;
