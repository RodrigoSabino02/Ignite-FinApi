const express = require('express');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(express.json());

const customers = [];

/**
 * account
 * 
 * Cpf       -> string
 * name      -> string
 * id        -> uuid
 * statement -> []
 * 
 */

// middleware
function verifyExistsAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer){
        return res.status(400).json({ error: "Custumer not found"})
    }

    req.customer = customer;

    return next();
}


// criaçao da conta
app.post("/account", (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if(customerAlreadyExists){
        return res.status(400).json({ error: "Customer already exists!" })
    }

    customers.push({
        id: uuidv4(),
        name,
        cpf,
        statement: [],
    });

    return res.status(201).send();
    
});


// buscar o extrato do usuario 
app.get("/statement/:cpf", verifyExistsAccountCPF,  (req, res) => {
    const { customer } = req;
    return res.json(customer.statement);
})

// realizar um deposito
app.post("/deposit", verifyExistsAccountCPF, (req, res) => {
    const {description, amount } = req.body;
    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        createdAt: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).send();

})

app.listen(3333);