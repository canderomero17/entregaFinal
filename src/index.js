import express from 'express'
import { engine } from 'express-handlebars'
import __dirname from './utils.js';
import * as path from "path"
import fs from 'fs/promises';
import productRouter from './router/product.routes.js';
import { Server } from 'socket.io'

const app = express();
const PORT = 8080;
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Serving static files from:', path.join(__dirname, 'public'));

//configuracion handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname + "/views"))

app.use('/api/products', productRouter);

app.get("/", async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data/products.json');
        const data = await fs.readFile(filePath, 'utf8');
        const products = JSON.parse(data);
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
        const filePath = path.join(__dirname, 'data/products.json');
        const data = await fs.readFile(filePath, 'utf8');
        const products = JSON.parse(data);
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
        const filePath = path.join(__dirname, 'data/products.json');
        const data = await fs.readFile(filePath, 'utf8');
        let products = JSON.parse(data);

        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        const newProduct = { id: newId, ...productData };

        products.push(newProduct);

        await fs.writeFile(filePath, JSON.stringify(products, null, 2));
        socketServer.emit('updateProductList', products);
    });

})