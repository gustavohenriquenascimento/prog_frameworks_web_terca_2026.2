const jwt = require("jsonwebtoken");
const NaoAutenticadoError = require("../errors/NaoAutenticadoError");
const TokenExpiradoError = require("../errors/TokenExpiradoError");
const TokenInvalidoError = require("../errors/TokenInvalidoError");

const autenticar = (request, response, next) => {
    const authorization = request.get("Authorization");
    const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
        return next(new NaoAutenticadoError("Informe o token no cabeçalho Authorization: Bearer <token>."));
    }

    let payload;
    try {
        payload = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new TokenExpiradoError());
        }
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.NotBeforeError) {
            return next(new TokenInvalidoError());
        }
        return next(error);
    }

    const userId = Number(payload && typeof payload === "object" ? payload.sub : NaN);
    if (!Number.isInteger(userId) || userId <= 0) {
        return next(new TokenInvalidoError());
    }

    request.auth = { userId };
    return next();
};

module.exports = autenticar;
