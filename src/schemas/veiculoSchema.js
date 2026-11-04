const z = require("zod");

const veiculoSchema = z.object({
    marca: z.string().trim().min(1, "Marca é obrigatória."),
    modelo: z.string().trim().min(1, "Modelo é obrigatório."),
    placa: z.string().trim().min(1, "Placa é obrigatória.").transform((placa) => placa.toUpperCase()),
    ano: z.coerce.number().int().min(1886, "Ano inválido."),
    valorDiaria: z.coerce.number().positive("O valor da diária deve ser positivo.")
});

module.exports = veiculoSchema;