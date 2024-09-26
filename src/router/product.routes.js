import express from 'express';
import ProductManager from '../managers/productManager.js';
import { productModel } from '../models/product.model.js';

const router = express.Router();
const productManager = new ProductManager();

// LISTAR PRODUCTOS
router.get('/', async(req, res) => {
    try {
        // const { limit = 10, page = 1, sort, query } = req.query;

        // const limitNumber = parseInt(limit);
        // const pageNumber = parseInt(page);

        // const filter = {};
        // const sortOptions = {};

        // if (nombre) {
        //     filter.nombre = new RegExp(query, 'i'); // Buscar por nombre
        // }
        // if (categoria) {
        //     filter.categoria = category; // Filtrar por categoría
        // }
        // if (stock !== undefined) {
        //     filter.stock = { $gt: 0 }; // Filtrar solo productos disponibles (stock > 0)
        // }

        // if (sort === 'asc') {
        //     sortOptions.precio = 1; 
        // } else if (sort === 'desc') {
        //     sortOptions.precio = -1; 
        // }
        // const products = await productModel.find(filter)
        //     .sort(sortOptions)
        //     .limit(limitNumber)
        //     .skip((pageNumber - 1) * limitNumber); 

        // const totalProducts = await productModel.countDocuments(filter);
        // const totalPages = Math.ceil(totalProducts / limitNumber);

        // // Determinar si hay páginas anteriores o siguientes
        // const hasPrevPage = pageNumber > 1;
        // const hasNextPage = pageNumber < totalPages;

        // // Crear enlaces para las páginas
        // const prevLink = hasPrevPage ? `/products?limit=${limitNumber}&page=${pageNumber - 1}&sort=${sort}&query=${query || ''}` : null;
        // const nextLink = hasNextPage ? `/products?limit=${limitNumber}&page=${pageNumber + 1}&sort=${sort}&query=${query || ''}` : null;

        // res.send({
        //     status: 'success',
        //     payload: products,
        //     totalPages,
        //     prevPage: hasPrevPage ? pageNumber - 1 : null,
        //     nextPage: hasNextPage ? pageNumber + 1 : null,
        //     page: pageNumber,
        //     hasPrevPage,
        //     hasNextPage,
        //     prevLink,
        //     nextLink
        // });  
        let products = await productModel.find()
        res.send({results: 'success', payload: products})
  
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
