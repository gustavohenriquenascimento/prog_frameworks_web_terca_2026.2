const e = require("express");
const alunoService = require("../services/AlunoService");

class AlunoController{

    async delete(request, response){
    try{
     const aluno = await alunoService.delete(request.params.id);
     return response.status(200).send()
    }catch(e){

        return response.status(e.statusCode).json({error: e.message});
    }

    }

    async update(request, response){
      try{
          const aluno = await alunoService.update(request.params.id, request.body);
        return response.status(200).json({aluno});
      }catch(e){
        return response.status(e.statusCode).json({error: e.message});
      }
    }


    async findUnique(request, response){
      try{
          const aluno = await alunoService.findUnique(request.params.id);
        return response.status(200).json({aluno});
      }catch(e){
        return response.status(e.statusCode).json({error: e.message});
      }
    }


    async findMany(request, response){
        let {page, pageSize, orderBy, order} = request.query;
        page ||= 1;
        pageSize ||= 10;
        orderBy ||="id";
        order ||= "asc";


        const resultado = await alunoService.findMany(page, pageSize, orderBy, order);
        return response.status(200).json({resultado});
    }


    async create(request, response){
        try{
            const aluno = await alunoService.create(request.body);
            return response.status(201).json({aluno});
        }catch(e){
            return response.status(e.statusCode).json({error: e.message});
        }
    }
}

module.exports = new AlunoController();