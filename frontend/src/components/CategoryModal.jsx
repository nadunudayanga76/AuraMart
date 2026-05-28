import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const CategoryModal = ({ isOpen, onClose, category, onCategorySaved }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    itemsCount: '0+',
    homepageImage: '',
    homepageColor: 'bg-gray-50',
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    heroBg: 'bg-gray-100',
    subCategories: [],
    tabs: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        itemsCount: category.itemsCount || '0+',
        homepageImage: category.homepageImage || '',
        homepageColor: category.homepageColor || 'bg-gray-50',
        heroTitle: category.heroTitle || '',
        heroSubtitle: category.heroSubtitle || '',
        heroImage: category.heroImage || '',
        heroBg: category.heroBg || 'bg-gray-100',
        subCategories: category.subCategories || [],
        tabs: category.tabs || []
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        itemsCount: '0+',
        homepageImage: '',
        homepageColor: 'bg-gray-50',
        heroTitle: '',
        heroSubtitle: '',
        heroImage: '',
        heroBg: 'bg-gray-100',
        subCategories: [],
        tabs: []
      });
    }
    setError('');
  }, [category, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubCategoryChange = (index, field, value) => {
    const updated = [...formData.subCategories];
    updated[index][field] = value;
    setFormData({ ...formData, subCategories: updated });
  };

  const addSubCategory = () => {
    setFormData({ 
      ...formData, 
      subCategories: [...formData.subCategories, { name: '', img: '' }] 
    });
  };

  const removeSubCategory = (index) => {
    const updated = formData.subCategories.filter((_, i) => i !== index);
    setFormData({ ...formData, subCategories: updated });
  };

  const handleTabChange = (index, value) => {
    const updated = [...formData.tabs];
    updated[index] = value;
    setFormData({ ...formData, tabs: updated });
  };

  const addTab = () => {
    setFormData({ ...formData, tabs: [...formData.tabs, ''] });
  };

  const removeTab = (index) => {
    const updated = formData.tabs.filter((_, i) => i !== index);
    setFormData({ ...formData, tabs: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      if (category) {
        // Update
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${category._id}`, formData, config);
      } else {
        // Create
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, formData, config);
      }
      
      onCategorySaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {category ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Basic Info */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information (Homepage)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Slug (URL)</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Items Count (e.g. 150+)</label>
                  <input type="text" name="itemsCount" value={formData.itemsCount} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Homepage Icon URL</label>
                  <input type="text" name="homepageImage" value={formData.homepageImage} onChange={handleChange} required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Homepage Icon Bg Color (Tailwind)</label>
                  <input type="text" name="homepageColor" value={formData.homepageColor} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="e.g. bg-blue-50" />
                </div>
              </div>
            </div>

            {/* Section 2: Hero Banner */}
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Category Page Banner</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hero Title</label>
                  <input type="text" name="heroTitle" value={formData.heroTitle} onChange={handleChange} required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hero Bg Color (Tailwind)</label>
                  <input type="text" name="heroBg" value={formData.heroBg} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" placeholder="e.g. bg-[#eef2f5]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hero Subtitle</label>
                  <textarea name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} required rows="2"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hero Image URL</label>
                  <input type="text" name="heroImage" value={formData.heroImage} onChange={handleChange} required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
              </div>
            </div>

            {/* Section 3: Subcategories */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Sub Categories (Circles)</h3>
                <button type="button" onClick={addSubCategory} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                  <FiPlus /> Add SubCategory
                </button>
              </div>
              <div className="space-y-4">
                {formData.subCategories.map((sub, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <input type="text" placeholder="Name" value={sub.name} onChange={(e) => handleSubCategoryChange(index, 'name', e.target.value)} required
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    <input type="text" placeholder="Image URL" value={sub.img} onChange={(e) => handleSubCategoryChange(index, 'img', e.target.value)} required
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    <button type="button" onClick={() => removeSubCategory(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer">
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Tabs */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Filter Tabs</h3>
                <button type="button" onClick={addTab} className="text-sm font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                  <FiPlus /> Add Tab
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.tabs.map((tab, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <input type="text" placeholder="Tab Name" value={tab} onChange={(e) => handleTabChange(index, e.target.value)} required
                      className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    <button type="button" onClick={() => removeTab(index)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg cursor-pointer">
                      <FiTrash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-2.5 font-bold text-white bg-primary hover:bg-red-600 rounded-xl transition shadow-lg shadow-red-500/30 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading && <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>}
                {category ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
