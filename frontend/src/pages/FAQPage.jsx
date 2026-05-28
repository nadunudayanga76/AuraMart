import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FiChevronDown, FiHelpCircle } from 'react-icons/fi';

const FAQPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by clicking on the 'Track Order' link in the top menu and entering your order ID. You'll receive real-time updates on your shipment status."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. We also offer Cash on Delivery for selected areas."
    },
    {
      question: "How long does shipping usually take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping is available at checkout and usually delivers within 1-2 business days. International shipping may take 7-14 days."
    },
    {
      question: "Can I change or cancel my order?",
      answer: "Orders can be modified or cancelled within 2 hours of placement. Please contact our support team via Live Chat or by scrolling down to the Contact Us section for immediate assistance."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to over 100 countries worldwide. International shipping costs and delivery times are calculated at checkout based on your location."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <FiHelpCircle size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our products, shipping, returns, and more. 
            Can't find what you're looking for? Reach out to our support team.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-0">
              <button
                className="w-full flex items-center justify-between py-6 text-left focus:outline-none group"
                onClick={() => toggleAccordion(index)}
              >
                <span className={`text-lg font-bold transition-colors ${activeIndex === index ? 'text-primary' : 'text-gray-900 group-hover:text-primary'}`}>
                  {faq.question}
                </span>
                <span className={`ml-4 flex-shrink-0 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-primary' : 'text-gray-400 group-hover:text-primary'}`}>
                  <FiChevronDown size={20} />
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'max-h-48 opacity-100 mb-6' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed pr-8">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQPage;
