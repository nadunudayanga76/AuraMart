import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiHeart, FiTruck, FiShield, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

// ==========================================
// Animated Number Counter Component
// ==========================================
const AnimatedCounter = ({ value, duration = 2000, prefix = "", suffix = "+" }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTimestamp = null;
    let animationFrameId = null;
    const endValue = parseInt(value.toString().replace(/,/g, ''), 10);
    
    if (isNaN(endValue)) {
      setCount(value); // Fallback if not a number
      return;
    }

    // Dynamic duration: small numbers count fast, large numbers take the full duration
    const dynamicDuration = endValue < 100 ? 1000 : duration;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / dynamicDuration, 1);
      // Ease out cubic function for smoother ending
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * endValue));
      
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };
    
    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, isVisible, duration]);

  // Format with commas if it's a large number
  const displayValue = typeof count === 'number' ? count.toLocaleString() : count;

  return (
    <span ref={countRef}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

const AboutPage = () => {
  const [statsData, setStatsData] = useState([
    { label: "Happy Customers", value: "0" },
    { label: "Premium Brands", value: "0" },
    { label: "Total Orders", value: "0" },
    { label: "Years of Excellence", value: "5" }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch real stats from DB
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stats/public`);
        setStatsData([
          { label: "Happy Customers", value: data.customers || 0 },
          { label: "Premium Brands", value: data.brands || 0 },
          { label: "Total Orders", value: data.orders || 0 },
          { label: "Years of Excellence", value: data.years || 5 }
        ]);
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Fallback to defaults on error
        setStatsData([
          { label: "Happy Customers", value: "50000" },
          { label: "Premium Brands", value: "150" },
          { label: "Total Orders", value: "2500" },
          { label: "Years of Excellence", value: "5" }
        ]);
      }
    };

    fetchStats();
  }, []);

  const values = [
    {
      icon: <FiTarget size={28} />,
      title: "Premium Quality",
      desc: "Every product in our catalog undergoes strict quality checks to ensure you receive only the best."
    },
    {
      icon: <FiHeart size={28} />,
      title: "Customer First",
      desc: "Your satisfaction is our ultimate priority. We are dedicated to providing an unparalleled shopping experience."
    },
    {
      icon: <FiTruck size={28} />,
      title: "Lightning Fast Delivery",
      desc: "With our optimized logistics network, we ensure your favorite items reach your doorstep in record time."
    },
    {
      icon: <FiShield size={28} />,
      title: "Secure Shopping",
      desc: "Your privacy and security are paramount. We use enterprise-grade encryption for all transactions."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-white"></div>
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <span className="inline-block py-1.5 px-4 bg-primary/10 text-primary font-bold text-sm tracking-widest uppercase rounded-full mb-6">
              Our Journey
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-8">
              Redefining the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff3366] whitespace-nowrap inline-block">E-commerce</span> Experience
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto">
              AuraMart isn't just another online store. We are a digital lifestyle destination committed to curating the world's most desired products, just for you.
            </p>
          </div>
        </section>

        {/* OUR STORY SECTION */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              <div className="w-full lg:w-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-[40px] rotate-3 scale-105 opacity-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200" 
                    alt="AuraMart Team" 
                    className="relative z-10 w-full h-auto object-cover rounded-[40px] shadow-2xl"
                  />
                  {/* Floating Badge */}
                  <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                           <FiHeart size={28} />
                        </div>
                        <div>
                           <p className="text-sm text-gray-500 font-bold">Trusted by</p>
                           <p className="text-xl font-black text-gray-900">100k+ Users</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">How We Started</h2>
                <div className="w-20 h-1.5 bg-primary rounded-full mb-8"></div>
                <div className="space-y-6 text-gray-600 font-medium text-lg leading-relaxed">
                  <p>
                    Born from a passion for fashion and cutting-edge technology, AuraMart was founded with a singular vision: to eliminate the friction from online shopping and create a platform that feels truly premium.
                  </p>
                  <p>
                    We noticed that while choices were abundant, true quality and exceptional customer service were rare. We decided to bridge that gap. Every product on AuraMart is carefully selected, ensuring it meets our rigorous standards for style, durability, and value.
                  </p>
                  <p>
                    Today, we're proud to connect thousands of customers daily with the products they love, powered by a seamless digital experience and a team that genuinely cares.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {statsData.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tighter">
                    <AnimatedCounter value={stat.value} duration={2500} />
                  </h3>
                  <p className="text-gray-400 font-bold text-sm md:text-base uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CORE VALUES SECTION */}
        <section className="py-24 bg-[#fafbfc]">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Our Core Values</h2>
              <p className="text-gray-500 font-medium max-w-2xl mx-auto">The principles that guide every decision we make at AuraMart.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((val, idx) => (
                <div key={idx} className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {val.icon}
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">{val.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-primary/5 rounded-[40px] p-12 md:p-20 border border-primary/10">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Ready to Upgrade Your Style?</h2>
              <p className="text-lg text-gray-600 font-medium mb-10 max-w-2xl mx-auto">
                Join the AuraMart family today and experience online shopping the way it was meant to be.
              </p>
              <Link 
                to="/shop" 
                className="inline-flex items-center gap-3 bg-primary hover:bg-[#e60047] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-[0_8px_25px_rgba(255,0,79,0.3)] hover:shadow-[0_12px_35px_rgba(255,0,79,0.4)] hover:-translate-y-1"
              >
                Start Shopping <FiArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
