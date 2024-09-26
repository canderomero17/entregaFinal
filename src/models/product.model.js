import mongoose from 'mongoose';

const productCollection = 'productos'

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String, required: true },
  stock: { type: Number, default: 0 },
  codigo: { type: Number, required: true },
  estado: { type: Boolean, default: true },
  categoria: { type: String, required: true },
  thumbnails: Array,
},
{
    versionKey: false
});

export const productModel = mongoose.model(productCollection, productSchema);

