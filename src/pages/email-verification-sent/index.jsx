import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../../lib/toast';
import client from '../../api/client';

export default function EmailVerificationSent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Get email from URL parameter
  const originalEmail = searchParams.get('email') || email;

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setResendEmail(emailParam);
    }
  }, [searchParams]);

  const handleResend = async () => {
    const emailToUse = resendEmail || originalEmail;
    if (!emailToUse) {
      toast.error('Por favor, digite seu e-mail');
      return;
    }

    setLoading(true);
    try {
      await client.post('/auth/resend-verification', { email: emailToUse });
      setResent(true);
      setEmail(emailToUse);
      setResendEmail(emailToUse);
      toast.success('E-mail de verificação enviado!');
    } catch (err) {
      const errorCode = err.response?.data?.code;
      if (errorCode === 'ALREADY_VERIFIED') {
        toast.error('Este e-mail já foi verificado. Faça login.');
      } else if (errorCode === 'USER_NOT_FOUND') {
        toast.error('Nenhuma conta encontrada com este e-mail.');
      } else {
        toast.error(err.response?.data?.message || 'Erro ao enviar e-mail');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100vh] flex flex-col lg:flex-row font-serif bg-[#f8f6f3]">
      {/* Left Panel - Content */}
      <div className="w-full overflow-y-auto lg:w-2/5 px-6 py-12 lg:px-16 lg:py-20">
        <div className="max-w-md mx-auto w-full">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#9CAF88]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2a2a2a] mb-3 tracking-tight">
              Verifique seu e-mail
            </h1>
            <p className="text-[#6b6b6b] text-sm">
              Enviamos um link de verificação para:<br />
              <strong className="text-[#9CAF88]">{originalEmail || 'seu@email.com'}</strong>
            </p>
          </div>

          {/* Email Input - Hidden initially */}
          {showInput && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#4a4a4a] mb-2">
                Seu e-mail de registro
              </label>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-[#d4d4d4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all"
              />
            </div>
          )}

          {/* Single Button */}
          <button
            onClick={showInput ? handleResend : () => setShowInput(true)}
            disabled={loading}
            className={`w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mb-6 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enviando...' : resent ? 'E-mail enviado!' : showInput ? 'Reenviar e-mail' : 'Não recebeu? Digite seu e-mail'}
          </button>

          {resent && (
            <p className="text-sm text-green-600 text-center mb-4">
              Verifique sua caixa de entrada novamente
            </p>
          )}

          {/* Instructions */}
          <div className="bg-[#f0ede8] rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-[#4a4a4a] mb-2">Instruções:</h3>
            <ul className="text-sm text-[#6b6b6b] space-y-2">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#9CAF88] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Verifique sua caixa de entrada</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#9CAF88] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Clique no link de verificação enviado</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#9CAF88] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>O link expira em 24 horas</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#9CAF88] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Verifique também spam/lixo eletrônico</span>
              </li>
            </ul>
          </div>

          {/* Back to Login */}
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-white border-2 border-[#d4d4d4] hover:border-[#9CAF88] text-[#4a4a4a] font-medium py-3.5 rounded-lg transition-all duration-300"
          >
            Voltar ao login
          </button>
        </div>
      </div>

      {/* Right Panel - Hero Image */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg_ring"
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
