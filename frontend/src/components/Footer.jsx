import React from 'react';
import { Link } from 'react-router-dom';
import { BsBagHeartFill } from 'react-icons/bs';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMapPin, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#fafafa] border-t border-gray-100 pt-20 pb-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <span className="bg-primary text-white p-1.5 rounded-lg shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
              </span>
              <span className="text-2xl font-black text-gray-900 tracking-tight">AuraMart</span>
            </Link>
            <p className="text-gray-500 text-[13px] leading-relaxed mb-8 max-w-sm font-medium">
              Your one-stop destination for premium quality products at the best prices. Happy Shopping!
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"><FiFacebook size={18} fill="currentColor" className="border-none" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"><FiTwitter size={18} fill="currentColor" /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"><FiInstagram size={18} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md"><FiYoutube size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-[15px]">Shop</h4>
            <ul className="space-y-4 text-[13px] text-gray-500 font-medium">
              <li><Link to="/shop" className="hover:text-primary transition">All Products</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition">Categories</Link></li>
              <li><Link to="/deals" className="hover:text-primary transition">Deals & Offers</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition">Your Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary transition">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-[15px]">Customer Service</h4>
            <ul className="space-y-4 text-[13px] text-gray-500 font-medium">
              <li><Link to="/track-order" className="hover:text-primary transition">Track Order</Link></li>
              <li><Link to="/support/returns" className="hover:text-primary transition">Returns & Refunds</Link></li>
              <li><Link to="/support/faq" className="hover:text-primary transition">FAQ</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition">My Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 text-[15px]">Company</h4>
            <ul className="space-y-4 text-[13px] text-gray-500 font-medium mb-8">
              <li><Link to="/about" className="hover:text-primary transition">About Us</Link></li>
              <li><a href="mailto:support@auramart.com" className="hover:text-primary transition">Contact Us</a></li>
            </ul>

            <h4 className="font-bold text-gray-900 mb-4 text-[13px] uppercase tracking-wide">Get Our App</h4>
            <div className="flex flex-col gap-3">
               <a href="#" className="bg-gray-900 text-white rounded-xl px-4 py-2.5 flex items-center gap-3 hover:bg-primary transition-colors shadow-sm">
                  <FaApple size={24} />
                  <div className="flex flex-col">
                     <span className="text-[9px] uppercase leading-none opacity-80 mb-0.5">Download on the</span>
                     <span className="text-[14px] font-bold leading-none">App Store</span>
                  </div>
               </a>
               <a href="#" className="bg-gray-900 text-white rounded-xl px-4 py-2.5 flex items-center gap-3 hover:bg-primary transition-colors shadow-sm">
                  <FaGooglePlay size={22} />
                  <div className="flex flex-col">
                     <span className="text-[9px] uppercase leading-none opacity-80 mb-0.5">GET IT ON</span>
                     <span className="text-[14px] font-bold leading-none">Google Play</span>
                  </div>
               </a>
            </div>
          </div>

        </div>

        {/* Contact info before the very bottom line */}
        <div id="footer-contact" className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-gray-100">
           <div className="flex items-start gap-3">
              <FiMapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
              <span className="text-[13px] text-gray-500 font-medium">No. 283/K/2, Dambuwawaththa,<br/>Mobodala, Gampaha</span>
           </div>
           <div className="flex items-center gap-3">
              <FiPhone className="text-gray-400 flex-shrink-0" size={18} />
              <span className="text-[13px] text-gray-500 font-medium">076 303 9908</span>
           </div>
           <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <FiMail size={14} />
              </span>
              <span className="text-[13px] text-gray-500 font-medium">support@auramart.com</span>
           </div>
        </div>

        <div className="border-t border-gray-200 pt-8 pb-4 flex flex-col items-center justify-center gap-5">
          <div className="flex gap-2 items-center flex-wrap justify-center">
             <div className="px-3 py-1 border border-gray-200 bg-white rounded text-[10px] font-black text-blue-800 italic">VISA</div>
             <div className="px-3 py-1 border border-gray-200 bg-white rounded flex items-center justify-center gap-1">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full -ml-1.5 mix-blend-multiply"></div>
             </div>
             <div className="px-3 py-1 border border-gray-200 bg-white rounded text-[10px] font-black text-blue-500 italic">PayPal</div>
             <div className="px-3 py-1 border border-gray-200 bg-white rounded text-[10px] font-black text-black"> Pay</div>
             <div className="px-3 py-1 border border-gray-200 bg-white rounded flex items-center justify-center gap-1">
                <span className="text-blue-500 font-bold text-[10px]">G</span>
                <span className="text-red-500 font-bold text-[10px]">P</span>
                <span className="text-yellow-500 font-bold text-[10px]">a</span>
                <span className="text-blue-500 font-bold text-[10px]">y</span>
             </div>
             <div className="ml-3 flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                <FiShield size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">100% Secure Checkout</span>
             </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[13px] text-gray-500 font-medium text-center">
             <p>© 2026 <strong className="text-gray-900">AuraMart</strong>. All Rights Reserved.</p>
             <span className="hidden md:inline text-gray-300">|</span>
             <p>Developed with <span className="text-red-500 text-lg leading-none align-middle mx-0.5">♥</span> by <span className="font-bold text-gray-900">Nadun Udayanga</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
