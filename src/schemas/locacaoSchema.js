const z = require("zod");

const locacaoSchema = z.object({
    usuarioId: z.coerce.number().int().positive("usuarioId deve ser um inteiro positivo."),
    veiculoId: z.coerce.number().int().positive("veiculoId deve ser um inteiro positivo."),
    dataInicio: z.coerce.date(),
    dataPrevistaDevolucao: z.coerce.date()
}).refine((dados) => dados.dataPrevistaDevolucao > dados.dataInicio, {
    path: ["dataPrevistaDevolucao"],
    message: "A devolução prevista deve ser posterior ao início."
});

module.exports = locacaoSchema;