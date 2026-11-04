const locacaoService = require("../services/LocacaoService");

const responderErro = (response, error) => {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    const message = statusCode === 500 ? "Erro interno do servidor." : error.message;
    return response.status(statusCode).json({ error: message });
};

class LocacaoController {
    async create(request, response) {
        try {
            const locacao = await locacaoService.create(request.body);
            return response.status(201).json({ locacao });
        } catch (error) {
            return responderErro(response, error);
        }
    }

    async findByUsuario(request, response) {
        try {
            const locacoes = await locacaoService.findByUsuario(request.usuarioId);
            return response.status(200).json({ locacoes });
        } catch (error) {
            return responderErro(response, error);
        }
    }

    async finalize(request, response) {
        try {
            const locacao = await locacaoService.finalize(request.params.id);
            return response.status(200).json({ locacao });
        } catch (error) {
            return responderErro(response, error);
        }
    }
}

module.exports = new LocacaoController();