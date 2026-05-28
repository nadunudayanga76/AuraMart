import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiFilter, FiX, FiSliders } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

// ==========================================
// Butter-Smooth Custom Price Range Slider
// ==========================================
const PriceRangeSlider = ({ min, max, valueMin, valueMax, onChange, onReset }) => {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null); // 'min' | 'max' | null

  const getPercent = useCallback((value) => {
    return ((value - min) / (max - min || 1)) * 100;
  }, [min, max]);

  const getValueFromPosition = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percent * (max - min);
    // Round to nearest 100 for cleaner values
    const step = Math.max(1, Math.round((max - min) / 200));
    return Math.round(rawValue / step) * step;
  }, [min, max]);

  const handleMove = useCallback((clientX) => {
    if (!dragging) return;
    const newValue = getValueFromPosition(clientX);
    if (dragging === 'min') {
      const clamped = Math.max(min, Math.min(newValue, valueMax - 1));
      onChange(clamped, valueMax);
    } else {
      const clamped = Math.min(max, Math.max(newValue, valueMin + 1));
      onChange(valueMin, clamped);
    }
  }, [dragging, getValueFromPosition, min, max, valueMin, valueMax, onChange]);

  const handleEnd = useCallback(() => {
    setDragging(null);
  }, []);

  // Mouse events
  useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => { e.preventDefault(); handleMove(e.clientX); };
    const onMouseUp = () => handleEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, handleMove, handleEnd]);

  // Touch events
  useEffect(() => {
    if (!dragging) return;
    const onTouchMove = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
    const onTouchEnd = () => handleEnd();
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragging, handleMove, handleEnd]);

  // Click on track to jump thumb
  const handleTrackClick = (e) => {
    if (dragging) return;
    const clickVal = getValueFromPosition(e.clientX);
    const distToMin = Math.abs(clickVal - valueMin);
    const distToMax = Math.abs(clickVal - valueMax);
    if (distToMin <= distToMax) {
      onChange(Math.max(min, Math.min(clickVal, valueMax - 1)), valueMax);
    } else {
      onChange(valueMin, Math.min(max, Math.max(clickVal, valueMin + 1)));
    }
  };

  const minPercent = getPercent(valueMin);
  const maxPercent = getPercent(valueMax);
  const isChanged = valueMin > min || valueMax < max;

  return (
    <div className="mb-4">
      <h3 className="text-[11px] font-black text-gray-400 mb-3 tracking-[0.15em] uppercase">Price Range</h3>
      
      {/* Price Labels */}
      <div className="flex items-center justify-between mb-5">
        <span className={`text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors ${dragging === 'min' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
          LKR {valueMin?.toLocaleString()}
        </span>
        <span className="text-[10px] text-gray-300 font-bold">—</span>
        <span className={`text-[12px] font-bold px-3 py-1.5 rounded-lg transition-colors ${dragging === 'max' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
          LKR {valueMax?.toLocaleString()}
        </span>
      </div>

      {/* Slider Track */}
      <div 
        ref={trackRef}
        className="relative w-full h-10 flex items-center cursor-pointer select-none"
        onClick={handleTrackClick}
      >
        {/* Background Track */}
        <div className="absolute left-0 right-0 h-[6px] bg-gray-200 rounded-full"></div>
        
        {/* Active Range Track */}
        <div 
          className="absolute h-[6px] bg-gradient-to-r from-primary to-[#ff3366] rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        ></div>

        {/* Min Thumb */}
        <div
          className={`absolute w-7 h-7 rounded-full bg-white border-[4px] border-primary shadow-lg cursor-grab z-20 transition-transform ${dragging === 'min' ? 'scale-125 shadow-xl shadow-primary/30 cursor-grabbing' : 'hover:scale-110'}`}
          style={{ left: `${minPercent}%`, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDragging('min'); }}
          onTouchStart={(e) => { e.stopPropagation(); setDragging('min'); }}
        />

        {/* Max Thumb */}
        <div
          className={`absolute w-7 h-7 rounded-full bg-white border-[4px] border-primary shadow-lg cursor-grab z-20 transition-transform ${dragging === 'max' ? 'scale-125 shadow-xl shadow-primary/30 cursor-grabbing' : 'hover:scale-110'}`}
          style={{ left: `${maxPercent}%`, transform: 'translateX(-50%)' }}
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDragging('max'); }}
          onTouchStart={(e) => { e.stopPropagation(); setDragging('max'); }}
        />
      </div>

      {/* Reset */}
      {isChanged && (
        <button 
          onClick={onReset}
          className="text-[10px] text-primary font-bold hover:underline cursor-pointer mt-1"
        >
          Reset price range
        </button>
      )}
    </div>
  );
};


const ShopPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [priceInited, setPriceInited] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('Latest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  
  const sortOptions = [
    { label: 'Latest', value: 'Latest' },
    { label: 'Top Rated', value: 'Top Rated' },
    { label: 'Most Popular', value: 'Most Popular' },
    { label: 'Price: Low → High', value: 'Price: Low → High' },
    { label: 'Price: High → Low', value: 'Price: High → Low' }
  ];

  const handleSortSelect = (option) => {
    setSortOption(option.value);
    setSortDropdownOpen(false);
    const searchParams = new URLSearchParams(location.search);
    if (option.value === 'Top Rated') searchParams.set('sort', 'rating');
    else if (option.value === 'Most Popular') searchParams.set('sort', 'popular');
    else if (option.value === 'Price: Low → High') searchParams.set('sort', 'price_asc');
    else if (option.value === 'Price: High → Low') searchParams.set('sort', 'price_desc');
    else searchParams.delete('sort');
    navigate(`/shop?${searchParams.toString()}`);
  };

  // Parse category from URL on mount and when location changes
  useEffect(() => {
    window.scrollTo(0, 0); // Always scroll to top on navigation

    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const subParam = searchParams.get('sub');
    const typeParam = searchParams.get('type');
    const sortParam = searchParams.get('sort');

    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setExpandedCategories(prev => ({ ...prev, [categoryParam]: true }));
    } else {
      setSelectedCategory('All');
    }
    
    if (subParam) {
      setSelectedSubCategory(subParam);
      setExpandedSubCategories(prev => ({ ...prev, [`${categoryParam}-${subParam}`]: true }));
    } else {
      setSelectedSubCategory(null);
    }

    if (typeParam) {
      setSelectedProductType(typeParam);
    } else {
      setSelectedProductType(null);
    }

    if (sortParam === 'rating') setSortOption('Top Rated');
    else if (sortParam === 'popular') setSortOption('Most Popular');
    else if (sortParam === 'price_asc') setSortOption('Price: Low → High');
    else if (sortParam === 'price_desc') setSortOption('Price: High → Low');
    else setSortOption('Latest');

  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch products');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Build dynamic category tree from products
  const categoryTree = useMemo(() => {
    const tree = {};
    products.forEach(p => {
      if (!tree[p.category]) {
        tree[p.category] = { count: 0, subCategories: {}, sizes: new Set(), brands: new Set() };
      }
      tree[p.category].count++;
      if (p.subCategory) {
        if (!tree[p.category].subCategories[p.subCategory]) {
          tree[p.category].subCategories[p.subCategory] = { count: 0, types: {} };
        }
        tree[p.category].subCategories[p.subCategory].count++;
        
        if (p.productType && p.productType.trim() !== '') {
          const typeName = p.productType.trim();
          if (!tree[p.category].subCategories[p.subCategory].types[typeName]) {
            tree[p.category].subCategories[p.subCategory].types[typeName] = 0;
          }
          tree[p.category].subCategories[p.subCategory].types[typeName]++;
        }
      }
      if (p.sizes && p.sizes.length > 0) {
        p.sizes.forEach(s => tree[p.category].sizes.add(s));
      }
      if (p.brand) {
        tree[p.category].brands.add(p.brand);
      }
    });
    return tree;
  }, [products]);

  // Get available sizes for the currently selected category hierarchy
  const availableSizes = useMemo(() => {
    let relevantProducts = products;
    
    if (selectedCategory !== 'All') {
      relevantProducts = relevantProducts.filter(p => p.category === selectedCategory);
    }
    if (selectedSubCategory) {
      relevantProducts = relevantProducts.filter(p => p.subCategory === selectedSubCategory);
    }
    if (selectedProductType) {
      relevantProducts = relevantProducts.filter(p => p.productType && p.productType.trim() === selectedProductType);
    }

    const sizesSet = new Set();
    relevantProducts.forEach(p => {
      if (p.sizes) p.sizes.forEach(s => sizesSet.add(s));
      if (p.variants) p.variants.forEach(v => {
        if (v.size) sizesSet.add(v.size);
      });
    });

    // Custom sorting: standard sizes first, then numerical sizes
    const order = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6 };
    return Array.from(sizesSet).sort((a, b) => {
      if (order[a] && order[b]) return order[a] - order[b];
      if (order[a]) return -1;
      if (order[b]) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [selectedCategory, selectedSubCategory, selectedProductType, products]);

  // Group sizes for professional display
  const groupedSizes = useMemo(() => {
    const groups = {
      Apparel: [],
      Numerical: [],
      Other: []
    };
    
    availableSizes.forEach(size => {
      if (/^(XXS|XS|S|M|L|XL|XXL|3XL|4XL|XXXL)$/i.test(size)) {
        groups.Apparel.push(size);
      } else if (/^\d+(\.\d+)?$/.test(size)) {
        groups.Numerical.push(size);
      } else {
        groups.Other.push(size);
      }
    });
    
    return Object.entries(groups).filter(([_, sizes]) => sizes.length > 0);
  }, [availableSizes]);

  // Get available brands for the currently selected category
  const availableBrands = useMemo(() => {
    let brandsMap = {};
    const relevantProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);
    relevantProducts.forEach(p => {
      if (p.brand) {
        brandsMap[p.brand] = (brandsMap[p.brand] || 0) + 1;
      }
    });
    return Object.entries(brandsMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [selectedCategory, products]);

  // Compute min/max price from all products
  const priceMinMax = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map(p => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  // Initialize price range once products load
  useEffect(() => {
    if (products.length > 0 && !priceInited) {
      setPriceRange({ min: priceMinMax.min, max: priceMinMax.max });
      setPriceInited(true);
    }
  }, [products, priceMinMax, priceInited]);

  // Filter products
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedSubCategory) {
      filtered = filtered.filter(p => p.subCategory === selectedSubCategory);
    }
    if (selectedProductType) {
      filtered = filtered.filter(p => p.productType && p.productType.trim() === selectedProductType);
    }
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => {
        const pSizes = new Set(p.sizes || []);
        if (p.variants) p.variants.forEach(v => { if (v.size) pSizes.add(v.size); });
        return Array.from(pSizes).some(s => selectedSizes.includes(s));
      });
    }
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }
    if (priceInited && priceRange.min !== '' && priceRange.max !== '') {
      filtered = filtered.filter(p => {
        return p.price >= priceRange.min && p.price <= priceRange.max;
      });
    }

    if (location.pathname === '/deals') {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    // Apply Sorting
    if (sortOption === 'Price: Low → High') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High → Low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'Top Rated') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === 'Most Popular') {
      filtered.sort((a, b) => (b.orders || 0) - (a.orders || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedSubCategory, selectedProductType, selectedSizes, selectedBrands, priceRange, sortOption]);

  const handleCategorySelect = (category) => {
    setSelectedSubCategory(null);
    setSelectedProductType(null);
    setSelectedSizes([]);
    setSelectedBrands([]);
    if (category === 'All') {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${encodeURIComponent(category)}`);
    }
  };

  const handleSubCategorySelect = (category, sub) => {
    setSelectedProductType(null);
    navigate(`/shop?category=${encodeURIComponent(category)}&sub=${encodeURIComponent(sub)}`);
  };

  const handleTypeSelect = (category, sub, type) => {
    navigate(`/shop?category=${encodeURIComponent(category)}&sub=${encodeURIComponent(sub)}&type=${encodeURIComponent(type)}`);
  };

  const toggleExpand = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleSubExpand = (category, subCategory) => {
    const key = `${category}-${subCategory}`;
    setExpandedSubCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedProductType(null);
    setPriceRange({ min: '', max: '' });
    setSelectedSubCategory(null);
    navigate('/shop');
  };

  const activeFilterCount = selectedSizes.length + selectedBrands.length + (selectedProductType ? 1 : 0) + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0) + (selectedSubCategory ? 1 : 0);

  // Prevent body scroll when mobile filters are open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  // ==========================================
  // SIDEBAR CONTENT (shared between desktop and mobile)
  // ==========================================
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiSliders size={18} className="text-primary" />
          <h2 className="text-[15px] font-black text-gray-900 tracking-tight">Filter Products</h2>
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-[11px] font-bold text-primary hover:underline cursor-pointer">
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* CATEGORIES SECTION */}
      <div className="mb-7">
        <h3 className="text-[11px] font-black text-gray-400 mb-3 tracking-[0.15em] uppercase">Categories</h3>
        <div className="space-y-0.5">
          {/* All Products */}
          <button 
            onClick={() => handleCategorySelect('All')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
              selectedCategory === 'All' 
                ? 'bg-primary/10 text-primary' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          
          {/* Dynamic Category Tree */}
          {Object.entries(categoryTree).map(([catName, catData]) => {
            const isExpanded = expandedCategories[catName];
            const isActive = selectedCategory === catName;
            const hasSubCategories = Object.keys(catData.subCategories).length > 0;
            
            return (
              <div key={catName}>
                {/* Main Category */}
                <div className="flex items-center">
                  <button 
                    onClick={() => handleCategorySelect(catName)}
                    className={`flex-1 text-left px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-300'}`}></div>
                    {catName}
                    <span className="text-[10px] text-gray-400 font-medium ml-auto mr-1">({catData.count})</span>
                  </button>
                  {hasSubCategories && (
                    <button 
                      onClick={() => toggleExpand(catName)}
                      className="p-2 text-gray-400 hover:text-primary transition cursor-pointer"
                    >
                      <FiChevronRight 
                        size={14} 
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                      />
                    </button>
                  )}
                </div>

                {/* Sub Categories - Animated collapse */}
                {hasSubCategories && (
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-5 pl-3 border-l-2 border-gray-100 space-y-1 py-1">
                      {Object.entries(catData.subCategories).map(([subName, subData]) => {
                        const isSubExpanded = expandedSubCategories[`${catName}-${subName}`];
                        const isSubActive = selectedSubCategory === subName;
                        const hasTypes = Object.keys(subData.types).length > 0;
                        
                        return (
                          <div key={subName}>
                            <div className="flex items-center">
                              <button 
                                onClick={() => handleSubCategorySelect(catName, subName)}
                                className={`flex-1 text-left px-3 py-2 rounded-lg text-[12px] font-semibold transition-all flex items-center justify-between ${
                                  isSubActive && !selectedProductType
                                    ? 'text-primary bg-primary/5' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                <span>{subName}</span>
                                <span className="text-[10px] text-gray-400">{subData.count}</span>
                              </button>
                              {hasTypes && (
                                <button 
                                  onClick={() => toggleSubExpand(catName, subName)}
                                  className="p-1.5 text-gray-400 hover:text-primary transition cursor-pointer"
                                >
                                  <FiChevronRight 
                                    size={12} 
                                    className={`transition-transform duration-200 ${isSubExpanded ? 'rotate-90' : ''}`} 
                                  />
                                </button>
                              )}
                            </div>
                            
                            {/* Product Types (3rd Level) */}
                            {hasTypes && (
                              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="ml-4 pl-3 border-l border-gray-100 space-y-0.5 py-0.5 my-0.5">
                                  {Object.entries(subData.types).map(([typeName, typeCount]) => (
                                    <button 
                                      key={typeName}
                                      onClick={() => handleTypeSelect(catName, subName, typeName)}
                                      className={`w-full text-left px-3 py-1.5 rounded-md text-[11px] font-medium transition-all flex items-center justify-between ${
                                        selectedProductType === typeName
                                          ? 'text-primary bg-primary/5' 
                                          : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span>{typeName}</span>
                                      <span className="text-[9px] text-gray-300">{typeCount}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SIZE SECTION */}
      {selectedProductType && groupedSizes.length > 0 && (
        <div className="mb-7">
          <h3 className="text-[11px] font-black text-gray-400 mb-3 tracking-[0.15em] uppercase">
            Size {selectedCategory !== 'All' ? `• ${selectedCategory}` : ''}
          </h3>
          
          <div className="space-y-4">
            {groupedSizes.map(([groupName, sizes]) => (
              <div key={groupName}>
                {groupedSizes.length > 1 && (
                  <h4 className="text-[10px] font-bold text-gray-400 mb-2">{groupName}</h4>
                )}
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`min-w-[42px] h-10 px-2.5 flex items-center justify-center text-[12px] font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                        selectedSizes.includes(size)
                          ? 'bg-primary text-white shadow-md shadow-primary/30 scale-105'
                          : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {selectedSizes.length > 0 && (
            <button onClick={() => setSelectedSizes([])} className="text-[10px] text-primary font-bold mt-2 hover:underline cursor-pointer">
              Clear sizes
            </button>
          )}
        </div>
      )}

      {/* BRAND SECTION */}
      {availableBrands.length > 0 && (
        <div className="mb-7">
          <h3 className="text-[11px] font-black text-gray-400 mb-3 tracking-[0.15em] uppercase">Brands</h3>
          <div className="space-y-2.5">
            {availableBrands.map((brand) => (
              <label key={brand.name} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-[18px] h-[18px] border-2 border-gray-200 rounded-[5px] checked:bg-primary checked:border-primary transition-all cursor-pointer hover:border-primary/50"
                    checked={selectedBrands.includes(brand.name)}
                    onChange={() => toggleBrand(brand.name)}
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-[3px] top-[3px] transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="flex-1 text-[13px] font-semibold text-gray-700 group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {brand.count}
                </span>
              </label>
            ))}
          </div>
          {selectedBrands.length > 0 && (
            <button onClick={() => setSelectedBrands([])} className="text-[10px] text-primary font-bold mt-2 hover:underline cursor-pointer">
              Clear brands
            </button>
          )}
        </div>
      )}

      {/* PRICE SECTION - Custom Butter-Smooth Drag Slider */}
      <PriceRangeSlider
        min={priceMinMax.min}
        max={priceMinMax.max}
        valueMin={priceRange.min}
        valueMax={priceRange.max}
        onChange={(newMin, newMax) => setPriceRange({ min: newMin, max: newMax })}
        onReset={() => setPriceRange({ min: priceMinMax.min, max: priceMinMax.max })}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans text-gray-800">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="w-full lg:w-[280px] flex-shrink-0 hidden lg:block">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <SidebarContent />
            </div>
          </div>

          {/* Product Grid Section */}
          <div className="flex-grow min-w-0">
            {/* Top Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {location.pathname === '/deals' ? 'Exclusive Deals' : (selectedCategory === 'All' ? 'Our Catalog' : selectedCategory)}
                  {selectedSubCategory && <span className="text-primary"> / {selectedSubCategory}</span>}
                  {selectedProductType && <span className="text-primary/70"> / {selectedProductType}</span>}
                </h1>
                <p className="text-[13px] text-gray-500 font-medium mt-1">
                  Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Active Filter Tags */}
                <div className="hidden md:flex flex-wrap gap-1.5">
                  {selectedSizes.map(s => (
                    <span key={s} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                      {s} <FiX size={10} className="cursor-pointer hover:opacity-70" onClick={() => toggleSize(s)} />
                    </span>
                  ))}
                  {selectedBrands.map(b => (
                    <span key={b} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                      {b} <FiX size={10} className="cursor-pointer hover:opacity-70" onClick={() => toggleBrand(b)} />
                    </span>
                  ))}
                </div>

                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                
                {/* Custom Desktop Sort Dropdown */}
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center justify-between gap-3 text-[13px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl pl-4 pr-3 py-2 outline-none cursor-pointer hover:bg-primary/15 transition-all shadow-sm focus:ring-2 focus:ring-primary/20 min-w-[150px]"
                  >
                    <span>{sortOption}</span>
                    <FiChevronRight className={`transition-transform duration-200 ${sortDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} size={14} />
                  </button>
                  
                  {sortDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-full min-w-[160px] bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden z-50 py-1">
                        {sortOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleSortSelect(opt)}
                            className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors ${sortOption === opt.value ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6 flex gap-3">
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 bg-white border border-gray-200 shadow-sm py-3.5 rounded-xl font-bold text-[13px] text-gray-700 flex justify-center items-center gap-2 hover:bg-gray-50 transition relative cursor-pointer"
              >
                <FiFilter size={16} /> Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {/* Custom Mobile Sort Dropdown */}
              <div className="flex-1 relative">
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="w-full h-full bg-primary/10 border border-primary/20 shadow-sm py-3.5 px-4 rounded-xl font-bold text-[13px] text-primary flex justify-between items-center gap-2 hover:bg-primary/15 transition cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="flex-1 text-center pl-4">{sortOption}</span>
                  <FiChevronRight className={`transition-transform duration-200 ${sortDropdownOpen ? 'rotate-[-90deg]' : 'rotate-90'}`} size={14} />
                </button>
                
                {sortDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)}></div>
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden z-50 py-1">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortSelect(opt)}
                          className={`w-full text-left px-5 py-3 text-[13px] font-bold transition-colors ${sortOption === opt.value ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-gray-500 font-semibold mt-4">Loading Products...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center font-bold max-w-lg mx-auto">
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] p-16 rounded-3xl text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiFilter className="text-gray-300" size={32} />
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-500 font-medium text-sm">Try adjusting your filters or browse a different category.</p>
                <button 
                  onClick={clearAllFilters}
                  className="mt-6 bg-primary/10 text-primary font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-primary/20 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========================================== */}
      {/* MOBILE FILTERS DRAWER                      */}
      {/* ========================================== */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300 lg:hidden ${mobileFiltersOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileFiltersOpen(false)}
      />
      <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[340px] bg-white z-[9999] transform transition-transform duration-300 ease-out lg:hidden flex flex-col shadow-2xl ${mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0 bg-primary">
          <h2 className="text-[15px] font-black text-white flex items-center gap-2"><FiSliders size={16} /> Filter Products</h2>
          <button 
            onClick={() => setMobileFiltersOpen(false)} 
            className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <SidebarContent />
        </div>
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full bg-primary hover:bg-[#e60047] text-white text-[13px] font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            Show {filteredProducts.length} Results
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShopPage;
