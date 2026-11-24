const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../databases/prisma");
const CredenciaisInvalidasError = require("../errors/CredenciaisInvalidasError");
const EmailJaCadastradoError = require("../errors/EmailJaCadastradoError");
const UsuarioNaoEncontradoError = require("../errors/UsuarioNaoEncontradoError");

const saltRounds = 12;

class UsuarioService {
    async register({ nome, email, senha }) {
        const senhaHash = await bcrypt.hash(senha, saltRounds);
        try {
            return await prisma.usuario.create({
                data: { nome, email, senhaHash },
                select: { id: true, nome: true, email: true, createdAt: true }
            });
        } catch (error) {
            if (error.code === "P2002") {
                throw new EmailJaCadastradoError();
            }
            throw error;
        }
    }

    async login({ email, senha }) {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            select: { id: true, nome: true, email: true, senhaHash: true, createdAt: true }
        });
        if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
            throw new CredenciaisInvalidasError();
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
        const accessToken = jwt.sign(
            { sub: String(usuario.id) },
            process.env.JWT_SECRET,
            { algorithm: "HS256", expiresIn }
        );

        return {
            user: this.publicProfile(usuario),
            accessToken,
            tokenType: "Bearer",
            expiresIn
        };
    }

    async findProfile(userId) {
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { id: true, nome: true, email: true, createdAt: true }
        });
        if (!usuario) {
            throw new UsuarioNaoEncontradoError();
        }
        return usuario;
    }

    publicProfile(usuario) {
        const { id, nome, email, createdAt } = usuario;
        return { id, nome, email, createdAt };
    }
}

module.exports = new UsuarioService();
