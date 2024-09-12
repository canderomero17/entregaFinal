import express from 'express';
import ProductManager from '../managers/productManager.js';

const router = express.Router();
const productManager = new ProductManager();

// LISTAR PRODUCTOS
router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit);
    const products = productManager.getProducts(limit); 
    res.json(products);
});

// OBTENER PRODUCTO POR ID
router.get('/:pid', (req, res) => {
    const productId = parseInt(req.params.pid);
    const product = productManager.getProductById(productId); 
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// AGREGAR NUEVO PRODUCTO
router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
});

// ACTUALIZAR PRODUCTO POR ID
router.put('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    const updatedProduct = await productManager.updateProduct(productId, req.body);

    if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(updatedProduct);
});


// ELIMINAR PRODUCTO POR ID
router.delete('/:pid', async (req, res) => {
    const productId = parseInt(req.params.pid);
    const success = await productManager.deleteProduct(productId);

    if (!success) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(204).send(); 
});

export default router;
