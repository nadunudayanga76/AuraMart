import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const RelatedProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`);
        // Filter by same category, exclude the current product, limit to 4 items
        const related = data
          .filter(p => p.category === category && p._id !== currentProductId)
          .slice(0, 4);
        setProducts(related);
      } catch (error) {
        console.error('Error fetching related products', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchRelated();
    }
  }, [category, currentProductId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 mb-8 border-t border-gray-100 pt-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Related Products</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">You might also like these items</p>
        </div>
        <Link to={`/shop?category=${encodeURIComponent(category)}`} className="hidden md:flex text-primary font-bold text-sm hover:underline items-center gap-1 bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors">
          View all in {category}
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      
      <div className="mt-8 flex justify-center md:hidden">
         <Link to={`/shop?category=${encodeURIComponent(category)}`} className="text-primary font-bold text-sm hover:underline border border-primary/20 bg-primary/5 px-6 py-2.5 rounded-full hover:bg-primary/10 transition-colors">
          View all in {category}
        </Link>
      </div>
    </section>
  );
};

export default RelatedProducts;
