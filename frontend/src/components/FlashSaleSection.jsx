import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  if (Object.keys(timeLeft).length === 0) {
    return <span className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1 rounded-full">Sale Ended</span>;
  }

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center justify-center bg-gray-900 text-white w-10 h-10 rounded-lg shadow-lg">
        <span className="text-sm font-black leading-none">{formatNumber(timeLeft.days)}</span>
        <span className="text-[9px] uppercase font-bold text-gray-400">Days</span>
      </div>
      <span className="text-xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center justify-center bg-gray-900 text-white w-10 h-10 rounded-lg shadow-lg">
        <span className="text-sm font-black leading-none">{formatNumber(timeLeft.hours)}</span>
        <span className="text-[9px] uppercase font-bold text-gray-400">Hrs</span>
      </div>
      <span className="text-xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center justify-center bg-gray-900 text-white w-10 h-10 rounded-lg shadow-lg">
        <span className="text-sm font-black leading-none">{formatNumber(timeLeft.minutes)}</span>
        <span className="text-[9px] uppercase font-bold text-gray-400">Min</span>
      </div>
      <span className="text-xl font-bold text-gray-400">:</span>
      <div className="flex flex-col items-center justify-center bg-primary text-white w-10 h-10 rounded-lg shadow-lg shadow-primary/30">
        <span className="text-sm font-black leading-none">{formatNumber(timeLeft.seconds)}</span>
        <span className="text-[9px] uppercase font-bold text-pink-200">Sec</span>
      </div>
    </div>
  );
};

const FlashSaleSection = ({ categoryFilter }) => {
  const [flashProducts, setFlashProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/flash-sale`);
        let filtered = data;
        if (categoryFilter) {
          filtered = data.filter(p => p.category && p.category.toLowerCase().includes(categoryFilter.toLowerCase()));
        }
        setFlashProducts(filtered);
      } catch (error) {
        console.error('Error fetching flash sales', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, [categoryFilter]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flashProducts.length === 0) {
    return null; // Don't show the section if there are no flash sales
  }

  // Find the earliest ending flash sale for the countdown
  const earliestEndDate = flashProducts.reduce((earliest, product) => {
    if (!earliest) return product.flashSaleEndDate;
    return new Date(product.flashSaleEndDate) < new Date(earliest) ? product.flashSaleEndDate : earliest;
  }, null);

  return (
    <section id="flash-sale-section" className="container mx-auto px-4 mb-20">
      <div className="bg-gradient-to-r from-orange-50 via-white to-pink-50 rounded-3xl p-6 md:p-8 lg:p-10 border border-orange-100 shadow-[0_10px_40px_-15px_rgba(249,115,22,0.15)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 border-b border-orange-200/50 pb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white shadow-md p-3 rounded-2xl">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Flash <span className="text-orange-600">Deals</span></h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Don't miss out on these limited time offers!</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-5 py-3 rounded-2xl shadow-sm border border-white">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ends In</span>
              {earliestEndDate && <CountdownTimer targetDate={earliestEndDate} />}
            </div>
          </div>

          <div 
            className="flex lg:grid lg:grid-cols-4 overflow-x-auto gap-4 lg:gap-6 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pb-0 hide-scrollbar snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {flashProducts.slice(0, 4).map((product) => (
              <div key={product._id} className="min-w-[240px] sm:min-w-[280px] lg:min-w-0 flex-shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}} />
          
          {flashProducts.length > 4 && (
            <div className="flex justify-center mt-10">
              <Link to="/shop" className="bg-white border-2 border-orange-100 text-orange-600 font-bold px-8 py-3 rounded-full text-sm hover:bg-orange-50 transition-colors flex items-center gap-2 shadow-sm hover:shadow">
                View All Deals <span className="text-lg leading-none">›</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlashSaleSection;
