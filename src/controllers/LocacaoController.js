const locacaoService = require("../services/LocacaoService");

class LocacaoController {
    async create(request, response) {
        const locacao = await locacaoService.create(request.auth.userId, request.body);
        return response.status(201).json({ locacao });
    }

    async findByUsuario(request, response) {
        const locacoes = await locacaoService.findByUsuario(request.auth.userId);
        return response.status(200).json({ locacoes });
    }

    async finalize(request, response) {
        const locacao = await locacaoService.finalize(request.params.id, request.auth.userId);
        return response.status(200).json({ locacao });
    }
}

module.exports = new LocacaoController();