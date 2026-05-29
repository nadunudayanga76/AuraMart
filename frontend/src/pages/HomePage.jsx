import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiArrowRight, FiCheckCircle, FiX, FiTrendingUp } from 'react-icons/fi';
import { SiNike, SiAdidas, SiSamsung, SiSony, SiPuma, SiBosch, SiApple } from 'react-icons/si';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FlashSaleSection from '../components/FlashSaleSection';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

// Import hero images
import heroSlide1 from '../assets/hero_slide_1.png';
import heroSlide2 from '../assets/hero_slide_2.png';
import heroSlide3 from '../assets/hero_slide_3.png';
import heroSlide4 from '../assets/hero_slide_4.png';

const heroSlides = [
  {
    id: 1,
    image: heroSlide1,
    badge: 'SUMMER SALE',
    badgeColor: 'text-primary',
    title: <>Discover Amazing<br/>Products Up to <span className="text-primary">50%</span> Off</>,
    description: 'Shop the latest trending products with unbeatable prices and premium quality.',
    bgColor: '#fff3f5',
    gradientFrom: '#fff3f5',
  },
  {
    id: 2,
    image: heroSlide2,
    badge: 'TECH DEALS',
    badgeColor: 'text-blue-600',
    title: <>Latest <span className="text-blue-600">Electronics</span><br/>& Smart Devices</>,
    description: 'Explore cutting-edge technology with exclusive discounts on top brands.',
    bgColor: '#eef2ff',
    gradientFrom: '#eef2ff',
  },
  {
    id: 3,
    image: heroSlide3,
    badge: 'NEW ARRIVALS',
    badgeColor: 'text-emerald-600',
    title: <>Transform Your<br/><span className="text-emerald-600">Living Space</span></>,
    description: 'Discover premium home décor and furniture to elevate your lifestyle.',
    bgColor: '#f0fdf4',
    gradientFrom: '#f0fdf4',
  },
  {
    id: 4,
    image: heroSlide4,
    badge: 'EXCLUSIVE OFFERS',
    badgeColor: 'text-pink-500',
    title: <>Premium <span className="text-pink-500">Beauty</span><br/>& Skincare</>,
    description: 'Indulge in luxury beauty essentials with up to 40% off top products.',
    bgColor: '#fdf2f8',
    gradientFrom: '#fdf2f8',
  },
];

