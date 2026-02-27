import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../../lib/toast';
import client from '../../api/client';

export default function ResendVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu e-mail');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/resend-verification', { email });
      toast.success('E-mail de verificação enviado!');
      navigate('/email-verification-sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao enviar e-mail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-serif bg-[#f8f6f3]">
      {/* Left Panel - Content */}
      <div className="w-full lg:w-2/5 px-6 py-12 lg:px-16 lg:py-20 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Title */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#2a2a2a] mb-3 tracking-tight">
              Reenviar verificação
            </h1>
            <p className="text-[#6b6b6b] text-sm">
              Digite seu e-mail para receber um novo link de verificação
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[#4a4a4a] mb-2">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border border-[#d4d4d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Enviando...' : 'Enviar link de verificação'}
            </button>
          </form>

          {/* Back to Login */}
          <p className="mt-8 text-center text-sm text-[#6b6b6b]">
            <button
              onClick={() => navigate('/login')}
              className="text-[#9CAF88] hover:text-[#8a9d85] font-medium transition-colors"
            >
              Voltar ao login
            </button>
          </p>
        </div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div 
          className="absolute bg_ring inset-0 bg-cover bg-center"
          style={{
            backgroundImage_: `url('https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-end w-full p-16 pb-20">
          <div className="max-w-xl">
            <h2 className="text-5xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Seu sonho começa aqui
            </h2>
            <p className="text-xl text-white/95 leading-relaxed drop-shadow-lg">
              Organize o casamento perfeito com nossa plataforma
            </p>
          </div>
        </div>

        <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

    
    </div>
  );
}
