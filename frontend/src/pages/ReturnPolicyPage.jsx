import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiRefreshCcw, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';

const ReturnPolicyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Header Section */}
        <div className="bg-gray-50 py-16 md:py-24 border-b border-gray-100">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Returns & Refunds</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We want you to be completely satisfied with your purchase. If you're not happy, we make returns as easy and seamless as possible.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-5xl">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                <FiClock size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">30-Day Returns</h3>
              <p className="text-gray-600 leading-relaxed">
                You have 30 days from the date of delivery to return items for a full refund or exchange.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <FiRefreshCcw size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Free Return Shipping</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide a pre-paid return label for all domestic orders. No hidden fees or restocking charges.
              </p>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3">
                <FiShield size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Refunds</h3>
              <p className="text-gray-600 leading-relaxed">
                Refunds are processed within 3-5 business days back to your original payment method.
              </p>
            </div>
          </div>

          {/* Policy Content */}
          <div className="max-w-3xl mx-auto prose prose-lg prose-gray">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Return Conditions</h2>
            <ul className="space-y-4 mb-10 list-none p-0">
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">Items must be unworn, unwashed, and have original tags attached.</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">Shoes must be returned in their original shoe box without damage.</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">Intimates, swimwear, and earrings are final sale for hygiene reasons.</span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-700">Sale items marked with a discount of 50% or more are final sale.</span>
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 mt-12">How to Return an Item</h2>
            <div className="space-y-6 text-gray-700">
              <p>
                <strong>1. Initiate Return:</strong> Log in to your account, go to "My Orders", select the item you wish to return, and click "Return Item". If you checked out as a guest, please use the Order Tracker page.
              </p>
              <p>
                <strong>2. Print Label:</strong> Once your return is approved instantly, you will receive a pre-paid shipping label via email. Print this label.
              </p>
              <p>
                <strong>3. Pack & Ship:</strong> Securely pack the items in their original packaging. Attach the shipping label and drop it off at your nearest authorized carrier location.
              </p>
              <p>
                <strong>4. Refund Processing:</strong> Once we receive your return, we will inspect the items and process your refund within 3-5 business days. You will receive an email confirmation when the refund is issued.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnPolicyPage;
