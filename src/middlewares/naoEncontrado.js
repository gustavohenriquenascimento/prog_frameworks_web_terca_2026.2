const naoEncontrado = (request, response) => response.status(404).json({
    error: "Rota não encontrada.",
    code: "ROTA_NAO_ENCONTRADA"
});

module.exports = naoEncontrado;
