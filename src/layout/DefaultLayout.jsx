import React, { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { useData } from '../contexts/DataContext';

const DefaultLayout = ({children,notSticky, largerPadding, hero={}}) => {


 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header notSticky={notSticky} />
      <Hero
        title={hero.title || "Gestão de Orçamento"} 
        subtitle={hero.subtitle || "Planeie e acompanhe o orçamento do seu casamento"} 
      />
      {children}
      <Footer largerPadding={largerPadding} />
    </div>
  );
};

export default DefaultLayout;