const veiculoService = require("../services/VeiculoService");

const responderErro = (response, error) => {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    const message = statusCode === 500 ? "Erro interno do servidor." : error.message;
    return response.status(statusCode).json({ error: message });
};

class VeiculoController {
    async create(request, response) {
        try {
            const veiculo = await veiculoService.create(request.body);
            return response.status(201).json({ veiculo });
        } catch (error) {
            return responderErro(response, error);
        }
    }

    async findMany(request, response) {
        try {
            const disponiveis = request.query.disponiveis === "true";
            const veiculos = await veiculoService.findMany(disponiveis);
            return response.status(200).json({ veiculos });
        } catch (error) {
            return responderErro(response, error);
        }
    }
}

module.exports = new VeiculoController();