const usuarioIdSchema = require("../schemas/usuarioIdSchema");

const validarUsuarioId = (request, response, next) => {
    const result = usuarioIdSchema.safeParse(request.query.usuarioId);
    if (!result.success) {
        return response.status(400).json({ error: result.error.issues[0].message });
    }

    request.usuarioId = result.data;
    next();
};

module.exports = validarUsuarioId;