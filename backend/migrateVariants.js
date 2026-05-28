import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auramart')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const migrateVariants = async () => {
  try {
    const products = await Product.find({});
    let updatedCount = 0;

    for (const product of products) {
      let needsUpdate = false;
      let newVariants = [];

      const hasColors = product.colors && product.colors.length > 0;
      const hasSizes = product.sizes && product.sizes.length > 0;

      // Check if variants already have sizes properly mapped.
      // If any existing variant has no size but the product HAS sizes, we should migrate.
      // Or if the product has no variants at all but has sizes or colors.
      const hasProperVariants = product.variants && product.variants.length > 0 && 
                               product.variants.some(v => v.size || v.color);

      if (!hasProperVariants && (hasColors || hasSizes)) {
        needsUpdate = true;
        const totalStock = product.countInStock || 0;
        
        let combinations = [];
        
        if (hasColors && hasSizes) {
          product.colors.forEach(color => {
            product.sizes.forEach(size => {
              combinations.push({ color, size });
            });
          });
        } else if (hasColors) {
          product.colors.forEach(color => {
            combinations.push({ color, size: '' });
          });
        } else if (hasSizes) {
          product.sizes.forEach(size => {
            combinations.push({ color: '', size });
          });
        }

        if (combinations.length > 0) {
          const stockPerVariant = Math.floor(totalStock / combinations.length);
          const remainder = totalStock % combinations.length;

          newVariants = combinations.map((combo, index) => ({
            ...combo,
            image: '',
            countInStock: index === 0 ? stockPerVariant + remainder : stockPerVariant
          }));
        }

        product.variants = newVariants;
        await product.save();
        updatedCount++;
        console.log(`Migrated product: ${product.name}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrateVariants();
