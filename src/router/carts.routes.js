const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// OBTENER CARRITO POR ID
router.get('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const filePath = path.join(__dirname, '../data/carts.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los carritos' });
        }
        const carts = JSON.parse(data);
        const cart = carts.find(c => c.id === cartId);

        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    });
});

// AGREGAR CARRITO
router.post('/', (req, res) => {
    const filePath = path.join(__dirname, '../data/carts.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los carritos' });
        }
        let carts = JSON.parse(data);

        const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;

        const newCart = {
            id: newId,
            products: []  
        };
        
        carts.push(newCart);

        fs.writeFile(filePath, JSON.stringify(carts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el carrito' });
            }
            res.status(201).json(newCart);
        });
    });
});

// ELIMINAR CARRITO POR ID
router.delete('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const filePath = path.join(__dirname, '../data/carts.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los carritos' });
        }
        let carts = JSON.parse(data);
        const updatedCarts = carts.filter(c => c.id !== cartId);

        if (carts.length === updatedCarts.length) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        fs.writeFile(filePath, JSON.stringify(updatedCarts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar el carrito' });
            }
            res.status(204).send();
        });
    });
});


// AGREGAR PRODUCTO A CARRITO POR SU ID
router.post('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const filePathCarts = path.join(__dirname, '../data/carts.json');
    const filePathProducts = path.join(__dirname, '../data/products.json');

    fs.readFile(filePathCarts, 'utf8', (err, cartsData) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los carritos' });
        }
        let carts = JSON.parse(cartsData);
        const cartIndex = carts.findIndex(c => c.id === cartId);

        if (cartIndex === -1) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        fs.readFile(filePathProducts, 'utf8', (err, productsData) => {
            if (err) {
                return res.status(500).json({ error: 'Error al leer los productos' });
            }
            const products = JSON.parse(productsData);
            const product = products.find(p => p.id === productId);

            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            const productInCart = carts[cartIndex].products.find(p => p.productId === productId);

            if (productInCart) {
                productInCart.cantidad += 1;
            } else {
                carts[cartIndex].products.push({ productId, cantidad: 1 });
            }

            fs.writeFile(filePathCarts, JSON.stringify(carts, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error al actualizar el carrito' });
                }
                res.status(201).json(carts[cartIndex]);
            });
        });
    });
});


// CREAR CARRITO
router.post('/', (req, res) => {
    const filePath = path.join(__dirname, '../data/carts.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los carritos' });
        }
        let carts = JSON.parse(data);

        const newId = carts.length ? carts[carts.length - 1].id + 1 : 1;

        const newCart = {
            id: newId,
            products: []
        };

        carts.push(newCart);

        fs.writeFile(filePath, JSON.stringify(carts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al crear el nuevo carrito' });
            }
            res.status(201).json(newCart);
        });
    });
});

module.exports = router;
