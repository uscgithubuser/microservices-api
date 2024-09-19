const express = require('express');
const app = express();
const port = 3001; 


app.use(express.json());


let customers = [];

const findCustomerById = (id) => customers.find(customer => customer.id === id);