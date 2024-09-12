import CartManager from '../managers/cartManager.js';

const express = require('express');
const router = express.Router();
const cartManager = new CartManager()

// OBTENER CARRITO POR ID
router.get('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    try {
        const cart = await cartManager.getCartById(cartId);
        res.json(cart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// AGREGAR CARRITO
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ELIMINAR CARRITO POR ID
router.delete('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    try {
        await cartManager.deleteCart(cartId);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// AGREGAR PRODUCTO A CARRITO POR SU ID
router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        res.status(201).json(updatedCart);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


// CREAR CARRITO
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el nuevo carrito' });
    }
});

module.exports = router;
