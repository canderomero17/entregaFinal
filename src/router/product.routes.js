import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// LISTAR PRODUCTOS
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit);
    const filePath = path.join(__dirname, '../data/products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo JSON:', err); // Añadido para depuración
            return res.status(500).json({ error: 'Error al leer los productos' });
        }
        let products = JSON.parse(data);

        if (limit) {
            products = products.slice(0, limit);
        }
        res.json(products);
    });
});

// OBTENER PRODUCTO POR ID
router.get('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const filePath = path.join(__dirname, '../data/products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los productos' });
        }
        const products = JSON.parse(data);
        const product = products.find(p => p.id === productId);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    });
});

// AGREGAR NUEVO PRODUCTO
router.post('/', (req, res) => {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || price == null || stock == null || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails.' });
    }

    const filePath = path.join(__dirname, '../data/products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los productos' });
        }
        let products = JSON.parse(data);

        const newId = products.length ? products[products.length - 1].id + 1 : 1;

        const newProduct = {
            id: newId,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        products.push(newProduct);

        fs.writeFile(filePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el nuevo producto' });
            }
            socketServer.emit('updateProductList', products);
            res.status(201).json(newProduct);
        });
    });
});

// ACTUALIZAR PRODUCTO POR ID
router.put('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const filePath = path.join(__dirname, '../data/products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los productos' });
        }
        let products = JSON.parse(data);
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        products[productIndex] = {
            ...products[productIndex],
            title: title || products[productIndex].title,
            description: description || products[productIndex].description,
            code: code || products[productIndex].code,
            price: price !== undefined ? price : products[productIndex].price,
            status: status !== undefined ? status : products[productIndex].status,
            stock: stock !== undefined ? stock : products[productIndex].stock,
            category: category || products[productIndex].category,
            thumbnails: thumbnails || products[productIndex].thumbnails
        };

        fs.writeFile(filePath, JSON.stringify(products, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al actualizar el producto' });
            }
            res.json(products[productIndex]);
        });
    });
});

// ELIMINAR PRODUCTO POR ID
router.delete('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const filePath = path.join(__dirname, '../data/products.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los productos' });
        }
        let products = JSON.parse(data);
        const updatedProducts = products.filter(p => p.id !== productId);

        if (products.length === updatedProducts.length) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        fs.writeFile(filePath, JSON.stringify(updatedProducts, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar el producto' });
            }
            res.status(204).send();
        });
    });
});

export default router;
