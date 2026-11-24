const { after, test } = require("node:test");
const assert = require("node:assert/strict");
const { Prisma } = require("@prisma/client");

process.env.JWT_SECRET = "test-secret-with-more-than-thirty-two-characters";
process.env.JWT_EXPIRES_IN = "1h";
process.env.FRONTEND_ORIGIN = "http://localhost:5173";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test";
process.env.DB_NAME = "test";

const database = {
    usuarios: [],
    veiculos: [],
    locacoes: [],
    nextUsuarioId: 1,
    nextVeiculoId: 1,
    nextLocacaoId: 1
};

const project = (record, select) => {
    if (!record || !select) return record;
    return Object.fromEntries(
        Object.entries(select)
            .filter(([, included]) => included)
            .map(([field]) => [field, record[field]])
    );
};

const prismaMock = {
    usuario: {
        async create({ data, select }) {
            if (database.usuarios.some((usuario) => usuario.email === data.email)) {
                throw { code: "P2002" };
            }
            const usuario = { id: database.nextUsuarioId++, ...data, createdAt: new Date() };
            database.usuarios.push(usuario);
            return project(usuario, select);
        },
        async findUnique({ where, select }) {
            const usuario = database.usuarios.find((item) =>
                where.id !== undefined ? item.id === where.id : item.email === where.email
            );
            return project(usuario, select);
        }
    },
    veiculo: {
        async create({ data }) {
            if (database.veiculos.some((veiculo) => veiculo.placa === data.placa)) {
                throw { code: "P2002" };
            }
            const veiculo = {
                id: database.nextVeiculoId++,
                ...data,
                valorDiaria: new Prisma.Decimal(data.valorDiaria),
                disponivel: true
            };
            database.veiculos.push(veiculo);
            return veiculo;
        },
        async findUnique({ where }) {
            return database.veiculos.find((item) => item.id === where.id) || null;
        },
        async findMany({ where }) {
            return database.veiculos
                .filter((item) => where?.disponivel === undefined || item.disponivel === where.disponivel)
                .sort((a, b) => a.id - b.id);
        },
        async updateMany({ where, data }) {
            const veiculo = database.veiculos.find((item) =>
                Object.entries(where).every(([field, value]) => item[field] === value)
            );
            if (!veiculo) return { count: 0 };
            Object.assign(veiculo, data);
            return { count: 1 };
        },
        async update({ where, data }) {
            const veiculo = database.veiculos.find((item) => item.id === where.id);
            if (!veiculo) throw { code: "P2025" };
            Object.assign(veiculo, data);
            return veiculo;
        }
    },
    locacao: {
        async create({ data, include }) {
            const locacao = {
                id: database.nextLocacaoId++,
                ...data,
                valorTotal: new Prisma.Decimal(data.valorTotal),
                createdAt: new Date(),
                dataDevolucao: null
            };
            database.locacoes.push(locacao);
            return include?.veiculo
                ? { ...locacao, veiculo: database.veiculos.find((item) => item.id === locacao.veiculoId) }
                : locacao;
        },
        async findUnique({ where, select, include }) {
            const locacao = database.locacoes.find((item) => item.id === where.id);
            if (!locacao) return null;
            const result = project(locacao, select);
            return include?.veiculo
                ? { ...result, veiculo: database.veiculos.find((item) => item.id === locacao.veiculoId) }
                : result;
        },
        async findMany({ where, include }) {
            return database.locacoes
                .filter((item) => item.usuarioId === where.usuarioId)
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((locacao) => include?.veiculo
                    ? { ...locacao, veiculo: database.veiculos.find((item) => item.id === locacao.veiculoId) }
                    : locacao);
        },
        async updateMany({ where, data }) {
            const locacao = database.locacoes.find((item) =>
                Object.entries(where).every(([field, value]) => item[field] === value)
            );
            if (!locacao) return { count: 0 };
            Object.assign(locacao, data);
            return { count: 1 };
        }
    },
    async $transaction(callback) {
        return callback(this);
    }
};

require.cache[require.resolve("../src/databases/prisma")] = { exports: prismaMock };
const createApp = require("../src/app");

const server = createApp().listen(0);
after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
}));
const baseUrl = new Promise((resolve) => {
    server.on("listening", () => resolve(`http://127.0.0.1:${server.address().port}`));
});

