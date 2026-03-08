import React from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer = ({largerPadding}) => {
  
  const navigate = useNavigate();
  
  return (
     <footer className={`bg-[#1a2332]   py-12 text-white`}>
        <div className={`max-w-7xl ${largerPadding ? 'max-md:mb-20':''} mx-auto px-8 `}>
          <div className="grid max-md:hidden md:grid-cols-4 gap-8 mb-8">
            
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-white">Meu casamento</span>
              </div>
              <p className="text-gray-400 text-sm">
                Planeie o casamento perfeito do início ao fim
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Para Noivos</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/checklist')} className="hover:text-white !text-gray-400">Checklist</button></li>
                <li><button onClick={() => navigate('/budget')} className="hover:text-white !text-gray-400">Orçamento</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Fornecedores</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/signup?as=vendor')} className="hover:text-white !text-gray-400">Cadastre-se</button></li>
                <li><button onClick={() => navigate('/vendors/plans')} className="hover:text-white hidden !text-gray-400">Planos</button></li>
                <li><button onClick={() => navigate('/support')} className="hover:text-white !text-gray-400">Suporte</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/about')} className="hover:text-white !text-gray-400">Sobre</button></li>
                <li><button onClick={() => navigate('/contact')} className="hover:text-white !text-gray-400">Contato</button></li>
                <li><button onClick={() => navigate('/privacy')} className="hover:text-white !text-gray-400">Privacidade</button></li>
              </ul>
            </div>
          </div>
          
          <div className="md:border-t border-gray-700 md:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 max-md:text-center text-sm mb-4 md:mb-0">
              © 2026 Meu Casamento. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white !text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white !text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white !text-white">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
     </footer>
  );
};

export default Footer;