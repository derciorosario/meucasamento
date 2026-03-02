import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const DefaultLayout = ({children, hero={}}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <Hero
        title={hero.title || "Gestão de Orçamento"} 
        subtitle={hero.subtitle || "Planeie e acompanhe o orçamento do seu casamento"} 
      />
      {children}
      <Footer />
    </div>
  );
};

export default DefaultLayout;