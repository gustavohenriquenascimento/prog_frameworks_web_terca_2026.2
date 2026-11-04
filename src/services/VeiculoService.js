const prisma = require("../databases/prisma");
const ConflitoLocacaoError = require("../errors/ConflitoLocacaoError");

class VeiculoService {
    async create(dados) {
        try {
            return await prisma.veiculo.create({ data: dados });
        } catch (error) {
            if (error.code === "P2002") {
                throw new ConflitoLocacaoError("Já existe um veículo cadastrado com essa placa.");
            }
            throw error;
        }
    }

    async findMany(disponiveis) {
        return prisma.veiculo.findMany({
            where: disponiveis ? { disponivel: true } : undefined,
            orderBy: { id: "asc" }
        });
    }
}

module.exports = new VeiculoService();