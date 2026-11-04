require('dotenv/config');
const express = require("express")
const veiculoRoutes = require("./routes/veiculoRoutes");
const locacaoRoutes = require("./routes/locacaoRoutes");

const app = express();
app.use(express.json());
app.use((request, response, next)=>{
    console.log("Executando antes das rotas");
    next();
});
app.use("/veiculos", veiculoRoutes);
app.use("/locacoes", locacaoRoutes);

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});

