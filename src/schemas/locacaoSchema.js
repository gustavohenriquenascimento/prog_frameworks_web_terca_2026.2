const z = require("zod");

const locacaoSchema = z.object({
    veiculoId: z.coerce.number().int().positive("veiculoId deve ser um inteiro positivo."),
    dataInicio: z.coerce.date({ error: "dataInicio inválida." }),
    dataPrevistaDevolucao: z.coerce.date({ error: "dataPrevistaDevolucao inválida." })
}).refine((dados) => dados.dataPrevistaDevolucao > dados.dataInicio, {
    path: ["dataPrevistaDevolucao"],
    message: "A devolução prevista deve ser posterior ao início."
}).strict();

module.exports = locacaoSchema;