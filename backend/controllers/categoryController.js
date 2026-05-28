import Category from '../models/Category.js';

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Fetch single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });

    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      slug: req.body.slug,
      itemsCount: req.body.itemsCount || '0+',
      homepageImage: req.body.homepageImage,
      homepageColor: req.body.homepageColor || 'bg-gray-50',
      heroTitle: req.body.heroTitle,
      heroSubtitle: req.body.heroSubtitle,
      heroImage: req.body.heroImage,
      heroBg: req.body.heroBg || 'bg-gray-100',
      subCategories: req.body.subCategories || [],
      tabs: req.body.tabs || [],
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;
      category.itemsCount = req.body.itemsCount || category.itemsCount;
      category.homepageImage = req.body.homepageImage || category.homepageImage;
      category.homepageColor = req.body.homepageColor || category.homepageColor;
      category.heroTitle = req.body.heroTitle || category.heroTitle;
      category.heroSubtitle = req.body.heroSubtitle || category.heroSubtitle;
      category.heroImage = req.body.heroImage || category.heroImage;
      category.heroBg = req.body.heroBg || category.heroBg;
      category.subCategories = req.body.subCategories || category.subCategories;
      category.tabs = req.body.tabs || category.tabs;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
