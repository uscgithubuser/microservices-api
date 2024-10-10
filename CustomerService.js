const express = require('express');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const app = express();
const port = 3001;

app.use(express.json());

let customers = [];

// Sample users data for authentication
const users = [
    { id: '1', username: 'user1', password: 'password1', role: 'customer' },
    { id: '2', username: 'admin', password: 'adminpass', role: 'admin' }
];

// JWT secret key
const SECRET_KEY = 'secret'; // Set the secret key

// JWT Generation function
function generateToken(user) {
    const payload = { id: user.id, role: user.role };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' }); // Use the secret key
}

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

// Helper function to find a customer by ID
const findCustomerById = (id) => customers.find(customer => customer.id === id);

// Create a new customer (Admins only)
app.post('/customers', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

    const { id, name, email } = req.body;

    if (!id || !name || !email) {
        return res.status(400).json({ message: 'Customer ID, name, and email are required.' });
    }

    if (findCustomerById(id)) {
        return res.status(400).json({ message: 'Customer with this ID already exists.' });
    }

    const newCustomer = { id, name, email };
    customers.push(newCustomer);
    return res.status(201).json(newCustomer);
});

// Get a customer by ID (Any authenticated user)
app.get('/customers/:customerId', authenticateJWT, (req, res) => {
    const customerId = req.params.customerId;
    const customer = findCustomerById(customerId);

    if (!customer) {
        return res.status(404).json({ message: 'Customer not found.' });
    }

    return res.json(customer);
});

// Update a customer by ID (Admins only)
app.put('/customers/:customerId', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

    const customerId = req.params.customerId;
    const { name, email } = req.body;

    const customer = findCustomerById(customerId);
    if (!customer) {
        return res.status(404).json({ message: 'Customer not found.' });
    }

    customer.name = name || customer.name;
    customer.email = email || customer.email;

    return res.json(customer);
});

// Delete a customer by ID (Admins only)
app.delete('/customers/:customerId', authenticateJWT, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Forbidden
    }

    const customerId = req.params.customerId;
    const customerIndex = customers.findIndex(customer => customer.id === customerId);

    if (customerIndex === -1) {
        return res.status(404).json({ message: 'Customer not found.' });
    }

    customers.splice(customerIndex, 1);
    return res.status(204).send();
});

// Sample login endpoint to get a JWT
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    return res.json({ token });
});

app.listen(port, () => {
    console.log(`Customer service running on port ${port}`);
});
