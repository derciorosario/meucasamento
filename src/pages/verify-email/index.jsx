import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../../lib/toast';
import client from '../../api/client';

export default function VerifyEmail() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Call the backend verification endpoint
        const response = await client.get(`/auth/verify-email/${token}`);
        
        if (response.data.success) {
          setVerified(true);
          toast.success('E-mail verificado com sucesso!');
        } else {
          setError(response.data.message || 'Erro na verificação');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Token inválido ou expirado';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Token não fornecido');
      setVerifying(false);
    }
  }, [token]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleResend = () => {
    navigate('/resend-verification');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-serif bg-[#f8f6f3]">
      {/* Left Panel - Content */}
      <div className="w-full lg:w-2/5 px-6 py-12 lg:px-16 lg:py-20 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Loading State */}
          {verifying && (
            <>
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#9CAF88]/20 flex items-center justify-center animate-spin">
                  <svg className="w-10 h-10 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3 tracking-tight">
                  Verificando...
                </h1>
                <p className="text-[#6b6b6b] text-sm">
                  Por favor, aguarde enquanto verificamos seu e-mail
                </p>
              </div>
            </>
          )}

          {/* Success State */}
          {verified && !verifying && (
            <>
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3 tracking-tight">
                  E-mail verificado!
                </h1>
                <p className="text-[#6b6b6b] text-sm">
                  Sua conta foi verificada com sucesso. Agora você pode fazer login.
                </p>
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Fazer login
              </button>
            </>
          )}

          {/* Error State */}
          {error && !verifying && (
            <>
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3 tracking-tight">
                  Erro na verificação
                </h1>
                <p className="text-[#6b6b6b] text-sm">
                  {error}
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleResend}
                  className="w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Reenviar e-mail de verificação
                </button>
                <button
                  onClick={handleLogin}
                  className="w-full bg-white border-2 border-[#d4d4d4] hover:border-[#9CAF88] text-[#4a4a4a] font-medium py-3.5 rounded-lg transition-all duration-300"
                >
                  Voltar ao login
                </button>
              </div>
            </>
          )}
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

      {/* Mobile Hero */}
      <div className="lg:hidden relative overflow-hidden">
        <div 
          className="absolute bg_ring inset-0 bg-cover bg-center"
          style={{
            backgroundImage_: `url('https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        </div>
        <div className="relative z-10 p-8 py-16">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
            Seu sonho começa aqui
          </h2>
          <p className="text-lg text-white/95 leading-relaxed drop-shadow-lg">
            Organize o casamento perfeito com nossa plataforma
          </p>
        </div>
      </div>
    </div>
  );
}
