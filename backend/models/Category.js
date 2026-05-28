import mongoose from 'mongoose';

const subCategorySchema = mongoose.Schema({
  name: { type: String, required: true },
  img: { type: String, required: true },
});

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    itemsCount: {
      type: String,
      required: true,
      default: "0+",
    },
    homepageImage: {
      type: String,
      required: true,
    },
    homepageColor: {
      type: String,
      required: true,
      default: "bg-gray-50",
    },
    heroTitle: {
      type: String,
      required: true,
    },
    heroSubtitle: {
      type: String,
      required: true,
    },
    heroImage: {
      type: String,
      required: true,
    },
    heroBg: {
      type: String,
      required: true,
      default: "bg-gray-100",
    },
    subCategories: [subCategorySchema],
    tabs: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

export default Category;
