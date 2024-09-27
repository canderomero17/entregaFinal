import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'

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

productSchema.plugin(mongoosePaginate)
export const productModel = mongoose.model(productCollection, productSchema);