const SLIDE_INTERVAL = 5000; // 5 seconds

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topCategories, setTopCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  // Payment Success Toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // Check if we came from a successful checkout
    if (location.state?.paymentSuccess) {
      setShowSuccessToast(true);
      // Clear the state so it doesn't show again on refresh
      navigate('.', { replace: true, state: {} });
      
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Auto-shuffle logic
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 400);
    }, SLIDE_INTERVAL);
  }, []);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    stopAutoSlide();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 50);
      startAutoSlide();
    }, 400);
  };

  const prevSlide = () => {
    const newIndex = (currentSlide - 1 + heroSlides.length) % heroSlides.length;
    goToSlide(newIndex);
  };

  const nextSlide = () => {
    const newIndex = (currentSlide + 1) % heroSlides.length;
    goToSlide(newIndex);
  };

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`);
        setTopCategories(data);
        setCategoriesLoading(false);
      } catch (err) {
        console.error("Failed to fetch categories");
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const slide = heroSlides[currentSlide];
  const trendingProducts = [...products].sort((a,b) => (b.orders || 0) - (a.orders || 0)).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow relative">
        {/* Payment Success Toast */}
        <div 
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ease-out ${
            showSuccessToast 
              ? 'translate-y-0 opacity-100 scale-100' 
              : '-translate-y-20 opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)] bg-white border border-green-100">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheckCircle className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-sm">Payment Successful!</h4>
              <p className="text-gray-500 text-xs mt-0.5 font-medium">Thank you for your order. We are processing it.</p>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)} 
              className="ml-4 text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Hero Section - Auto-shuffling Carousel */}
        <section className="container mx-auto px-4 mt-6 mb-12">
          <div 
            className="rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-stretch transition-colors duration-700 ease-in-out min-h-[400px] sm:min-h-[450px] md:min-h-[420px] md:aspect-[21/9] md:max-h-[560px]"
            style={{ backgroundColor: slide.bgColor }}
            onMouseEnter={stopAutoSlide}
            onMouseLeave={startAutoSlide}
          >
            {/* Nav Arrows */}
            <button 
              onClick={prevSlide}
              className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg text-gray-600 hover:text-primary hover:scale-110 hover:shadow-xl z-20 transition-all duration-300 cursor-pointer"
              aria-label="Previous slide"
            >
              <FiChevronLeft size={24} />
            </button>
            <button 
              onClick={nextSlide}
              className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-lg text-gray-600 hover:text-primary hover:scale-110 hover:shadow-xl z-20 transition-all duration-300 cursor-pointer"
              aria-label="Next slide"
            >
              <FiChevronRight size={24} />
            </button>

            <div className="flex flex-1 w-full h-full relative z-0">
              {/* Background Images Layer */}
              <div className="absolute inset-0 md:left-1/3 z-0">
                {heroSlides.map((s, i) => (
                  <div
                    key={s.id}
                    className="absolute inset-0 bg-cover bg-center md:bg-right bg-no-repeat transition-opacity duration-700 ease-in-out"
                    style={{
                      backgroundImage: `url('${s.image}')`,
                      opacity: i === currentSlide && !isTransitioning ? 1 : 0,
                    }}
                  />
                ))}
              </div>

              {/* Gradient Overlays for Readability */}
              <div 
                className="absolute inset-0 z-0 hidden md:block"
                style={{
                  background: `linear-gradient(to right, ${slide.gradientFrom} 0%, ${slide.gradientFrom} 35%, ${slide.gradientFrom}D0 50%, transparent 100%)`,
                }}
              />
              <div 
                className="absolute inset-0 z-0 md:hidden"
                style={{
                  background: `linear-gradient(to bottom, ${slide.gradientFrom} 0%, ${slide.gradientFrom} 45%, ${slide.gradientFrom}A0 65%, transparent 100%)`,
                }}
              />

              {/* Text Content */}
              <div 
                className="w-full md:w-1/2 px-6 pt-10 pb-16 sm:p-12 sm:pb-20 md:p-16 lg:p-20 flex flex-col justify-start md:justify-center relative z-10 transition-all duration-500 ease-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(20px)' : 'translateY(0)',
                }}
              >
                <span className={`${slide.badgeColor} font-black text-[10px] md:text-xs tracking-[0.2em] mb-2 md:mb-4 uppercase`}>
                  {slide.badge}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] mb-4 md:mb-6 leading-[1.15] md:leading-[1.1] tracking-tight drop-shadow-sm">
                  {slide.title}
                </h1>
                <p className="text-gray-700 mb-6 md:mb-8 max-w-md text-sm md:text-[15px] leading-relaxed font-medium">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-3 md:gap-4 items-center">
                  <Link to="/shop" className="bg-primary text-white px-6 md:px-8 py-3 md:py-3.5 rounded-md font-bold text-xs md:text-sm hover:bg-[#e60047] transition shadow-[0_8px_20px_rgba(255,0,79,0.25)] flex items-center gap-2">
                    Shop Now <FiArrowRight />
                  </Link>
                  <Link to="/shop" className="bg-white/80 backdrop-blur-md text-gray-800 px-6 md:px-8 py-3 md:py-3.5 rounded-md font-bold text-xs md:text-sm hover:bg-white transition border border-gray-200 shadow-sm">
                    Explore Deals
                  </Link>
                </div>
              </div>

              {/* Dot Indicators */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-5 md:bottom-8 flex gap-3 z-20">
                {heroSlides.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all duration-500 cursor-pointer ${
                      i === currentSlide 
                        ? 'w-8 h-3 bg-primary shadow-md shadow-primary/30' 
                        : 'w-3 h-3 bg-gray-300/80 hover:bg-gray-400 backdrop-blur-sm'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 z-20 hidden md:block">
              <div 
                className="h-full bg-primary/60 rounded-r-full"
                style={{
                  animation: `heroProgress ${SLIDE_INTERVAL}ms linear infinite`,
                  width: '100%',
                }}
              />
            </div>
          </div>
        </section>

        {/* Feature Badges */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders over LKR 5000' },
              { icon: '💲', title: 'Money Back', desc: '30 days guarantee' },
              { icon: '🛡️', title: 'Secure Payment', desc: '100% secure payment' },
              { icon: '🎧', title: '24/7 Support', desc: 'Dedicated support' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                 <div className="text-3xl">{f.icon}</div>
                 <div>
                   <h4 className="font-bold text-gray-900 text-sm">{f.title}</h4>
                   <p className="text-xs text-gray-500 font-medium">{f.desc}</p>
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Icons */}
        {/* Category Icons */}
        <section className="container mx-auto px-4 mb-20">
           {categoriesLoading ? (
             <div className="flex justify-center items-center py-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
           ) : (
             <div className="flex flex-wrap justify-center gap-6 md:gap-12 px-4">
                {topCategories.map((cat, i) => (
                  <Link to={`/category/${cat.slug}`} key={i} className="flex flex-col items-center group cursor-pointer w-[90px] md:w-[120px]">
                    <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full ${cat.homepageColor || 'bg-gray-50'} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 shadow-sm border border-gray-100 overflow-hidden ring-4 ring-transparent group-hover:ring-primary/10`}>
                      <img src={cat.homepageImage} alt={cat.name} className={`w-full h-full object-cover ${cat.name === 'Fashion' ? 'object-top' : ''}`} />
                    </div>
                    <h5 className="text-[13px] md:text-sm font-bold text-gray-800 text-center leading-snug mb-1 group-hover:text-primary transition-colors">{cat.name}</h5>
                    <span className="text-[11px] md:text-xs text-gray-400 font-medium">{cat.itemsCount} Items</span>
                  </Link>
                ))}
             </div>
           )}
        </section>

        {/* Global Flash Sales */}
        <FlashSaleSection />

        {/* Trending Products Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                 <FiTrendingUp className="w-6 h-6 text-primary" />
                 Trending Products
              </h2>
              <p className="text-gray-500 text-sm mt-1">Discover what everyone is talking about.</p>
            </div>
            <Link to="/shop?sort=trending" className="group text-sm font-bold text-primary flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
              View All <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
          ) : error ? (
            <div className="text-red-500 text-center py-10 font-bold">{error}</div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {trendingProducts.map((product) => (
                <div key={product._id} className="relative group hover:-translate-y-1 transition-transform duration-300">
                  <ProductCard product={product} isTrending={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 font-medium">No trending products available right now.</div>
          )}
        </section>

        {/* Banners Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Big Deal Banner */}
            <div className="bg-gradient-to-br from-[#fff1f4] to-[#ffe4ea] rounded-2xl p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden group min-h-[300px] sm:min-h-[350px] border border-pink-100/60">
               <div className="relative z-10 w-[70%] sm:max-w-[55%]">
                 <span className="text-primary text-[10px] font-bold tracking-widest uppercase bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">🔥 Exclusive Offers</span>
                 <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 sm:mt-5 mb-2 sm:mb-3 leading-tight">Big Deals<br/>On Top Brands</h3>
                 <p className="text-gray-600 text-xs sm:text-sm mb-5 sm:mb-6 font-medium leading-relaxed">Save up to 50% on premium products from your favorite brands.</p>
                 <Link to="/shop" className="inline-flex bg-primary text-white px-5 md:px-7 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm items-center gap-2 hover:bg-[#e60047] transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 w-max">
                   Shop Now <FiArrowRight />
                 </Link>
               </div>
               <div className="absolute right-0 bottom-0 top-0 w-[45%] sm:w-[50%] overflow-hidden flex items-center justify-center">
                  <img 
                    src="/banner_big_deals.png" 
                    alt="Big Deals" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#fff1f4] via-[#fff1f4]/70 to-transparent"></div>
               </div>
            </div>

            {/* Right Banners */}
            <div className="grid grid-rows-2 gap-6">
              <div className="bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] rounded-2xl p-6 sm:p-8 relative overflow-hidden flex items-center group border border-indigo-100/60 min-h-[160px] sm:min-h-0">
                 <div className="relative z-10 w-[60%] sm:w-1/2">
                    <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full">✨ New Collection</span>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-3 mb-3 sm:mb-4">Fashion 2026</h3>
                    <Link to="/shop?category=Fashion" className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5 hover:text-indigo-600 transition group/link">
                      Explore Now <FiArrowRight className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                 </div>
                 <div className="absolute right-0 top-0 bottom-0 w-[50%] overflow-hidden">
                   <img 
                     src="/banner_fashion_2026.png" 
                     alt="Fashion 2026 Collection" 
                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                   />
                   <div className="absolute inset-0 bg-gradient-to-r from-[#eef2ff] via-transparent to-transparent"></div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] rounded-2xl p-6 relative overflow-hidden group border border-green-100/60">
                   <div className="relative z-10">
                     <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">Best Sellers</span>
                     <h3 className="text-lg font-black text-gray-900 mt-1 mb-4">Top Rated Items</h3>
                     <Link to="/shop?sort=rating" className="text-xs font-bold text-gray-900 flex items-center gap-1 hover:text-emerald-600 transition">
                       Shop Now <FiArrowRight />
                     </Link>
                   </div>
                   <div className="absolute -right-4 -bottom-4 w-32 h-32">
                     <img 
                       src="/banner_headphones_white.png" 
                       alt="Premium Headphones" 
                       className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-xl mix-blend-multiply [mask-image:radial-gradient(circle,black_50%,transparent_75%)]" 
                     />
                   </div>
                </div>
                <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-2xl p-6 relative overflow-hidden group border border-gray-800 shadow-lg">
                   <div className="relative z-10">
                     <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">Smart Devices</span>
                     <h3 className="text-lg font-black text-white mt-2 mb-4 tracking-tight">Up to 30% Off</h3>
                     <Link to="/shop?category=Electronics" className="text-xs font-bold text-gray-300 flex items-center gap-1 hover:text-blue-400 transition">
                       Shop Now <FiArrowRight />
                     </Link>
                   </div>
                   <div className="absolute -right-4 -bottom-4 w-32 h-32 opacity-90 group-hover:opacity-100 transition-opacity">
                     <img 
                       src="/banner_smart_devices_black.png" 
                       alt="Smart Devices" 
                       className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-screen [mask-image:radial-gradient(circle,black_60%,transparent_80%)]" 
                     />
                   </div>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Featured Products</h2>
            <Link to="/shop" className="group text-sm font-bold text-primary flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
              View All Products <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
          ) : error ? (
            <div className="text-red-500 text-center py-10 font-bold">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {products.slice(0, 5).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Top Categories Row */}
        <section className="container mx-auto px-4 mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900">Top Categories</h2>
            <Link to="/categories" className="group text-sm font-bold text-primary flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20">
              View All Categories <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {[
               { name: "Fashion", items: "200+ Items", img: "/images/fashion_category.png" },
               { name: "Electronics", items: "120+ Items", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300" },
               { name: "Home & Living", items: "150+ Items", img: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=300" },
               { name: "Beauty & Health", items: "100+ Items", img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=300" },
               { name: "Sports & Outdoors", items: "80+ Items", img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300" }
             ].map((cat, i) => (
                <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} key={i} className="group flex flex-col items-center">
                   <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
                     <img src={cat.img} alt={cat.name} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${cat.name === 'Fashion' ? 'object-top' : ''}`} />
                   </div>
                   <h4 className="font-bold text-gray-900 group-hover:text-primary transition">{cat.name}</h4>
                   <span className="text-xs text-gray-500 font-medium">{cat.items}</span>
                </Link>
             ))}
          </div>
        </section>

        {/* Shop Top Brands */}
        <section className="container mx-auto px-4 mb-20 overflow-hidden">
          <h2 className="text-xl font-black text-gray-900 mb-8 text-center">Shop Top Brands</h2>
          <div className="relative flex overflow-hidden">
            <div className="animate-marquee flex items-center gap-16 md:gap-24 opacity-60 hover:opacity-100 transition-opacity duration-300">
               {/* First Set */}
               <SiNike className="text-6xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiAdidas className="text-6xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiSamsung className="text-7xl text-gray-800 hover:text-blue-700 transition cursor-pointer" />
               <SiSony className="text-6xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiPuma className="text-7xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiApple className="text-5xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiBosch className="text-7xl text-gray-800 hover:text-red-600 transition cursor-pointer" />
               {/* Duplicate Set for Infinite Marquee */}
               <SiNike className="text-6xl text-gray-800 hover:text-black transition cursor-pointer ml-16 md:ml-24" />
               <SiAdidas className="text-6xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiSamsung className="text-7xl text-gray-800 hover:text-blue-700 transition cursor-pointer" />
               <SiSony className="text-6xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiPuma className="text-7xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiApple className="text-5xl text-gray-800 hover:text-black transition cursor-pointer" />
               <SiBosch className="text-7xl text-gray-800 hover:text-red-600 transition cursor-pointer pr-16 md:pr-24" />
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="container mx-auto px-4 mb-20 text-center">
           <h2 className="text-xl font-black text-gray-900 mb-10">Why Choose <span className="text-primary">AuraMart</span>?</h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: "✓", title: "100% Original Products", sub: "Authentic & Quality Assured" },
                { icon: "↩️", title: "Easy Returns", sub: "Hassle Free Returns" },
                { icon: "🔒", title: "Secure Payments", sub: "Multiple Payment Options" },
                { icon: "🎧", title: "Customer Support", sub: "We're Here to Help" }
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center">
                   <div className="text-4xl mb-3 text-gray-700">{f.icon}</div>
                   <h4 className="font-bold text-sm text-gray-900 mb-1">{f.title}</h4>
                   <p className="text-xs text-gray-500 font-medium">{f.sub}</p>
                </div>
              ))}
           </div>
        </section>

        {/* Newsletter */}
        <section className="container mx-auto px-4 mb-10">
          <div className="bg-[#fff1f4] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-pink-50">
             <div className="flex items-center gap-6">
                <div className="text-5xl opacity-80">💌</div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Subscribe to Our Newsletter</h3>
                  <p className="text-xs text-gray-600 font-medium">Get the latest updates on new products, exclusive offers and more.</p>
                </div>
             </div>
             <div className="flex w-full md:w-auto flex-1 max-w-md">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-4 py-3 rounded-l-md border border-gray-200 focus:outline-none focus:border-primary text-sm font-medium"
                />
                <button className="bg-primary text-white px-6 py-3 rounded-r-md font-bold text-sm hover:bg-[#e60047] transition">
                  Subscribe
                </button>
             </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
