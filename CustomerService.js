const express = require('express');
const app = express();
const port = 3001; 


app.use(express.json());


let customers = [];

const findCustomerById = (id) => customers.find(customer => customer.id === id);

app.post('/products', (req, res) => {
    const { id, name, price, description } = req.body;

    
    if (!id || !name || !price) {
        return res.status(400).json({ message: 'Product ID, name, and price are required.' });
    }

    
    if (findProductById(id)) {
        return res.status(400).json({ message: 'Product with this ID already exists.' });
    }

    
    const newProduct = { id, name, price, description };
    products.push(newProduct);
    return res.status(201).json(newProduct);
});


app.get('/products/:productId', (req, res) => {
    const productId = req.params.productId;
    const product = findProductById(productId);

    if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(product);
});

app.put('/products/:productId', (req, res) => {
    const productId = req.params.productId;
    const { name, price, description } = req.body;

    const product = findProductById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
    }


    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;

    return res.json(product);
});

app.delete('/products/:productId', (req, res) => {
    const productId = req.params.productId;
    const productIndex = products.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found.' });
    }

   
    products.splice(productIndex, 1);
    return res.status(204).send();
});


app.listen(port, () => {
    console.log(`Customer service running on port ${port}`);
});