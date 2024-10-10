const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

app.use(express.json());

let products = [];

// Sample users data for authentication
const users = [
    { id: '1', username: 'user1', password: 'password1', role: 'customer' },
    { id: '2', username: 'admin', password: 'adminpass', role: 'admin' }
];

// JWT secret key
const SECRET_KEY = 'secret';

// Helper function to find a product by ID
const findProductById = (id) => products.find(product => product.id === id);

// Middleware to validate the token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // No token found

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token
        req.user = user; // Save user info to request
        next(); // Proceed to the next middleware or route handler
    });
}

// Create a new product (Admins only)
app.post('/products', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

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

// Get a product by ID (Any authenticated user)
app.get('/products/:productId', authenticateToken, (req, res) => {
    const productId = req.params.productId;
    const product = findProductById(productId);

    if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    return res.json(product);
});

// Update a product by ID (Admins only)
app.put('/products/:productId', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

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

// Delete a product by ID (Admins only)
app.delete('/products/:productId', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

    const productId = req.params.productId;
    const productIndex = products.findIndex(product => product.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    products.splice(productIndex, 1);
    return res.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Product service running on port ${port}`);
});
