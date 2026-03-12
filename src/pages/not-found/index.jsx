import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          {/* 404 Image/Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-6xl font-bold text-[#9CAA8E]">404</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-black mb-4">
            Página Não Encontrada
          </h1>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Desculpe, a página que procura não existe ou foi movida. 
            Verifique o URL ou volte à página inicial.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-full hover:bg-[#8A9A7E] transition-colors"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="mt-16 flex items-center gap-2 text-gray-400">
          <div className="w-2 h-2 rounded-full bg-[#9CAA8E]"></div>
          <div className="w-2 h-2 rounded-full bg-[#9CAA8E]/50"></div>
          <div className="w-2 h-2 rounded-full bg-[#9CAA8E]/25"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
