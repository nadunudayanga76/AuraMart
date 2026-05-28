import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const ProductModal = ({ isOpen, onClose, product, onProductSaved }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    subCategory: '',
    productType: '',
    description: '',
    price: 0,
    originalPrice: 0,
    countInStock: 0,
    colors: '',
    sizes: '',
    flashSaleEndDate: '',
  });

  const [images, setImages] = useState(['', '', '', '', '']); // Array of 5 strings
  const [variants, setVariants] = useState([{ color: '', image: '', countInStock: 0 }]);
  const [uploadingImageIndex, setUploadingImageIndex] = useState(null);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [features, setFeatures] = useState(['']);

  const [categoriesList, setCategoriesList] = useState([]);
  const [subCategoriesList, setSubCategoriesList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`);
          setCategoriesList(data);
        } catch (error) {
          console.error("Failed to fetch categories list", error);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.category) {
      const selectedCat = categoriesList.find(c => c.name === formData.category);
      if (selectedCat && selectedCat.subCategories) {
        setSubCategoriesList(selectedCat.subCategories);
      } else {
        setSubCategoriesList([]);
      }
    }
  }, [formData.category, categoriesList]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        productType: product.productType || '',
        description: product.description || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        countInStock: product.countInStock || 0,
        colors: product.colors ? product.colors.join(', ') : '',
        sizes: product.sizes ? product.sizes.join(', ') : '',
        flashSaleEndDate: product.flashSaleEndDate ? new Date(product.flashSaleEndDate).toISOString().slice(0, 16) : '',
      });
      
      // Setup Images (Ensure at least 5 slots)
      let imgs = [product.image || '']; // Main image is at index 0
      if (product.images && product.images.length > 0) {
        imgs = [...imgs, ...product.images];
      }
      while (imgs.length < 5) imgs.push('');
      setImages(imgs);

      // Setup Specs
      if (product.specifications && product.specifications.length > 0) {
        setSpecifications(product.specifications);
      } else {
        setSpecifications([{ key: '', value: '' }]);
      }

      // Setup Features
      if (product.features && product.features.length > 0) {
        setFeatures(product.features);
      } else {
        setFeatures(['']);
      }

      // Setup Variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      } else {
        setVariants([{ color: '', image: '', countInStock: 0 }]);
      }

    } else {
      // Reset
      setFormData({
        name: '', brand: '', category: '', subCategory: '', productType: '', description: '', price: 0, originalPrice: 0, countInStock: 0,
        colors: '', sizes: '', flashSaleEndDate: ''
      });
      setImages(['', '', '', '', '']);
      setSpecifications([{ key: '', value: '' }]);
      setFeatures(['']);
      setVariants([{ color: '', image: '', countInStock: 0 }]);
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const uploadFileHandler = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImageIndex(index);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, formData, config);
      
      const newImages = [...images];
      newImages[index] = data.image;
      setImages(newImages);
    } catch (error) {
      console.error(error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };
  const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const removeSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const addFeature = () => setFeatures([...features, '']);
  const removeFeature = (index) => setFeatures(features.filter((_, i) => i !== index));

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
    
    // Auto calculate stock
    if (field === 'countInStock') {
      const totalStock = newVariants.reduce((acc, v) => acc + (Number(v.countInStock) || 0), 0);
      setFormData(prev => ({ ...prev, countInStock: totalStock }));
    }
  };
  const addVariant = () => setVariants([...variants, { color: '', size: '', image: '', countInStock: 0 }]);
  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
    const totalStock = newVariants.reduce((acc, v) => acc + (Number(v.countInStock) || 0), 0);
    setFormData(prev => ({ ...prev, countInStock: totalStock }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Process Images: index 0 is main image, rest are gallery images
    const validImages = images.map(img => img.trim()).filter(img => img);
    if (validImages.length === 0) {
      alert("Please provide at least one image URL.");
      return;
    }
    
    const mainImage = validImages[0];
    const galleryImages = validImages.slice(1);

    const parsedData = {
      ...formData,
      image: mainImage,
      images: galleryImages,
      features: features.map(f => f.trim()).filter(f => f),
      colors: variants.length > 0 ? [...new Set(variants.map(v => v.color.trim()).filter(c => c))] : formData.colors.split(',').map(s => s.trim()).filter(s => s),
      sizes: variants.length > 0 ? [...new Set(variants.map(v => v.size?.trim()).filter(s => s))] : formData.sizes.split(',').map(s => s.trim()).filter(s => s),
      variants: variants.filter(v => v.color?.trim() || v.size?.trim()),
      specifications: specifications.filter(s => s.key.trim() && s.value.trim())
    };

    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      if (product) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${product._id}`, parsedData, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, parsedData, config);
      }
      onProductSaved();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <form id="productForm" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="E.g. iPhone 15 Pro Max" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="E.g. Apple" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                  <input type="number" name="countInStock" value={formData.countInStock} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-gray-100 disabled:text-gray-500" readOnly={variants.length > 0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="" disabled>Select Category</option>
                    {categoriesList.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Sub Category</label>
                  <select 
                    name="subCategory" 
                    value={formData.subCategory} 
                    onChange={handleChange} 
                    disabled={subCategoriesList.length === 0}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-primary/20 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategoriesList.map((sub, idx) => (
                      <option key={idx} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Type / Tag (Optional)</label>
                <input type="text" name="productType" value={formData.productType} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Trousers, T-Shirts, Laptops" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (LKR)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Original Price (LKR)</label>
                  <input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-gray-500 line-through" />
                </div>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-orange-700">⚡ Flash Sale End Date (Optional)</label>
                  <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wide bg-orange-100 px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-xs text-orange-600 mb-3 font-medium">Set a future date to automatically feature this product in the homepage Flash Sale section. Leave blank to disable.</p>
                <input type="datetime-local" name="flashSaleEndDate" value={formData.flashSaleEndDate} onChange={handleChange} className="w-full p-2.5 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 outline-none bg-white text-gray-800" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="5" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Detailed product description..."></textarea>
              </div>
            </div>

            {/* Right Column: Images, Specs, Attributes */}
            <div className="space-y-6">
              
              {/* Images Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Product Images (5 max)</h3>
                <p className="text-xs text-gray-500">The first image is the main cover image. Upload an image or paste a URL.</p>
                
                <div className="space-y-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        {img ? (
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">{idx === 0 ? 'Main' : idx+1}</span>
                        )}
                        {uploadingImageIndex === idx && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => uploadFileHandler(e, idx)} 
                          className="text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                        />
                        <input 
                          type="url" 
                          value={img} 
                          onChange={(e) => handleImageChange(idx, e.target.value)} 
                          placeholder={idx === 0 ? "Or paste Image URL here *" : `Or paste Gallery Image URL ${idx}`}
                          className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${idx === 0 ? 'border-primary/50 focus:border-primary bg-blue-50/30' : 'border-gray-300 focus:border-gray-500'}`}
                          required={idx === 0 && !img}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specifications Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-800">Detailed Specifications</h3>
                  <button type="button" onClick={addSpec} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-bold text-gray-700 flex items-center gap-1 transition-colors">
                    <FiPlus /> Add Row
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={spec.key} 
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)} 
                        placeholder="Key (e.g. Memory)"
                        className="w-1/3 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <input 
                        type="text" 
                        value={spec.value} 
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)} 
                        placeholder="Value (e.g. 128GB)"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attributes Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-800">Color Variants</h3>
                  <button type="button" onClick={addVariant} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full font-bold text-gray-700 flex items-center gap-1 transition-colors">
                    <FiPlus /> Add Variant
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {variants.map((variant, idx) => (
                    <div key={idx} className="flex items-center gap-2 flex-wrap">
                      <input 
                        type="text" 
                        value={variant.color || ''} 
                        onChange={(e) => handleVariantChange(idx, 'color', e.target.value)} 
                        placeholder="Color (e.g. Red)"
                        className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <input 
                        type="text" 
                        value={variant.size || ''} 
                        onChange={(e) => handleVariantChange(idx, 'size', e.target.value)} 
                        placeholder="Size (e.g. M)"
                        className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <input 
                        type="url" 
                        value={variant.image || ''} 
                        onChange={(e) => handleVariantChange(idx, 'image', e.target.value)} 
                        placeholder="Image URL"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <input 
                        type="number" 
                        value={variant.countInStock} 
                        onChange={(e) => handleVariantChange(idx, 'countInStock', Number(e.target.value))} 
                        placeholder="Stock"
                        className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                      <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Legacy Attributes</h4>
                  <p className="text-xs text-gray-500 mb-3">If you use variants above, you don't need to fill these out. They will be auto-generated.</p>
                  <div className="mb-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Legacy Colors (Comma separated)</label>
                    <input type="text" name="colors" value={formData.colors} onChange={handleChange} disabled={variants.length > 0} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none text-sm disabled:bg-gray-100" placeholder="Red, Blue, Titanium" />
                  </div>
                  {(!formData.category || formData.category.toLowerCase().includes('fashion') || formData.category.toLowerCase().includes('clothing')) && (
                    <div className="mb-3">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Sizes (Comma separated)</label>
                      <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} disabled={variants.length > 0} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none text-sm disabled:bg-gray-100" placeholder="S, M, L, XL" />
                    </div>
                  )}
                </div>
              </div>

            </div>

          </form>
        </div>
        
        <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10 relative">
          <button type="button" onClick={onClose} className="px-6 py-2.5 border-2 border-gray-200 rounded-full font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all">Cancel</button>
          <button type="submit" form="productForm" className="px-8 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-primary transition-all shadow-lg hover:shadow-primary/30">Save Product</button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
