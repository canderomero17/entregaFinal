import express from 'express'
import { engine } from 'express-handlebars'
import __dirname from './utils.js';
import * as path from "path"
import productRouter from './router/product.routes.js';
import cartsRouter from './router/carts.routes.js';
import { Server } from 'socket.io'
import { productModel } from './models/product.model.js'
import { cartModel } from './models/cart.model.js'
import mongoose from 'mongoose'

const app = express();
const PORT = 8080;

const urlDB = 'mongodb+srv://admin:admin@cluster0.raqhe.mongodb.net/entregaFinalCh?retryWrites=true&w=majority&appName=Cluster0'
const connectMongoDB = async () => {
    try {
        await mongoose.connect(urlDB)
        console.log("Conectado con exito a Mongo Atlas usando Mongoose")
    } catch (error) {
        console.error("No se pudo conectar a la DB usando Mongoose: " + error)
        process.exit()
    }
}
connectMongoDB()


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Serving static files from:', path.join(__dirname, 'public'));

//configuracion handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"))

app.use('/api/products', productRouter);
app.use('/api/carts', cartsRouter);

app.get("/", async (req, res) => {
    try {
        const { limit = 10, page = 1, categoria, disponibilidad, sort } = req.query;
        let query = {};

        if (categoria) {
            query.categoria = categoria;
        }

        if (disponibilidad === 'true') {
            query.stock = { $gt: 0 }; // Productos disponibles (stock > 0)
        } else if (disponibilidad === 'false') {
            query.stock = { $eq: 0 }; // Productos no disponibles (stock == 0)
        }

        const options = {
            limit: parseInt(limit),  
            page: parseInt(page),    
            sort: sort ? { precio: sort === 'asc' ? 1 : -1 } : {},  
            lean: true
        };

        const result = await productModel.paginate(query, options);
        const { totalPages, hasPrevPage, hasNextPage, prevPage, nextPage, page: currentPage, docs: products } = result;
        const prevLink = hasPrevPage ? `/api/products?page=${prevPage}&limit=${limit}` : null;
        const nextLink = hasNextPage ? `/api/products?page=${nextPage}&limit=${limit}` : null;

        res.render('home', {
            title: "E-commerce",
            products,
            totalPages,
            prevPage,
            nextPage,
            currentPage,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
            limit
        });

    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});

app.get("/realtimeproducts", async (req, res) => {
    try {
        const products = await productModel.find();
        res.render('realTimeProducts', {
            title: "Productos en tiempo real",
            products 
        });
    } catch (error) {
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
});

app.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params; 
        const cart = await cartModel.findById(cid).populate('productos.productoId'); 

        res.render('cart', {
            title: 'Carrito de Compras',
            cart 
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor por puerto ${PORT}`)
})

const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {

    console.log("nuevo cliente conectado")

    socket.on('newProduct', async (productData) => {
        try {
            const newProduct = new Product(productData); 
            await newProduct.save(); 
            const products = await Product.find(); 
            socketServer.emit('updateProductList', products);
          } catch (error) {
            console.error('Error al guardar producto:', error);
          }
    });

})