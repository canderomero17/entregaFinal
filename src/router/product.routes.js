import express from 'express';
import ProductManager from '../managers/productManager.js';
import { productModel } from '../models/product.model.js';

const router = express.Router();
const productManager = new ProductManager();

// LISTAR PRODUCTOS
router.get('/', async(req, res) => {
    try {
        let products = await productModel.find()
        res.send({results: 'success', payload: products})
    } catch (error) {
        console.error("No se pudo obtener productos con mongoose: " + error)
        res.status(500).send({ error: "No se pudo obtener productos con mongoose", message: error})
    }
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
router.post('/', async(req, res) => {
    try {
        let { id, nombre, precio, descripcion, stock, codigo, estado, categoria, thumbnails} = req.body
        //validaciones pendientes
        let products = await productModel.create( { id, nombre, precio, descripcion, stock, codigo, estado, categoria, thumbnails})
        res.status(201).send(products)
    } catch (error) {
        console.error("No se pudo crear productos con mongoose: " + error)
        res.status(500).send({ error: "No se pudo crear productos con mongoose", message: error})
    }
});



// ACTUALIZAR PRODUCTO POR ID
router.put('/:id', async (req, res) => {
    try {
        let productUpdate = req.body
        let product = await productModel.updateOne({ _id: req.params.id }, productUpdate)
        res.status(202).send(product)
    } catch (error) {
        console.error("No se pudo actualizar producto con moongose: " + error);
        res.status(500).send({ error: "No se pudo actualizar producto con moongose", message: error });
    }
});


// ELIMINAR PRODUCTO POR ID
router.delete('/:id', async (req, res) => {
    try {
        let result = await productModel.deleteOne({ _id: req.params.id })
        res.status(202).send({ status: "success", payload: result });
    } catch (error) {
        console.error("No se pudo eliminar producto con moongose: " + error);
        res.status(500).send({ error: "No se pudo eliminar producto con moongose", message: error });
    }
});

export default router;
