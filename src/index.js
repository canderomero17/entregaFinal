import express from 'express'
import { engine } from 'express-handlebars'
import __dirname from './utils.js';
import * as path from "path"
import productRouter from './router/product.routes.js';
import cartsRouter from './router/carts.routes.js';
import { Server } from 'socket.io'
import { productModel } from './models/product.model.js'
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
        const products = await productModel.find();
        res.render('home', {
            title: "E-commerce",
            products 
        });
    } catch (error) {
        console.error('Error al leer el archivo de productos:', error);
        res.status(500).send('Error al obtener los productos');
    }
})

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

const httpServer = app.listen(PORT, () => {
    console.log(`Servidor por puerto ${PORT}`)
})

const socketServer = new Server(httpServer);

socketServer.on('connection', socket => {

    console.log("nuevo cliente conectado")

    socket.on('newProduct', async (productData) => {
        try {
            const newProduct = new Product(productData); // Creamos un nuevo producto usando MongoDB
            await newProduct.save(); // Guardamos en MongoDB
            const products = await Product.find(); // Obtenemos todos los productos actualizados
            socketServer.emit('updateProductList', products);
          } catch (error) {
            console.error('Error al guardar producto:', error);
          }
    });

})