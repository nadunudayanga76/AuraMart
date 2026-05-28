import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { fetchWishlist } from '../store/wishlistSlice';
import axios from 'axios';

const WishlistPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { wishlistItems, loading } = useSelector((state) => state.wishlist);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=wishlist');
    }
  }, [userInfo, navigate]);

  if (!userInfo) {
    return null;
  }
  
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    const fetchProductsDetails = async () => {
      if (wishlistItems && wishlistItems.length > 0) {
        setIsLoadingProducts(true);
        try {
          // Ideally backend /wishlist endpoint should return populated products,
          // but just in case it returns IDs or we want full details, we can fetch all and filter, 
          // or rely on the populated array if the backend populates it properly.
          // In our backend toggleWishlist and getWishlist, we used .populate('wishlist').
          // So wishlistItems should already be an array of product objects!
          setProducts(wishlistItems);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingProducts(false);
        }
      } else {
        setProducts([]);
        setIsLoadingProducts(false);
      }
    };

    fetchProductsDetails();
  }, [wishlistItems]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight">My Wishlist</h1>
          <p className="text-sm text-gray-500 mt-1">
            {wishlistItems?.length || 0} items saved for later
          </p>
        </div>

        {loading || isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-gray-500 mt-4 font-medium">Loading your wishlist...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-gray-200 p-16 rounded-2xl text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you love and buy them later.</p>
            <Link to="/shop" className="bg-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-primary/30 hover:-translate-y-0.5 hover:shadow-xl transition-all inline-block">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
