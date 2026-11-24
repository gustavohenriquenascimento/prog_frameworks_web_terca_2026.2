const veiculoService = require("../services/VeiculoService");

class VeiculoController {
    async create(request, response) {
        const veiculo = await veiculoService.create(request.body);
        return response.status(201).json({ veiculo });
    }

    async findMany(request, response) {
        const disponiveis = request.query.disponiveis === undefined
            ? undefined
            : request.query.disponiveis === "true";
        const veiculos = await veiculoService.findMany(disponiveis);
        return response.status(200).json({ veiculos });
    }
}

module.exports = new VeiculoController();