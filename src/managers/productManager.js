import fs from 'fs/promises';
import path from 'path';
import __dirname from '../utils.js';

const filePath = path.join(__dirname, '../src/data/products.json');

export default class ProductManager {
    constructor() {
        this.products = [];
        this.init();
    }

    // Inicializa los productos cargando el archivo una vez
    async init() {
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            this.products = JSON.parse(data);
        } catch (error) {
            console.error('Error al leer el archivo de productos:', error);
            this.products = []; // En caso de error, iniciamos la lista vacía
        }
    }

    // Guardar productos en el archivo
    async saveFile() {
        try {
            await fs.writeFile(filePath, JSON.stringify(this.products, null, 2));
        } catch (error) {
            console.error('Error al guardar el archivo de productos:', error);
            throw new Error('No se pudo guardar el archivo de productos');
        }
    }

    // Obtener todos los productos (con posibilidad de limitar resultados)
    getProducts(limit) {
        if (limit) {
            return this.products.slice(0, limit);
        }
        return this.products;
    }

    // Obtener un producto por ID
    getProductById(productId) {
        const product = this.products.find(p => p.id === productId);
        return product || null;
    }

    // Añadir un nuevo producto
    async addProduct(newProductData) {
        const newId = this.products.length ? this.products[this.products.length - 1].id + 1 : 1;
        const newProduct = { id: newId, ...newProductData };

        this.products.push(newProduct);
        await this.saveFile(); // Guardamos en el archivo tras agregar el producto

        return newProduct;
    }

    async updateProduct(productId, productData) {
        const productIndex = this.products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return null;
        }

        this.products[productIndex] = {
            ...this.products[productIndex],
            ...productData // Actualiza solo los campos presentes en productData
        };

        await this.saveFile();
        return this.products[productIndex];
    }

    async deleteProduct(productId) {
        const initialLength = this.products.length;
        this.products = this.products.filter(p => p.id !== productId);

        if (this.products.length === initialLength) {
            return false; // Producto no encontrado
        }

        await this.saveFile();
        return true;
    }
}

