import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  // Replace with your actual WhatsApp number with country code (e.g., 94771234567 for Sri Lanka)
  const whatsappNumber = "94763039908"; 
  const message = "Hello AuraMart! I need some help.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-[0_4px_14px_rgba(34,197,94,0.4)] hover:bg-green-600 hover:scale-110 transition-all duration-300 group"
      aria-label="Chat with us on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8" />
      
      {/* Tooltip */}
      <span className="absolute right-16 bg-white text-gray-800 text-sm font-medium py-1.5 px-3 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-gray-100">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
