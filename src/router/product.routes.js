import express from 'express';
import ProductManager from '../managers/productManager.js';
import { productModel } from '../models/product.model.js';

const router = express.Router();
const productManager = new ProductManager();

// LISTAR PRODUCTOS
router.get('/', async(req, res) => {
    try {
        const { limit = 10, page = 1, categoria, disponibilidad, sort } = req.query;
        let query = {};

        if (categoria) {
            query.categoria = categoria;  
          }
      
          if (disponibilidad === 'true') {
            query.stock = { $gt: 0 }; 
          } else if (disponibilidad === 'false') {
            query.stock = { $eq: 0 };  
          }
      
        const options = {
        limit: parseInt(limit),  
        page: parseInt(page),    
        sort: sort ? { precio: sort === 'asc' ? 1 : -1 } : {},  
        lean: true              
        };

        const result = await productModel.paginate(query, options);
        const { totalPages, hasPrevPage, hasNextPage, prevPage, nextPage, page: currentPage, docs } = result;
    
        const prevLink = hasPrevPage ? `/api/products?page=${prevPage}&limit=${limit}` : null;
        const nextLink = hasNextPage ? `/api/products?page=${nextPage}&limit=${limit}` : null;

        res.json({
        status: 'success',
        payload: docs,  
        totalPages,
        prevPage,
        nextPage,
        page: currentPage,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink
        });
    } catch (error) {
        console.error("No se pudo obtener productos con mongoose: " + error)
        res.status(500).send({ error: "No se pudo obtener productos con mongoose", message: error})
    }
});

// OBTENER PRODUCTO POR ID
router.get('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
        const product = await productModel.findById(productId); 
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto', message: error.message });
    }
});

// AGREGAR NUEVO PRODUCTO
router.post('/', async(req, res) => {
    try {
        let { nombre, precio, descripcion, stock, codigo, estado, categoria, thumbnails} = req.body

        if (!nombre || !precio || !descripcion || !stock || !codigo || !estado || !categoria) {
            return res.status(400).json({ 
                error: 'Todos los campos excepto thumbnails son obligatorios',
                requiredFields: ['nombre', 'precio', 'descripcion', 'stock', 'codigo', 'estado', 'categoria']
            });
        }

        let newProduct = await productModel.create( { nombre, precio, descripcion, stock, codigo, estado, categoria, thumbnails})
        res.status(201).send(newProduct)
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
