const validateEnvironment = () => {
    const required = ["DATABASE_URL", "DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];
    const missing = required.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}.`);
    }

    if (process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET deve conter pelo menos 32 caracteres.");
    }

    const port = Number(process.env.PORT || 3000);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PORT deve ser um número inteiro entre 1 e 65535.");
    }

    return { port };
};

const getFrontendOrigins = () => (process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = { getFrontendOrigins, validateEnvironment };
