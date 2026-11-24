const cors = require("cors");
const express = require("express");
const ApiError = require("./errors/ApiError");
const authRoutes = require("./routes/authRoutes");
const locacaoRoutes = require("./routes/locacaoRoutes");
const veiculoRoutes = require("./routes/veiculoRoutes");
const naoEncontrado = require("./middlewares/naoEncontrado");
const tratarErros = require("./middlewares/tratarErros");
const { getFrontendOrigins } = require("./config/environment");

const createApp = () => {
    const app = express();
    const allowedOrigins = getFrontendOrigins();

    app.disable("x-powered-by");
    app.use(cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new ApiError("A origem não está autorizada a acessar a API.", 403, "ORIGEM_NAO_PERMITIDA"));
        },
        methods: ["GET", "POST", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }));
    app.use(express.json({ limit: "1mb" }));

    app.get("/health", (request, response) => response.status(200).json({ status: "ok" }));
    app.use("/auth", authRoutes);
    app.use("/veiculos", veiculoRoutes);
    app.use("/locacoes", locacaoRoutes);
    app.use(naoEncontrado);
    app.use(tratarErros);

    return app;
};

module.exports = createApp;
