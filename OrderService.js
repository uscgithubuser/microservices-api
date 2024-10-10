const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const app = express();
const port = 3002;

app.use(express.json());

let orders = [];

// JWT secret key
const SECRET_KEY = 'secret'; // Use the same secret key for JWT

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.sendStatus(403); // Forbidden
    }

    jwt.verify(token, SECRET_KEY, (err, user) => { // Use the secret key
        if (err) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user; // Store user info for further use
        next();
    });
};

// Verify if the customer exists
const verifyCustomer = async (customerId) => {
    try {
        const response = await axios.get(`http://localhost:3001/customers/${customerId}`);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error('Customer not found.');
    } catch (error) {
        console.error('Error verifying customer:', error.message);
        throw new Error('Customer not found.');
    }
};

// Verify if the product exists
const verifyProduct = async (productId) => {
    try {
        const response = await axios.get(`http://localhost:3000/products/${productId}`);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error('Product not found.');
    } catch (error) {
        console.error('Error verifying product:', error.message);
        throw new Error('Product not found.');
    }
};

// Create a new order (Customers only)
app.post('/orders', authenticateJWT, async (req, res) => {
    // Ensure only customers can create orders
    if (req.user.role !== 'customer') {
        return res.sendStatus(403); // Forbidden
    }

    const { id, customerId, productId, quantity } = req.body;

    if (!id || !customerId || !productId || !quantity) {
        return res.status(400).json({ message: 'Order ID, customer ID, product ID, and quantity are required.' });
    }

    try {
        const customerData = await verifyCustomer(customerId);
        const productData = await verifyProduct(productId);

        const newOrder = { id, customer: customerData, product: productData, quantity };
        orders.push(newOrder);
        return res.status(201).json(newOrder);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

// Get an order by ID (Admins only)
app.get('/orders/:orderId', authenticateJWT, (req, res) => {
    // Only admins can view orders by ID
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

    const orderId = req.params.orderId;
    const order = orders.find(order => order.id === orderId);

    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(order);
});

// Update an order by ID (Customers only)
app.put('/orders/:orderId', authenticateJWT, (req, res) => {
    // Ensure only customers can update orders
    if (req.user.role !== 'customer') {
        return res.sendStatus(403); // Forbidden
    }

    const orderId = req.params.orderId;
    const { quantity } = req.body;

    const order = orders.find(order => order.id === orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    order.quantity = quantity || order.quantity;
    return res.json(order);
});

// Delete an order by ID (Admins only)
app.delete('/orders/:orderId', authenticateJWT, (req, res) => {
    // Only admins can delete orders
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

    const orderId = req.params.orderId;
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    orders.splice(orderIndex, 1);
    return res.status(204).send();
});

// Start the server
app.listen(port, () => {
    console.log(`Order service running on port ${port}`);
});
