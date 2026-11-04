const z = require("zod");

const usuarioIdSchema = z.coerce.number().int().positive("usuarioId deve ser um inteiro positivo.");

module.exports = usuarioIdSchema;