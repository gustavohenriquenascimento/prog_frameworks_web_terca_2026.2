const usuarioService = require("../services/UsuarioService");

class UsuarioController {
    async register(request, response) {
        const user = await usuarioService.register(request.body);
        return response.status(201).json({ user });
    }

    async login(request, response) {
        const result = await usuarioService.login(request.body);
        return response.status(200).json(result);
    }

    async me(request, response) {
        const user = await usuarioService.findProfile(request.auth.userId);
        return response.status(200).json({ user });
    }
}

module.exports = new UsuarioController();