const request = async (path, { token, ...options } = {}) => {
    const url = `${await baseUrl}${path}`;
    const headers = new Headers(options.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.body !== undefined) headers.set("Content-Type", "application/json");
    const response = await fetch(url, {
        ...options,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    return { status: response.status, body: await response.json() };
};

let firstToken;
let secondToken;
let rentalId;
let vehicleId;

test("health check and API error contract", async () => {
    const health = await request("/health");
    assert.equal(health.status, 200);
    assert.deepEqual(health.body, { status: "ok" });

    const missingRoute = await request("/rota-inexistente");
    assert.equal(missingRoute.status, 404);
    assert.equal(missingRoute.body.code, "ROTA_NAO_ENCONTRADA");

    const invalidOrigin = await request("/health", {
        headers: { Origin: "https://origem-invalida.example" }
    });
    assert.equal(invalidOrigin.status, 403);
    assert.equal(invalidOrigin.body.code, "ORIGEM_NAO_PERMITIDA");
});

test("registration validates input, hashes passwords and rejects duplicate email", async () => {
    const invalid = await request("/auth/register", {
        method: "POST",
        body: { nome: "", email: "invalido", senha: "123" }
    });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.code, "DADOS_INVALIDOS");

    const registration = await request("/auth/register", {
        method: "POST",
        body: { nome: "Ana Silva", email: "ANA@example.com", senha: "senha-segura-123" }
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.body.user.email, "ana@example.com");
    assert.equal("senhaHash" in registration.body.user, false);
    assert.match(database.usuarios[0].senhaHash, /^\$2[aby]\$/);

    const duplicate = await request("/auth/register", {
        method: "POST",
        body: { nome: "Ana Silva", email: "ana@example.com", senha: "senha-segura-123" }
    });
    assert.equal(duplicate.status, 409);
    assert.equal(duplicate.body.code, "EMAIL_JA_CADASTRADO");
});

test("login issues JWT and protected profile rejects missing or invalid tokens", async () => {
    const invalidCredentials = await request("/auth/login", {
        method: "POST",
        body: { email: "ana@example.com", senha: "senha-incorreta" }
    });
    assert.equal(invalidCredentials.status, 401);
    assert.equal(invalidCredentials.body.code, "CREDENCIAIS_INVALIDAS");

    const login = await request("/auth/login", {
        method: "POST",
        body: { email: "ANA@example.com", senha: "senha-segura-123" }
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.tokenType, "Bearer");
    assert.ok(login.body.accessToken);
    assert.equal("senhaHash" in login.body.user, false);
    firstToken = login.body.accessToken;

    const anonymous = await request("/auth/me");
    assert.equal(anonymous.status, 401);
    assert.equal(anonymous.body.code, "NAO_AUTENTICADO");

    const invalidToken = await request("/auth/me", { token: "token-invalido" });
    assert.equal(invalidToken.status, 401);
    assert.equal(invalidToken.body.code, "TOKEN_INVALIDO");

    const profile = await request("/auth/me", { token: firstToken });
    assert.equal(profile.status, 200);
    assert.equal(profile.body.user.email, "ana@example.com");
});

test("authenticated vehicle operations validate data and filter availability", async () => {
    const anonymous = await request("/veiculos");
    assert.equal(anonymous.status, 401);

    const invalidFilter = await request("/veiculos?disponiveis=sim", { token: firstToken });
    assert.equal(invalidFilter.status, 400);
    assert.equal(invalidFilter.body.code, "DADOS_INVALIDOS");

    const invalidVehicle = await request("/veiculos", {
        method: "POST",
        token: firstToken,
        body: { marca: "", modelo: "Hatch", placa: "abc1d23", ano: 2020, valorDiaria: 0 }
    });
    assert.equal(invalidVehicle.status, 400);

    const created = await request("/veiculos", {
        method: "POST",
        token: firstToken,
        body: { marca: "Acme", modelo: "Hatch", placa: "abc 1d23", ano: 2022, valorDiaria: 10 }
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.veiculo.placa, "ABC1D23");
    vehicleId = created.body.veiculo.id;

    const duplicatePlate = await request("/veiculos", {
        method: "POST",
        token: firstToken,
        body: { marca: "Acme", modelo: "Sedan", placa: "ABC1D23", ano: 2023, valorDiaria: 12 }
    });
    assert.equal(duplicatePlate.status, 409);

    const vehicles = await request("/veiculos?disponiveis=true", { token: firstToken });
    assert.equal(vehicles.status, 200);
    assert.equal(vehicles.body.veiculos.length, 1);
});

test("rental lifecycle is user-owned and updates vehicle availability", async () => {
    const anonymous = await request("/locacoes", {
        method: "POST",
        body: { veiculoId: vehicleId, dataInicio: "2026-11-05T10:00:00.000Z", dataPrevistaDevolucao: "2026-11-06T16:00:00.000Z" }
    });
    assert.equal(anonymous.status, 401);

    const forgedOwner = await request("/locacoes", {
        method: "POST",
        token: firstToken,
        body: {
            usuarioId: 999,
            veiculoId: vehicleId,
            dataInicio: "2026-11-05T10:00:00.000Z",
            dataPrevistaDevolucao: "2026-11-06T16:00:00.000Z"
        }
    });
    assert.equal(forgedOwner.status, 400);

    const invalidDates = await request("/locacoes", {
        method: "POST",
        token: firstToken,
        body: {
            veiculoId: vehicleId,
            dataInicio: "2026-11-06T10:00:00.000Z",
            dataPrevistaDevolucao: "2026-11-05T10:00:00.000Z"
        }
    });
    assert.equal(invalidDates.status, 400);

    const created = await request("/locacoes", {
        method: "POST",
        token: firstToken,
        body: {
            veiculoId: vehicleId,
            dataInicio: "2026-11-05T10:00:00.000Z",
            dataPrevistaDevolucao: "2026-11-06T16:00:00.000Z"
        }
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.locacao.usuarioId, 1);
    assert.equal(Number(created.body.locacao.valorTotal), 20);
    assert.equal(created.body.locacao.veiculo.id, vehicleId);
    rentalId = created.body.locacao.id;

    const unavailable = await request("/veiculos?disponiveis=false", { token: firstToken });
    assert.equal(unavailable.body.veiculos.length, 1);
    assert.equal(unavailable.body.veiculos[0].disponivel, false);

    const conflict = await request("/locacoes", {
        method: "POST",
        token: firstToken,
        body: {
            veiculoId: vehicleId,
            dataInicio: "2026-11-07T10:00:00.000Z",
            dataPrevistaDevolucao: "2026-11-08T10:00:00.000Z"
        }
    });
    assert.equal(conflict.status, 409);
    assert.equal(conflict.body.code, "CONFLITO");

    const secondRegistration = await request("/auth/register", {
        method: "POST",
        body: { nome: "Bruno Lima", email: "bruno@example.com", senha: "outra-senha-segura-456" }
    });
    assert.equal(secondRegistration.status, 201);
    const secondLogin = await request("/auth/login", {
        method: "POST",
        body: { email: "bruno@example.com", senha: "outra-senha-segura-456" }
    });
    secondToken = secondLogin.body.accessToken;

    const otherHistory = await request("/locacoes", { token: secondToken });
    assert.equal(otherHistory.status, 200);
    assert.deepEqual(otherHistory.body.locacoes, []);

    const forbiddenFinish = await request(`/locacoes/${rentalId}/finalizar`, {
        method: "PATCH",
        token: secondToken
    });
    assert.equal(forbiddenFinish.status, 404);

    const ownerHistory = await request("/locacoes", { token: firstToken });
    assert.equal(ownerHistory.body.locacoes.length, 1);
    assert.equal(ownerHistory.body.locacoes[0].veiculo.id, vehicleId);

    const finalized = await request(`/locacoes/${rentalId}/finalizar`, {
        method: "PATCH",
        token: firstToken
    });
    assert.equal(finalized.status, 200);
    assert.equal(finalized.body.locacao.status, "FINALIZADA");
    assert.ok(finalized.body.locacao.dataDevolucao);
    assert.equal(finalized.body.locacao.veiculo.disponivel, true);

    const repeatedFinalization = await request(`/locacoes/${rentalId}/finalizar`, {
        method: "PATCH",
        token: firstToken
    });
    assert.equal(repeatedFinalization.status, 409);
});

test("simultaneous rental requests cannot reserve the same vehicle twice", async () => {
    const createdVehicle = await request("/veiculos", {
        method: "POST",
        token: firstToken,
        body: { marca: "Acme", modelo: "Wagon", placa: "XYZ9A88", ano: 2024, valorDiaria: 30 }
    });
    assert.equal(createdVehicle.status, 201);

    const payload = {
        veiculoId: createdVehicle.body.veiculo.id,
        dataInicio: "2026-11-09T10:00:00.000Z",
        dataPrevistaDevolucao: "2026-11-10T10:00:00.000Z"
    };
    const results = await Promise.all([
        request("/locacoes", { method: "POST", token: firstToken, body: payload }),
        request("/locacoes", { method: "POST", token: secondToken, body: payload })
    ]);

    assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);
    const activeForVehicle = database.locacoes.filter((locacao) =>
        locacao.veiculoId === createdVehicle.body.veiculo.id && locacao.status === "ATIVA"
    );
    assert.equal(activeForVehicle.length, 1);
});
