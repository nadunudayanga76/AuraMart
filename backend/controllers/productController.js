import Product from '../models/Product.js';
import Inquiry from '../models/Inquiry.js';
import sendEmail from '../utils/sendEmail.js';

export const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let query = {};
    
    if (keyword) {
      query = {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { brand: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } },
        ]
      };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlashSaleProducts = async (req, res) => {
  try {
    const products = await Product.find({
      flashSaleEndDate: { $gt: new Date() }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name || 'Sample name',
      price: req.body.price || 0,
      originalPrice: req.body.originalPrice || 0,
      user: req.user._id,
      image: req.body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=600&fit=crop',
      images: req.body.images || [],
      brand: req.body.brand || 'Sample brand',
      category: req.body.category || 'Sample category',
      subCategory: req.body.subCategory || '',
      productType: req.body.productType || '',
      countInStock: req.body.countInStock || 0,
      numReviews: 0,
      description: req.body.description || 'Sample description',
      features: req.body.features || ['Sample feature 1'],
      colors: req.body.colors || [],
      sizes: req.body.sizes || [],
      variants: req.body.variants || [],
      specifications: req.body.specifications || [],
      orders: 0,
      flashSaleEndDate: req.body.flashSaleEndDate || null
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin only
export const updateProduct = async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    subCategory,
    productType,
    countInStock,
    discountedPrice,
    images,
    originalPrice,
    features,
    colors,
    sizes,
    variants,
    specifications,
    orders,
    flashSaleEndDate
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.price = price;
      product.description = description;
      product.image = image;
      product.brand = brand;
      product.category = category;
      if (subCategory !== undefined) product.subCategory = subCategory;
      if (productType !== undefined) product.productType = productType;
      product.countInStock = countInStock;
      product.discountedPrice = discountedPrice;
      if (flashSaleEndDate !== undefined) product.flashSaleEndDate = flashSaleEndDate;
      
      // New fields
      if (images !== undefined) product.images = images;
      if (originalPrice !== undefined) product.originalPrice = originalPrice;
      if (features !== undefined) product.features = features;
      if (colors !== undefined) product.colors = colors;
      if (sizes !== undefined) product.sizes = sizes;
      if (variants !== undefined) product.variants = variants;
      if (specifications !== undefined) product.specifications = specifications;
      if (orders !== undefined) product.orders = orders;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed by you' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Contact seller about a product
// @route   POST /api/products/:id/contact
// @access  Public
export const contactSeller = async (req, res) => {
  const { name, email, message } = req.body;
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
        <h2 style="color: #4C51BF;">New Product Inquiry</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Regarding Product:</strong> ${product.name}</p>
        <p><strong>Product ID:</strong> ${product._id}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3 style="color: #333;">Message:</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; color: #555; white-space: pre-wrap;">
          ${message}
        </div>
        <br/>
        <p style="font-size: 12px; color: #888;">This message was sent from the AuraMart Product Contact Form.</p>
      </div>
    `;

    // Save to Database
    await Inquiry.create({
      name,
      email,
      message,
      product: product._id,
      productName: product.name,
    });

    const success = await sendEmail({
      email: 'nadunudayanga76@gmail.com', // Seller's email
      subject: `Product Inquiry: ${product.name}`,
      html: emailHtml,
    });

    if (success) {
      res.status(200).json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews from all products
// @route   GET /api/products/reviews/all
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
  try {
    const products = await Product.find({}).select('name reviews');
    let allReviews = [];
    
    products.forEach((product) => {
      product.reviews.forEach((review) => {
        allReviews.push({
          _id: review._id,
          productId: product._id,
          productName: product.name,
          user: review.user,
          name: review.name,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
        });
      });
    });

    // Sort by date descending
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === req.params.reviewId.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    product.reviews.splice(reviewIndex, 1);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length
        : 0;

    await product.save();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
