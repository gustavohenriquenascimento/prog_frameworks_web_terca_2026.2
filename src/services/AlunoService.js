const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");
const AlunoDadosInvalidosError = require("../errors/AlunoDadoInvalidoError");

class AlunoService
{


    async findUnique(id){
    //where vai apontar para o meu oq eu quero, e fiz a conversão de string Number
    const aluno = await prisma.aluno.findUnique({
    where: {
        id: Number(id)
    }
});
    
  if(!aluno){
        throw new AlunoNaoEncontradoError();
    
    }

    return aluno;
    
    }

    async findMany(page, pageSize, orderBy, order){
        //SELECT * FROM alunos
        const alunos = await prisma.aluno.findMany({
            skip: (page-1)*pageSize,
            take: Number(pageSize),
            orderBy:{
                [orderBy]:order
            }
        });

        const total= await prisma.aluno.count();

        return{ 
            alunos,
            total
        };
        
    }

    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }
        //create = insert
        //update = update
        //delete = delete
        //findMany = select * from
        const novoAluno = await prisma.aluno.create({data:aluno});

        return novoAluno;
    }

    async update(id,dados){
        
        // preciso tratar caso venha um objeto vazio.

        if(!dados||(!dados.nome && !dados.email)){

         throw new AlunoDadosInvalidosError();

        }

        const aluno = await prisma.aluno.findUnique({
         where:{
                id:Number(id)
            } 
        })
        
        if(!aluno){
               
          throw new AlunoNaoEncontradoError();

        }

        try{

         const alunoAtualizado= await prisma.aluno.update({
            where:{
                id: Number(id)
        },
        data: dados
        });

        return alunoAtualizado;

        }catch(e){

    console.log("ERRO DO PRISMA:", e);
    console.log("CODIGO DO ERRO:", e.code);

    if(e.code === "P2002"){
        
        throw new AlunoDadosInvalidosError("Email já cadastrado");

    }

    throw e;
}

    }
    async delete(id){

    const aluno = await prisma.aluno.findUnique({
        where:{
            id: Number(id)
        }
    })
    
    if(!aluno){
    throw new AlunoNaoEncontradoError();

    }
    const alunoDeletado = await prisma.aluno.delete({
        where:{
            id : Number(id)
        }

  })
}
}
module.exports = new AlunoService();