require("dotenv/config");
const prisma = require("../src/databases/prisma");

const demoVehicles = [
    {
        marca: "Volkswagen",
        modelo: "Polo",
        placa: "VLD1A01",
        ano: 2024,
        valorDiaria: "159.90"
    },
    {
        marca: "Chevrolet",
        modelo: "Onix",
        placa: "VLD2B02",
        ano: 2023,
        valorDiaria: "139.90"
    },
    {
        marca: "Toyota",
        modelo: "Corolla",
        placa: "VLD3C03",
        ano: 2025,
        valorDiaria: "229.90"
    }
];

const seed = async () => {
    for (const vehicle of demoVehicles) {
        const seededVehicle = await prisma.veiculo.upsert({
            where: { placa: vehicle.placa },
            update: {},
            create: vehicle
        });
        console.log(`Veículo de demonstração pronto: ${seededVehicle.modelo} (${seededVehicle.placa}).`);
    }
};

seed()
    .catch((error) => {
        console.error("Falha ao carregar os veículos de demonstração:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
