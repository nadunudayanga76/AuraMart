import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: [{ type: String }],
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    productType: { type: String },
    description: { type: String, required: true },
    features: [{ type: String }],
    colors: [{ type: String }],
    sizes: [{ type: String }],
    variants: [
      {
        color: { type: String },
        size: { type: String },
        image: { type: String },
        countInStock: { type: Number, default: 0 },
      }
    ],
    specifications: [
      {
        key: { type: String },
        value: { type: String }
      }
    ],
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number },
    discountedPrice: { type: Number },
    flashSaleEndDate: { type: Date },
    countInStock: { type: Number, required: true, default: 0 },
    orders: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
