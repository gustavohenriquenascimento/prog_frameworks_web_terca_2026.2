const z = require("zod");

const senhaSchema = z.string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .refine((senha) => Buffer.byteLength(senha, "utf8") <= 72, {
        message: "A senha não pode exceder 72 bytes."
    });

const senhaLoginSchema = z.string()
    .min(1, "Senha é obrigatória.")
    .refine((senha) => Buffer.byteLength(senha, "utf8") <= 72, {
        message: "A senha não pode exceder 72 bytes."
    });

const usuarioCadastroSchema = z.object({
    nome: z.string().trim().min(1, "Nome é obrigatório.").max(191, "Nome muito longo."),
    email: z.string()
        .trim()
        .email("E-mail inválido.")
        .max(191, "E-mail muito longo.")
        .transform((email) => email.toLowerCase()),
    senha: senhaSchema
}).strict();

const usuarioLoginSchema = z.object({
    email: z.string()
        .trim()
        .email("E-mail inválido.")
        .max(191, "E-mail muito longo.")
        .transform((email) => email.toLowerCase()),
    senha: senhaLoginSchema
}).strict();

module.exports = { usuarioCadastroSchema, usuarioLoginSchema };
