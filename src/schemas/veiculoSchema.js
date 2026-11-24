const z = require("zod");

const veiculoSchema = z.object({
    marca: z.string().trim().min(1, "Marca é obrigatória.").max(191, "Marca muito longa."),
    modelo: z.string().trim().min(1, "Modelo é obrigatório.").max(191, "Modelo muito longo."),
    placa: z.string()
        .trim()
        .min(1, "Placa é obrigatória.")
        .max(20, "Placa muito longa.")
        .transform((placa) => placa.replace(/\s+/g, "").toUpperCase()),
    ano: z.coerce.number().int().min(1886, "Ano inválido."),
    valorDiaria: z.coerce.number()
        .positive("O valor da diária deve ser positivo.")
        .max(99999999.99, "O valor da diária excede o limite permitido.")
}).strict();

module.exports = veiculoSchema;