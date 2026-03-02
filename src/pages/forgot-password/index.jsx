import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import weddingBg from '../../assets/wedding.png';
import { toast } from '../../lib/toast';
import client from '../../api/client';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor, insira seu e-mail');
      return;
    }

    setLoading(true);

    try {
      const response = await client.post('/auth/forgot-password', {
        email: email.toLowerCase()
      });

      setSubmitted(true);
      toast.success('Um link de redefinição de senha foi enviado para seu e-mail!');
    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMsg = err.response?.data?.message || 'Erro ao processar solicitação. Tente novamente.';
      
      if (errorCode === 'USER_NOT_FOUND') {
        toast.error('Nenhuma conta encontrada com este e-mail.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-serif">
      {/* Left Panel - Forgot Password Form */}
      <div className="w-full lg:w-2/5 bg-[#f8f6f3] px-6 py-12 lg:px-16 lg:py-20 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Logo and Title */}
          <div className="mb-12">
            <div onClick={()=>navigate('/')} className="flex items-center gap-3 mb-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#9CAF88] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#3a3a3a] tracking-tight">Meu casamento</h1>
            </div>
            <p className="text-[#6b6b6b] text-sm">Planeie o casamento dos seus sonhos</p>
          </div>

          {/* Title */}
          <div className="mb-10">
            {!submitted ? (
              <>
                <h2 className="text-4xl font-bold text-[#2a2a2a] mb-3 tracking-tight">Esqueceu sua senha?</h2>
                <p className="text-[#6b6b6b] text-sm">
                  Não se preocupe! Insira seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-[#2a2a2a] mb-3 tracking-tight">Verifique seu e-mail</h2>
                <p className="text-[#6b6b6b] text-sm">
                  Enviamos as instruções de redefinição de senha para:
                </p>
                <p className="text-[#9CAF88] font-medium mt-2">{email}</p>
              </>
            )}
          </div>

          {!submitted ? (
            /* Form */
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    required
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
                {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          ) : (
            /* Success Message */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-green-800 text-center">
                  Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                Voltar ao Login
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          )}

          {/* Back to Login */}
          <p className="mt-8 text-center text-sm text-[#6b6b6b]">
            Lembrou da senha?{' '}
            <Link to="/login" className="text-[#9CAF88] hover:text-[#8a9d85] font-medium transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - hero image */}
      <div className="max-md:hidden flex lg:w-3/5 relative overflow-hidden">
        <div 
          className="absolute bg_ring inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage_: `url(${weddingBg})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-transparent to-black/40"></div>
        </div>

        
        <div className="relative z-10 flex items-center justify-center w-full p-6">
  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md transform hover:scale-[1.02] transition-transform duration-300 animate-float">
    <div className="flex justify-center mb-6">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#9CAF88] to-[#b8c5b3] flex items-center justify-center shadow-md">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
    </div>

    <h2 className="text-2xl font-bold text-[#2a2a2a] mb-4 text-center">
      Não se preocupe, acontece!
    </h2>

    <p className="text-[#5a5a5a] text-sm text-center mb-8 leading-relaxed">
      Recupere acesso à sua conta rapidamente e continue planejando o casamento dos seus sonhos.
    </p>

    <div className="space-y-3">
      {[
        'Segurança garantida',
        'Processo rápido e fácil',
        'Suporte disponível 24/7'
      ].map((feature, index) => (
        <div key={index} className="flex items-center gap-3 group">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9CAF88]/20 flex items-center justify-center group-hover:bg-[#9CAF88] transition-all duration-300">
            <svg className="w-4 h-4 text-[#9CAF88] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-sm text-[#4a4a4a] font-medium">{feature}</span>
        </div>
      ))}
    </div>
  </div>
</div>

        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

     
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
