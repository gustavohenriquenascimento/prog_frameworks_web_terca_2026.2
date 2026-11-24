require('dotenv/config');
const createApp = require("./app");
const prisma = require("./databases/prisma");
const { validateEnvironment } = require("./config/environment");

const start = () => {
    const { port } = validateEnvironment();
    const app = createApp();
    const server = app.listen(port, () => {
        console.log(`API de locação disponível na porta ${port}.`);
    });

    server.on("close", () => {
        prisma.$disconnect().catch((error) => {
            console.error("Falha ao desconectar do banco de dados:", error);
        });
    });
};

if (require.main === module) {
    start();
}

module.exports = { start };
