import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import FlashSaleSection from '../components/FlashSaleSection';

const CategoryPage = () => {
  const { categoryName } = useParams();
  
  const [config, setConfig] = useState(null);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setCategoryLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${categoryName}`);
        setConfig(data);
        if (data.tabs && data.tabs.length > 0) {
          setActiveTab(data.tabs[0]);
        }
        setCategoryLoading(false);
      } catch (error) {
        console.error('Error fetching category', error);
        setConfig(null);
        setCategoryLoading(false);
      }
    };
    fetchCategory();
  }, [categoryName]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]);

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!config) {
    return <Navigate to="/shop" />;
  }

  // Helper to filter products for the active tab (using subCategory)
  const getTrendingProducts = () => {
    if (!activeTab) return [];
    const filtered = products.filter(p => {
       // Check if main category matches
       const isCategoryMatch = p.category && (
          p.category.toLowerCase().includes(config.name.toLowerCase()) ||
          config.name.toLowerCase().includes(p.category.toLowerCase())
       );
       
       // Check if subCategory matches the active tab
       const activeLower = activeTab.toLowerCase();
       const subCatLower = p.subCategory ? p.subCategory.toLowerCase() : "";
       
       let isSubCategoryMatch = false;
       if (subCatLower) {
         const aliases = {
           'phones': ['mobile', 'mobiles', 'smartphone', 'smartphones'],
           'men': ['menswear', 'mens'],
           'women': ['womenswear', 'womens'],
           'kids': ['children', 'boys', 'girls'],
           'toys': ['action figures', 'action figure', 'toy'],
           'games': ['board games', 'board game', 'game'],
           'puzzles': ['puzzle']
         };
         
         isSubCategoryMatch = subCatLower.includes(activeLower) || activeLower.includes(subCatLower);
         
         if (!isSubCategoryMatch && aliases[activeLower]) {
           isSubCategoryMatch = aliases[activeLower].some(alias => subCatLower.includes(alias));
         }
       } else {
         isSubCategoryMatch = p.category && p.category.toLowerCase().includes(activeLower);
       }

       return isCategoryMatch && isSubCategoryMatch;
    });
    return filtered;
  };

  const currentProducts = getTrendingProducts();

  const getSubCatForLink = () => {
     if (currentProducts.length > 0 && currentProducts[0].subCategory) {
        return currentProducts[0].subCategory;
     }
     return activeTab;
  };


  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Premium Hero Banner */}
        <section className="container mx-auto px-4 mt-6 mb-16">
          <div className="rounded-[2rem] relative min-h-[450px] md:min-h-[500px] shadow-sm overflow-hidden group flex items-center">
             
             {/* Full Width Image Background */}
             <img 
               src={config.heroImage} 
               alt={config.heroTitle} 
               className="absolute inset-0 w-full h-full object-cover object-[center_25%] md:object-[center_20%] transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
             />
             
             {/* Image fade overlay to reduce distraction on the left side where the card sits */}
             <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent transition-opacity duration-500"></div>
             
             {/* Floating Glassmorphism Text Card - enhanced opacity and blur for perfect readability */}
             <div className="relative z-10 w-full md:w-[60%] lg:w-[45%] mx-4 md:ml-12 lg:ml-16 p-8 md:p-12 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white flex flex-col justify-center transform transition-transform duration-500 group-hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-[2px] bg-gray-900 rounded-full"></span>
                  <span className="text-gray-900 text-[10px] font-black uppercase tracking-[0.2em]">
                    Featured Category
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
                  {config.heroTitle}
                </h1>
                <p className="text-gray-700 text-lg mb-10 font-medium leading-relaxed">
                  {config.heroSubtitle}
                </p>
                <div>
                  <button className="bg-gray-900 text-white px-7 py-3 rounded-full font-bold text-[13px] hover:bg-primary transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-primary/30 flex items-center gap-2 group-hover:px-8">
                    Explore Collection
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
             </div>
          </div>
        </section>

        {/* Subcategories */}
        <section className="container mx-auto px-4 mb-20">
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {config.subCategories.map((cat, i) => {
              // Map circular icon names to actual tab names if needed, otherwise use the category name
              const mapToTab = (name) => {
                const lowerName = name.toLowerCase();
                if (lowerName === 'mobiles') return 'Phones';
                if (lowerName === 'menswear') return 'Men';
                if (lowerName === 'womenswear') return 'Women';
                if (lowerName === 'kids fashion') return 'Kids';
                if (lowerName === 'action figures') return 'Toys';
                if (lowerName === 'board games') return 'Games';
                if (config.tabs.includes(name)) return name;
                return name;
              };

              return (
                <div 
                  key={i} 
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => {
                    setActiveTab(mapToTab(cat.name));
                    document.getElementById('trending-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                   <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-transparent group-hover:border-primary transition-all duration-300 shadow-md mb-3 p-1">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                   </div>
                   <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Trending Now */}
        <section id="trending-section" className="container mx-auto px-4 mb-24">
           <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Trending now in {config.name}</h2>
           
           {/* Tabs Removed - Navigation is now handled by the circular subcategory icons */}
           {/* Products Grid */}
           {loading ? (
             <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
           ) : currentProducts.length === 0 ? (
             <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">No trending {activeTab} products found in the database.</p>
                <Link to="/shop" className="text-sm text-primary font-bold hover:underline">View All Products in Shop</Link>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {currentProducts.slice(0, 4).map((product) => (
                   <ProductCard key={product._id} product={product} />
                ))}
             </div>
           )}

           {/* Shop all button */}
           <div className="flex justify-center">
              <Link to={`/shop?category=${encodeURIComponent(config.name)}&sub=${encodeURIComponent(getSubCatForLink())}`} className="bg-gray-100 text-gray-700 font-bold px-8 py-3 rounded-full text-sm hover:bg-gray-200 transition-colors flex items-center gap-2">
                 Shop all {activeTab.toLowerCase()} <span className="text-lg leading-none">›</span>
              </Link>
           </div>
        </section>

        {/* Flash Sale Section */}
        <FlashSaleSection categoryFilter={categoryName} />

        {/* Few words about our shop */}
        <section className="container mx-auto px-4 mb-20 border-t border-gray-100 pt-16">
           <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Few words about our shop</h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div>
                 <h3 className="font-bold text-gray-900 mb-4 text-sm">Our Brand Partners</h3>
                 <p className="text-gray-500 text-xs leading-relaxed text-justify">
                   We partner with top brands across all categories to bring you premium quality items. Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.
                 </p>
              </div>
              <div>
                 <h3 className="font-bold text-gray-900 mb-4 text-sm">Mission and Vision</h3>
                 <p className="text-gray-500 text-xs leading-relaxed text-justify">
                   To provide a seamless shopping experience for {config.name} enthusiasts. Separated they live in Bookmarksgrove right at the coast of the Semantics, a large language ocean.
                 </p>
              </div>
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
