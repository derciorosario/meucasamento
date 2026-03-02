import React from 'react';

const Hero = ({ title = "Gestão de Orçamento", subtitle = "Planeje e acompanhe o orçamento do seu casamento" }) => {
  return (
    <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 py-16 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop" 
          alt="Wedding flowers" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl max-md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-lg text-gray-600 max-md:hidden">{subtitle}</p>
      </div>
    </div>
  );
};

export default Hero;