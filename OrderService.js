const express = require('express');
const axios = require('axios');
const app = express();
const port = 3002;

app.use(express.json());

let orders = [];


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


app.post('/orders', async (req, res) => {
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


app.get('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const order = orders.find(order => order.id === orderId);

    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(order);
});


app.put('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const { quantity } = req.body;

    const order = orders.find(order => order.id === orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    order.quantity = quantity || order.quantity;
    return res.json(order);
});


app.delete('/orders/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    orders.splice(orderIndex, 1);
    return res.status(204).send();
});

app.listen(port, () => {
    console.log(`Order service running on port ${port}`);
});