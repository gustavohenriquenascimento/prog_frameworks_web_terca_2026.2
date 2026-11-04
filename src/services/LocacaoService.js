const prisma = require("../databases/prisma");
const ConflitoLocacaoError = require("../errors/ConflitoLocacaoError");
const LocacaoDadoInvalidoError = require("../errors/LocacaoDadoInvalidoError");
const LocacaoNaoEncontradaError = require("../errors/LocacaoNaoEncontradaError");
const UsuarioNaoEncontradoError = require("../errors/UsuarioNaoEncontradoError");
const VeiculoNaoEncontradoError = require("../errors/VeiculoNaoEncontradoError");

const milissegundosPorDia = 24 * 60 * 60 * 1000;

class LocacaoService {
    async create(dados) {
        const duracao = dados.dataPrevistaDevolucao.getTime() - dados.dataInicio.getTime();
        if (duracao <= 0) {
            throw new LocacaoDadoInvalidoError("A devolução prevista deve ser posterior ao início.");
        }

        const diarias = Math.ceil(duracao / milissegundosPorDia);

        return prisma.$transaction(async (transaction) => {
            const usuario = await transaction.usuario.findUnique({
                where: { id: dados.usuarioId },
                select: { id: true }
            });
            if (!usuario) {
                throw new UsuarioNaoEncontradoError();
            }

            const veiculo = await transaction.veiculo.findUnique({
                where: { id: dados.veiculoId }
            });
            if (!veiculo) {
                throw new VeiculoNaoEncontradoError();
            }

            const disponibilidade = await transaction.veiculo.updateMany({
                where: { id: veiculo.id, disponivel: true },
                data: { disponivel: false }
            });
            if (disponibilidade.count !== 1) {
                throw new ConflitoLocacaoError("O veículo não está disponível para locação.");
            }

            return transaction.locacao.create({
                data: {
                    usuarioId: usuario.id,
                    veiculoId: veiculo.id,
                    dataInicio: dados.dataInicio,
                    dataPrevistaDevolucao: dados.dataPrevistaDevolucao,
                    valorTotal: veiculo.valorDiaria.mul(diarias).toDecimalPlaces(2),
                    status: "ATIVA"
                },
                include: {
                    veiculo: true
                }
            });
        });
    }

    async findByUsuario(usuarioId) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: { id: true }
        });
        if (!usuario) {
            throw new UsuarioNaoEncontradoError();
        }

        return prisma.locacao.findMany({
            where: { usuarioId },
            include: { veiculo: true },
            orderBy: { createdAt: "desc" }
        });
    }

    async finalize(id) {
        const locacaoId = Number(id);
        if (!Number.isInteger(locacaoId) || locacaoId <= 0) {
            throw new LocacaoDadoInvalidoError("O id da locação deve ser um inteiro positivo.");
        }

        return prisma.$transaction(async (transaction) => {
            const locacao = await transaction.locacao.findUnique({
                where: { id: locacaoId }
            });
            if (!locacao) {
                throw new LocacaoNaoEncontradaError();
            }
            if (locacao.status !== "ATIVA" || locacao.dataDevolucao) {
                throw new ConflitoLocacaoError("Esta locação já foi finalizada.");
            }

            const finalizacao = await transaction.locacao.updateMany({
                where: { id: locacaoId, status: "ATIVA", dataDevolucao: null },
                data: { status: "FINALIZADA", dataDevolucao: new Date() }
            });
            if (finalizacao.count !== 1) {
                throw new ConflitoLocacaoError("Esta locação já foi finalizada.");
            }

            await transaction.veiculo.update({
                where: { id: locacao.veiculoId },
                data: { disponivel: true }
            });

            return transaction.locacao.findUnique({
                where: { id: locacaoId },
                include: { veiculo: true }
            });
        });
    }
}

module.exports = new LocacaoService();