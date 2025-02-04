let {contas, banco, ultimoId, depositos, saques, transferencias} = require("../bancodedados");
const {format} = require('date-fns');


const listarContaBancaria = (req,res) => {

    //listando conta em banco
    const {senha_banco} = req.query

    if(!senha_banco){
        return res.status(404).json({ mensagem: 'a senha do banco deve ser informado'});
    }

    if(senha_banco !== banco.senha){
        return res.status(400).json({ mensagem: 'a senha do banco está errada'});
}

    return res.json(contas)

}

const criarContas = (req, res) => {

    //verificando contas
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'o nome deve ser informado'});
    }
    if (!cpf) {
        return res.status(400).json({ mensagem: 'o cpf deve ser informado'});
    }
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: 'a data de nascimento deve ser informado'});
    }
    if (!telefone) {
        return res.status(400).json({ mensagem: 'o telefone deve ser informado'});
    }
    if (!email) {
        return res.status(400).json({ mensagem: 'o email deve ser informado'});
    }
    if (!senha) {
        return res.status(400).json({ mensagem: 'a senha deve ser informado'});
    }

    const contaExistente = contas.find(conta => { 
        return conta.usuario.cpf === cpf || conta.usuario.email === email
    })

    if (contaExistente) {
        return res.status(400).json({ mensagem: 'o cpf e/ou email já existem'});

    }

    //criando conta
    const novaConta = {
        numero:ultimoId++,
        saldo: 0,
        usuario: {
          nome,
          cpf,
          data_nascimento,
          telefone,
          email,
          senha
        }
      };

      contas.push(novaConta);

      return res.json(contas)
}

const atualizarUsuarioConta = (req, res) => {
    const {id} = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

   const contaExistente = contas.find(conta => { 
        return conta.id === Number(id) });

        if (!contaExistente) {
            return res.status(400).json({ mensagem: 'usuario não encontrado'});
        }
    
        if(nome) {
            contaExistente.usuario.nome = nome
        }

        if(cpf) {
            contaExistente.usuario.cpf = cpf
        }

        if(data_nascimento) {
            contaExistente.usuario.data_nascimento = data_nascimento
        }

        if(telefone) {
            contaExistente.usuario.telefone = telefone
        }

        if(email) {
            contaExistente.usuario.email = email
        }

        if(senha) {
            contaExistente.usuario.senha = senha
        }

        return res.status(200).json({ mensagem: 'usuario cadastrado com sucesso'});

}

const excluirConta = (req, res) => {
    const { id } = req.params;

    const contaExistente = contas.find(conta => { 
        return conta.id === Number(id) });


    if (contaExistente < 0) {

        return res.status(404).json({ mensagem: "A conta não está presente na lista."});
    }

    if (contaExistente.saldo > 0) {
        return res.status(400).json({ mensagem: "A conta possui saldo maior que R$0,00. Não é possível deletar conta." });
      }

    contas = contas.filter(conta => conta.id !== Number(id));

    return res.json({ mensagem: 'Conta removida'});


}

const depositar = (req, res) => {

    const { numero_conta, valor} = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'Número da conta e valores devem ser informados' });
      }

    const contaExistente = contas.find(conta => { 
        return Number(conta.numero) === Number(numero_conta) });

    if (!contaExistente) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
      }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O Valor depositado deve ser positivo.' });
      }
      contaExistente.saldo += valor;

      const registro = {
        data: format(new Date(),'yyyy-MM-dd HH:MM:SS'),
        numero_conta, 
        valor }
        depositos.push(registro)

        return res.status(200).json({ messagem: 'Deposito feito com sucesso'});
}

const sacar = (req, res) => {

    const {numero_conta , valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: 'numero da conta, o valor do saque e a senha devem ser informados.' });
      }

    const contaExistente = contas.find(conta => { 
        return Number(conta.numero) === Number(numero_conta) });

    if (!numero_conta) {
        return res.status(404).json({ mensagem: 'Conta não encontrada' });
      }

      if (contaExistente.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha Incorreta' });
      }

    if (contaExistente.saldo < valor) {
        return res.status(200).json({ messagem: 'Não há valor a ser sacado'})
    } else {
         res.status(401).json({ mensagem: 'saldo insuficiente para saque'})
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: 'O Valor Sacado deve ser positivo.' });
      }
    
      contaExistente.saldo -= valor;

      const registro = {
        data: format(new Date(),'yyyy-MM-dd HH:MM:SS'),
        numero_conta, 
        valor }
        saques.push(registro)
      

      res.json({ mensagem: 'saque feito com sucesso' });

}

const transferir = (req, res) => {
    const { contaOrigem, contaDestino, senha, valor } = req.body;

        if (!contaOrigem || !contaDestino || !senha || !valor) {
        return res.status(400).json({ mensagem: 'É necessario o Conta de origem, a Conta de destino da transferencia, a senha e o valor a ser transferido' });
      } 

      const contaOrigemTransf= contas.find(conta => { 
        return Number(conta.numero) === Number(contaOrigem) });
    

      if (!contaOrigemTransf) {
        return res.status(404).json({ mensagem: 'Conta de Origem não encontrada' });
      }

      const contaDestinoTranf = contas.find(conta => { 
        return Number(conta.numero) === Number(contaDestino) });

      if (!contaDestinoTranf) {
        return res.status(404).json({ mensagem: 'Conta de Destino não encontrado.' });
      }

        if (contaOrigemTransf.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha Incorreta' });
      }
      
      if (contaOrigem.saldo < valor) {
        return res.status(403).json({ mensagem: 'saldo insuficiente na conta de origem' });
      }

      contaOrigemTransf.saldo -= valor;
      contaDestinoTranf.saldo += valor;


      const registro = {
        data: format(new Date(),'yyyy-MM-dd HH:MM:SS'),
        contaOrigem,
        contaDestino, 
        valor }
        transferencias.push(registro)

      res.json({ messagem: 'realizada com sucesso.'});
 }
    
const saldo = (req, res) => {
    const {numero_conta, senha } = req.query;

    const contaExistente = contas.find(conta => { 
        return Number(conta.numero) === Number(numero_conta) });
       

    if(!contaExistente){
        return res.status(404).json({ mensagem: 'Conta Inexistente'});
    }

    if (contaExistente.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Senha Invalida' });
      }
   
      res.json({ id: contaExistente.id, saldo: contaExistente.saldo });
  

}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'Numero da conta e senha devem ser informados' });
      }

      const contaExistente = contas.find(conta => { 
        return Number(conta.numero) === Number(numero_conta) });
    
        if (!numero_conta) {
            return res.status(404).json({ mensagem: 'Conta não encontrada' });
          }

      if (contaExistente.usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'senha invalida' });
      }

    const extratoDeposito =  depositos.filter(deposito => deposito.numero_conta === Number(numero_conta));
    const extratoSaque = saques.filter(saque => saque.numero_conta === Number(numero_conta));
    const transferenciasEnviadas = transferencias.filter(tranfIn => tranfIn.contaOrigem === Number(numero_conta));
    const transferenciasRecebidas = transferencias.filter(tranfOut => tranfOut.contaDestino === Number(numero_conta));

    return res.json({
        depositos: extratoDeposito,
        saques: extratoSaque,
        transferenciasEnviadas,
        transferenciasRecebidas,

    })

}

module.exports = {
    
    listarContaBancaria,
    criarContas,
    atualizarUsuarioConta,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato

};