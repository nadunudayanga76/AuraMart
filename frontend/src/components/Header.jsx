import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiHeart, FiShoppingCart, FiBell, FiUser, FiLogOut, FiMapPin, FiHelpCircle, FiChevronDown, FiShoppingBag, FiMenu, FiX, FiChevronRight, FiHome, FiGrid, FiTag, FiInfo, FiPhone } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { markAllRead } from '../store/notificationSlice';
import { fetchWishlist, clearWishlist } from '../store/wishlistSlice';
import { clearCartItems } from '../store/cartSlice';
import axios from 'axios';

const Header = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notification);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  
  const cartCount = userInfo ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const wishlistCount = userInfo && wishlistItems ? wishlistItems.length : 0;

  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [hasFlashSale, setHasFlashSale] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const navigate = useNavigate();

  // Check for flash sales
  useEffect(() => {
    const checkFlashSale = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/flash-sale`);
        if (data && data.length > 0) {
          setHasFlashSale(true);
        }
      } catch (error) {
        console.error('Error fetching flash sales for banner', error);
      }
    };
    checkFlashSale();
  }, []);

  // Initialize data on load
  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      const isOutsideDesktop = searchRef.current ? !searchRef.current.contains(event.target) : true;
      const isOutsideMobile = mobileSearchRef.current ? !mobileSearchRef.current.contains(event.target) : true;
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?keyword=${searchQuery}`);
          setSearchResults(data.products || data);
        } catch (error) {
          console.error("Error fetching search results", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const handleNotifClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      dispatch(markAllRead());
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartItems());
    dispatch(clearWishlist());
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <FiHome size={18} /> },
    { name: 'Shop', path: '/shop', icon: <FiShoppingBag size={18} /> },
    { name: 'Categories', path: '/categories', icon: <FiGrid size={18} /> },
    { name: 'Deals', path: '/deals', icon: <FiTag size={18} /> },
    { name: 'About Us', path: '/about', icon: <FiInfo size={18} /> },
    { name: 'Contact', path: '/contact', icon: <FiPhone size={18} /> },
  ];

  return (
    <>
      <header className="bg-white w-full flex flex-col relative z-50 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        {/* Top Banner Bar - Desktop Only */}
        <div className="bg-[#f8f9fa] border-b border-gray-100 py-2 hidden md:block transition-all duration-300">
          <div className="container mx-auto px-4 flex justify-between items-center text-[11px] font-semibold text-gray-600">
            {/* Left Side */}
            {hasFlashSale && location.pathname === '/' ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                   <div className="relative flex items-center justify-center w-2 h-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-50 animate-ping"></span>
                      <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-primary"></span>
                   </div>
                   <span className="text-primary font-black uppercase tracking-wider text-[9px]">Flash Sale Live</span>
                </div>
                <span className="text-gray-700 font-medium tracking-wide">Get premium discounts on selected items.</span>
                <button 
                  onClick={() => {
                    const el = document.getElementById('flash-sale-section');
                    if (el) {
                      const yOffset = -100; // Offset for sticky header
                      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }} 
                  className="group flex items-center gap-1 text-primary hover:text-white bg-transparent hover:bg-primary border border-primary/30 hover:border-primary px-3 py-1 rounded-full ml-1 font-bold transition-all duration-300 cursor-pointer text-[10px] uppercase tracking-wider shadow-sm hover:shadow-primary/30"
                >
                  Shop Deals <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-primary font-bold">Welcome to AuraMart!</span>
                <span className="text-gray-500">Discover the best products at unbeatable prices.</span>
              </div>
            )}

            {/* Right Side */}
            <div className="flex items-center gap-5">
              <Link to="/track-order" className="flex items-center gap-1.5 hover:text-primary transition"><FiMapPin size={12} /> Track Order</Link>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="relative group">
                <div className="flex items-center gap-1.5 hover:text-primary transition py-2 cursor-pointer">
                  <FiHelpCircle size={12} /> Help & Support
                </div>
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[200px] flex flex-col gap-1 text-gray-700 font-semibold">
                    <Link to="/support/faq" className="px-4 py-2 hover:bg-gray-50 rounded-lg hover:text-primary transition-colors flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FiHelpCircle size={12} /></div>
                      FAQ & Guides
                    </Link>
                    <button onClick={() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) }} className="px-4 py-2 hover:bg-gray-50 rounded-lg hover:text-primary transition-colors flex items-center gap-3 w-full text-left">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FiPhone size={12} /></div>
                      Contact Us
                    </button>
                    <Link to="/support/returns" className="px-4 py-2 hover:bg-gray-50 rounded-lg hover:text-primary transition-colors flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FiShoppingBag size={12} /></div>
                      Return Policy
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button className="px-4 py-2 hover:bg-primary/5 rounded-lg text-primary font-bold transition-colors flex items-center gap-3 w-full text-left">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                      Live Chat 24/7
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 py-3 md:py-5 flex items-center justify-between gap-4 md:gap-8">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(true)} 
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Open menu"
          >
            <FiMenu size={22} strokeWidth={2} />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-2.5 flex-shrink-0 group">
            <div className="bg-primary text-white p-1.5 md:p-2 rounded-lg md:rounded-xl group-hover:scale-105 transition-transform shadow-sm">
              <FiShoppingBag size={18} className="md:hidden" strokeWidth={2.5} />
              <FiShoppingBag size={22} className="hidden md:block" strokeWidth={2.5} />
            </div>
            <span className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">AuraMart</span>
          </Link>

          {/* Search Bar - Desktop Only */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative w-full">
              <div className="flex w-full border-2 border-gray-100 rounded-lg overflow-hidden focus-within:border-primary/30 focus-within:shadow-[0_0_0_4px_rgba(255,0,79,0.05)] transition-all bg-gray-50/50">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="flex-1 px-5 py-3 text-sm bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
                  }}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && searchQuery.trim()) {
                         setShowSearchDropdown(false);
                         navigate(`/shop?keyword=${searchQuery}`);
                     }
                  }}
                />
                <button 
                  onClick={() => {
                     if (searchQuery.trim()) {
                         setShowSearchDropdown(false);
                         navigate(`/shop?keyword=${searchQuery}`);
                     }
                  }}
                  className="bg-primary px-8 text-white hover:bg-[#e60047] transition flex items-center justify-center cursor-pointer">
                  <FiSearch size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSearchDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 z-[100] overflow-hidden">
                  {isSearching ? (
                    <div className="p-6 flex justify-center">
                       <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto">
                      <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Products matching "{searchQuery}"
                      </div>
                      {searchResults.slice(0, 5).map(product => (
                        <Link 
                          key={product._id} 
                          to={`/product/${product._id}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            if (mobileSearchOpen) setMobileSearchOpen(false);
                          }}
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-primary font-black text-sm">Rs. {product.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-gray-300 group-hover:text-primary transition-colors">
                            <FiChevronRight size={18} />
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > 5 && (
                        <Link 
                          to={`/shop?keyword=${searchQuery}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            if (mobileSearchOpen) setMobileSearchOpen(false);
                          }}
                          className="block w-full p-3 text-center bg-gray-50 text-primary text-sm font-bold hover:bg-primary/5 cursor-pointer transition-colors"
                        >
                          View all {searchResults.length} results →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                         <FiSearch size={20} className="text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-bold text-sm">No results found</p>
                      <p className="text-gray-500 text-xs mt-1">Try checking your spelling or using more general terms</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-4 sm:gap-5 lg:gap-8 flex-shrink-0">
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden flex items-center justify-center text-gray-700 hover:text-primary transition cursor-pointer"
              aria-label="Search"
            >
              <FiSearch size={21} strokeWidth={2} />
            </button>

            <Link to="/wishlist" className="flex flex-col items-center gap-1 cursor-pointer hover:text-primary text-gray-700 transition">
              <div className="relative">
                <FiHeart size={21} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold hidden xl:block">Wishlist</span>
            </Link>

            <Link to="/cart" className="hidden md:flex flex-col items-center gap-1 cursor-pointer hover:text-primary text-gray-700 transition">
              <div className="relative">
                <FiShoppingCart size={21} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold hidden xl:block">Cart</span>
            </Link>

            {/* Notifications - Hidden on small mobile */}
            <div ref={notifRef} className="relative hidden sm:block">
              <div 
                className="text-gray-400 hover:text-primary transition cursor-pointer relative"
                onClick={handleNotifClick}
              >
                <FiBell size={21} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
                  <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 text-sm">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                          <FiBell size={20} className="text-gray-400" />
                        </div>
                        No notifications yet
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((notif) => (
                          notif.orderId ? (
                            <Link to={`/profile?order=${notif.orderId}`} key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition block" onClick={() => setShowNotifications(false)}>
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {notif.type === 'success' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> : <FiShoppingCart size={14} />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{notif.title}</h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                                  <span className="text-[10px] text-gray-400 mt-1 block">{new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition cursor-default">
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {notif.type === 'success' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> : <FiShoppingCart size={14} />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1">{notif.title}</h4>
                                  <p className="text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                                  <span className="text-[10px] text-gray-400 mt-1 block">{new Date(notif.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 border-t border-gray-100 p-2">
                    <button className="w-full text-center text-xs font-bold text-primary hover:text-[#e60047] py-1 transition">
                      View All Activity
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

            {/* Desktop and Mobile User Menu */}
            {userInfo ? (
              <div className="hidden sm:flex items-center gap-3 relative group">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                  <img src={userInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=FF004F&color=fff&bold=true`} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-[10px] text-gray-500 font-semibold leading-none mb-1">Hello,</span>
                  <span className="text-sm font-bold text-gray-900 leading-none flex items-center gap-1">
                    {userInfo.name.split(' ')[0]} <FiChevronDown size={14} className="text-gray-400" />
                  </span>
                </div>

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-2">
                    <Link to={userInfo.isAdmin ? "/admin" : "/profile"} className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition">
                      {userInfo.isAdmin ? 'Admin Dashboard' : 'My Profile'}
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition">My Orders</Link>
                    <div className="h-px bg-gray-100 my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-lg transition flex items-center gap-2 cursor-pointer">
                      <FiLogOut size={14} strokeWidth={3} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 md:gap-2 bg-gray-900 text-white px-3.5 py-1.5 md:px-5 md:py-2.5 rounded-full hover:bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 shadow-sm cursor-pointer ml-1 md:ml-0">
                <FiUser size={14} className="md:w-[16px] md:h-[16px]" />
                <span className="text-xs md:text-sm font-bold">Log In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        <div className={`lg:hidden overflow-visible transition-all duration-300 ease-in-out relative ${mobileSearchOpen ? 'max-h-32 opacity-100 z-50' : 'max-h-0 opacity-0 -z-10'}`} ref={mobileSearchRef}>
          <div className="container mx-auto px-4 pb-3">
            <div className="relative w-full">
              <div className="flex w-full border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-primary/30 transition-all bg-gray-50/50">
                <input
                  type="text"
                  placeholder="Search for products, brands..."
                  className="flex-1 px-4 py-3 text-sm bg-transparent focus:outline-none placeholder-gray-400 font-medium"
                  autoFocus={mobileSearchOpen}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowSearchDropdown(true);
                  }}
                  onKeyDown={(e) => {
                     if (e.key === 'Enter' && searchQuery.trim()) {
                         setShowSearchDropdown(false);
                         navigate(`/shop?keyword=${searchQuery}`);
                     }
                  }}
                />
                <button 
                  onClick={() => {
                     if (searchQuery.trim()) {
                         setShowSearchDropdown(false);
                         navigate(`/shop?keyword=${searchQuery}`);
                     }
                  }}
                  className="bg-primary px-5 text-white hover:bg-[#e60047] transition flex items-center justify-center cursor-pointer">
                  <FiSearch size={18} strokeWidth={2.5} />
                </button>
              </div>
              
              {/* Mobile Search Suggestions Dropdown */}
              {showSearchDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 z-[100] overflow-hidden">
                  {isSearching ? (
                    <div className="p-6 flex justify-center">
                       <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-[350px] overflow-y-auto">
                      <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        Products matching "{searchQuery}"
                      </div>
                      {searchResults.slice(0, 4).map(product => (
                        <Link 
                          key={product._id} 
                          to={`/product/${product._id}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                            setMobileSearchOpen(false);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                               <span className="text-primary font-black text-xs">Rs. {product.price.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-gray-300">
                            <FiChevronRight size={16} />
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > 4 && (
                        <Link 
                          to={`/shop?keyword=${searchQuery}`}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setMobileSearchOpen(false);
                          }}
                          className="block w-full p-2.5 text-center bg-gray-50 text-primary text-xs font-bold hover:bg-primary/5 cursor-pointer transition-colors"
                        >
                          View all {searchResults.length} results →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-900 font-bold text-sm">No results found</p>
                      <p className="text-gray-500 text-[10px] mt-1">Try checking your spelling</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="border-t border-gray-100 hidden lg:block">
          <div className="container mx-auto px-4">
            <ul className="flex items-center gap-8 overflow-x-auto hide-scrollbar">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                
                if (link.name === 'Contact') {
                  return (
                    <li key={link.name}>
                      <button 
                        onClick={() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="block py-3.5 text-[13px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors relative text-gray-900 hover:text-primary cursor-pointer focus:outline-none"
                      >
                        {link.name}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className={`block py-3.5 text-[13px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors relative ${isActive ? 'text-primary' : 'text-gray-900 hover:text-primary'}`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* ========================================== */}
      {/* MOBILE SLIDE-IN DRAWER                     */}
      {/* ========================================== */}

      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity duration-300 lg:hidden ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Slide-in Drawer */}
      <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[9999] transform transition-transform duration-300 ease-out lg:hidden flex flex-col shadow-2xl ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="bg-primary p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {userInfo ? (
              <>
                <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden flex-shrink-0">
                  <img src={userInfo.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name)}&background=FF004F&color=fff&bold=true`} alt="User" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">{userInfo.name}</p>
                  <p className="text-white/70 text-xs font-medium">{userInfo.email}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-white" size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Welcome Guest</p>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-white/80 text-xs font-medium hover:text-white underline">
                    Login / Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition cursor-pointer"
            aria-label="Close menu"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="flex-1 overflow-y-auto">
          <nav className="py-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              
              if (link.name === 'Contact') {
                return (
                  <button
                    key={link.name}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setTimeout(() => document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' }), 300);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 transition-colors text-gray-700 hover:bg-gray-50 border-l-[3px] border-transparent cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-gray-400">{link.icon}</span>
                      <span className="font-semibold text-[14px]">{link.name}</span>
                    </div>
                    <FiChevronRight size={16} className="text-gray-300" />
                  </button>
                );
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
                    isActive 
                      ? 'bg-primary/5 text-primary border-l-[3px] border-primary' 
                      : 'text-gray-700 hover:bg-gray-50 border-l-[3px] border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`${isActive ? 'text-primary' : 'text-gray-400'}`}>{link.icon}</span>
                    <span className="font-semibold text-[14px]">{link.name}</span>
                  </div>
                  <FiChevronRight size={16} className="text-gray-300" />
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-5"></div>

          {/* Account Section */}
          <div className="py-2">
            <p className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Account</p>
            
            {userInfo && (
              <>
                <Link
                  to={userInfo.isAdmin ? "/admin" : "/profile"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:bg-gray-50 transition border-l-[3px] border-transparent"
                >
                  <div className="flex items-center gap-3.5">
                    <FiUser size={18} className="text-gray-400" />
                    <span className="font-semibold text-[14px]">{userInfo.isAdmin ? 'Admin Dashboard' : 'My Profile'}</span>
                  </div>
                  <FiChevronRight size={16} className="text-gray-300" />
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:bg-gray-50 transition border-l-[3px] border-transparent"
                >
                  <div className="flex items-center gap-3.5">
                    <FiShoppingBag size={18} className="text-gray-400" />
                    <span className="font-semibold text-[14px]">My Orders</span>
                  </div>
                  <FiChevronRight size={16} className="text-gray-300" />
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:bg-gray-50 transition border-l-[3px] border-transparent"
                >
                  <div className="flex items-center gap-3.5">
                    <FiHeart size={18} className="text-gray-400" />
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[14px]">My Wishlist</span>
                      {wishlistCount > 0 && (
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
                      )}
                    </div>
                  </div>
                  <FiChevronRight size={16} className="text-gray-300" />
                </Link>
              </>
            )}

            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:bg-gray-50 transition border-l-[3px] border-transparent"
            >
              <div className="flex items-center gap-3.5">
                <FiShoppingCart size={18} className="text-gray-400" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14px]">My Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                  )}
                </div>
              </div>
              <FiChevronRight size={16} className="text-gray-300" />
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-5"></div>

          {/* Help Section */}
          <div className="py-2">
            <p className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Help & Info</p>
            <Link
              to="/support/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:bg-gray-50 transition border-l-[3px] border-transparent"
            >
              <div className="flex items-center gap-3.5">
                <FiHelpCircle size={18} className="text-gray-400" />
                <span className="font-semibold text-[14px]">Help & Support</span>
              </div>
              <FiChevronRight size={16} className="text-gray-300" />
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-5 py-3.5 text-gray-700 hover:bg-gray-50 transition border-l-[3px] border-transparent"
            >
              <div className="flex items-center gap-3.5">
                <FiMapPin size={18} className="text-gray-400" />
                <span className="font-semibold text-[14px]">Track Order</span>
              </div>
              <FiChevronRight size={16} className="text-gray-300" />
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 p-4">
          {userInfo ? (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition cursor-pointer"
            >
              <FiLogOut size={16} strokeWidth={2.5} /> Sign Out
            </button>
          ) : (
            <Link 
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-[#e60047] transition shadow-lg shadow-primary/20"
            >
              <FiUser size={16} /> Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
