import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import weddingBg from '../../assets/wedding.png';
import { toast } from '../../lib/toast';
import client, { loginAsUser } from '../../api/client';

// Email validation function
const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(v || "").toLowerCase());

// Password validation
const validatePassword = (password) => {
  if (!password) return "Senha é obrigatória";
  if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
  return "";
};

export default function WeddingLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleData, setGoogleData] = useState({
    googleId: '',
    email: '',
    name: '',
    avatar: ''
  });
  
  // Account selection modal state
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountOptions, setAccountOptions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };

    let isValid = true;

    // Only validate email/password if not using Google
    if (!googleConnected) {
      // Email validation
      if (!formData.email) {
        newErrors.email = 'E-mail é obrigatório';
        isValid = false;
      } else if (!emailOK(formData.email)) {
        newErrors.email = 'Por favor, insira um e-mail válido';
        isValid = false;
      }

      // Password validation
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If Google connected, use Google login
    if (googleConnected) {
      await handleGoogleLoginSubmit();
      return;
    }

    // Validate form for email/password login
    if (!validateForm()) {
      toast.error('Por favor, corrija os campos destacados.');
      return;
    }

    setLoading(true);

    try {
      const response = await client.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

     
       // Check if account selection is required
      if (response?.data?.requiresAccountSelection) {
        setAccountOptions(response.data.accounts || []);
        setShowAccountModal(true);
        setLoading(false);
        return;
      }


      // Store isPartner flag based on login response
      const isPartnerLogin = (response.data.loggedInAsPartner || response.data?.data?.loggedInAsPartner) === true;
      localStorage.setItem('isPartner', isPartnerLogin ? 'true' : 'false');

      // Store tokens
      localStorage.setItem('accessToken', response.data.accessToken || response.data?.data?.accessToken);
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      
      
      toast.success('Login realizado com sucesso!');

      
      // Redirect to home/dashboard
      //navigate('/');
      window.location.href="/"

    } catch (err) {
      const errorCode = err.response?.data?.code;
      const errorMsg = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      
     
      
      // Handle specific error codes
      if (errorCode === 'EMAIL_NOT_FOUND') {
        setErrors(prev => ({ ...prev, email: 'E-mail não encontrado' }));
        toast.error('E-mail não encontrado');
      } else if (errorCode === 'WRONG_PASSWORD') {
        setErrors(prev => ({ ...prev, password: 'Senha incorreta' }));
        toast.error('Senha incorreta');
      } else if (errorCode === 'GOOGLE_ONLY_ACCOUNT') {
        setErrors(prev => ({ ...prev, email: 'Esta conta usa Google. Faça login com Google.' }));
        toast.error('Este e-mail foi registrado com Google. Faça login com Google.');
      } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setErrors(prev => ({ ...prev, email: 'E-mail não verificado' }));
        toast.error('Por favor, verifique seu e-mail antes de fazer login.');
      } else if (errorCode === 'ACCOUNT_DEACTIVATED') {
        setErrors(prev => ({ ...prev, email: 'Conta desativada' }));
        toast.error('Conta desativada. Entre em contato com suporte.');
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle account selection from modal
  const handleAccountSelect = async (account) => {
    setSelectedAccount(account);
    setLoading(true);
    setShowAccountModal(false);
    
    try {
      // Store tokens directly from the account data
      const accessToken = account.accessToken;
      const refreshToken = account.refreshToken;
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      
      // If partner account selected, save partner info to localStorage
      if (account.type === 'partner') {
        localStorage.setItem('isPartner', 'true');
        localStorage.setItem('partnerName', account.name || '');
      } else {
        localStorage.setItem('isPartner', 'false');
        localStorage.removeItem('partnerName');
      }
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberEmail', formData.email);
      } else {
        localStorage.removeItem('rememberEmail');
      }
      
      toast.success('Login realizado com sucesso!');
      window.location.href="/"
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setSelectedAccount(null);
    }
  };
  const googleLogin = useGoogleLogin({
    scope: 'openid profile email',
    onSuccess: async (tokenResponse) => {
      setLoading(true);

      try {
        // Get user info from Google using the access token
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const { sub: googleId, email, name, picture } = userInfoResponse.data;

        // Store Google data
        setGoogleData({
          googleId,
          email,
          name,
          avatar: picture
        });

        // Populate form
        setFormData(prev => ({ ...prev, email }));
        setGoogleConnected(true);
        
        // Clear any errors
        setErrors({
          email: '',
          password: '',
        });
        
        toast.success('Conectado com Google!');
        
      } catch (err) {
        toast.error('Erro ao conectar com Google. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error('Falha ao conectar com Google. Tente novamente.');
    }
  });

  const disconnectGoogle = () => {
    setGoogleConnected(false);
    setGoogleData({
      googleId: '',
      email: '',
      name: '',
      avatar: ''
    });
    setFormData(prev => ({ ...prev, email: '' }));
    
    // Clear errors
    setErrors({
      email: '',
      password: '',
    });
  };

  const handleGoogleLoginSubmit = async () => {
    setLoading(true);

    try {

      const response = await client.post('/auth/google/mobile', {
        
        googleId: googleData.googleId,
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.avatar,
        isLogin:true

      });


      // Check if account selection is required (for partner associations)
      if (response?.data?.requiresAccountSelection) {
        setAccountOptions(response.data.accounts || []);
        setShowAccountModal(true);
        setLoading(false);
        return;
      }


      // Store isPartner flag based on login response (Google login)
      const isPartnerLogin = (response.data?.loggedInAsPartner || response.data.data?.loggedInAsPartner) === true;
      localStorage.setItem('isPartner', isPartnerLogin ? 'true' : 'false');

      // Store tokens
      localStorage.setItem('accessToken', response.data.data.accessToken);
      
      toast.success('Login realizado com Google!');
      
      // Redirect to home/dashboard
     //  navigate('/');
     window.location.href="/"
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro ao fazer login com Google';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="h-[100vh] flex flex-col lg:flex-row font-serif bg-[#f8f6f3]">
        {/* Left Panel - Login Form */}
        <div className="w-full overflow-y-auto lg:w-2/5 bg-[#f8f6f3] px-6 py-12 lg:px-16 lg:py-20">
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

            {/* Welcome Back */}
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-[#2a2a2a] mb-3 tracking-tight">Bem-vindo de volta</h2>
              <p className="text-[#6b6b6b] text-sm">Entre na sua conta para continuar o planeamento</p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Google Connected State */}
              {googleConnected ? (

<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3 w-full sm:w-auto">
      {googleData.avatar && (
        <img 
          src={googleData.avatar} 
          alt="Google avatar" 
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-green-800 truncate">Conectado com Google</p>
        <p className="text-xs text-green-600 truncate">{googleData.email}</p>
      </div>
    </div>
    
    <button
      type="button"
      onClick={disconnectGoogle}
      className="text-sm text-red-600 hover:text-red-700 w-full sm:w-auto text-left sm:text-right"
    >
      Usar outra conta
    </button>
  </div>
</div>

              ) : (
                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={loading}
                  className={`w-full bg-white border-2 border-[#d4d4d4] hover:border-[#9CAF88] text-[#4a4a4a] font-medium py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-md ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                  </svg>
                  Continuar com Google
                </button>
              )}

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#d4d4d4]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#f8f6f3] text-[#6b6b6b]">ou</span>
                </div>
              </div>

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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required={!googleConnected}
                    disabled={googleConnected}
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                      googleConnected ? 'bg-gray-100 cursor-not-allowed' : ''
                    } ${
                      errors.email ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                    }`}
                  />
                </div>
                {errors.email && !googleConnected && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              {!googleConnected && (
                <div>
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required={!googleConnected}
                      className={`w-full pl-12 pr-12 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                        errors.password ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CAF88] hover:text-[#8a9d85] transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              {!googleConnected && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 border-2 border-[#9CAF88] rounded text-[#9CAF88] focus:ring-2 focus:ring-[#9CAF88] focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-[#4a4a4a]">Lembrar de mim</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-[#9CAF88] hover:text-[#8a9d85] transition-colors font-medium">
                    Esqueceu a senha
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Entrando...' : 'Entrar'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-[#6b6b6b]">
              Não tem uma conta?{' '}
              <a href="/signup" className="text-[#9CAF88] hover:text-[#8a9d85] font-medium transition-colors">
                Criar conta
              </a>
            </p>
          </div>
        </div>

        {/* Right Panel - hero image */}
        <div className="hidden lg:flex overflow-y-auto lg:w-3/5 relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${weddingBg})`
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
      Seu casamento perfeito começa aqui
    </h2>

    <p className="text-[#5a5a5a] text-sm text-center mb-8 leading-relaxed">
      Organize cada detalhe do seu grande dia com ferramentas intuitivas e encontre os melhores fornecedores da sua região.
    </p>

    <div className="space-y-3">
      {[
        'Planeamento passo a passo',
        'Marketplace de fornecedores',
        'Gestão de orçamento e convidados'
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
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.2s ease-out forwards;
          }
        `}</style>
      </div>

      {/* Account Selection Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#9CAF88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2a2a2a]">Escolha uma conta</h3>
              <p className="text-[#6b6b6b] text-sm mt-2">
                Este e-mail está associado a múltiplas contas. Selecione qual conta deseja acessar.
              </p>
            </div>

            <div className="space-y-3">
              {accountOptions.map((account, index) => (
                <button
                  key={index}
                  onClick={() => handleAccountSelect(account)}
                  className="w-full p-4 border-2 border-[#d4d4d4] rounded-xl hover:border-[#9CAF88] hover:bg-[#9CAF88]/5 transition-all duration-200 flex items-center gap-4 text-left"
                >
                  <div className="w-12 h-12 bg-[#9CAF88]/10 rounded-full flex items-center justify-center">
                    {account.type === 'user' ? (
                      <svg className="w-6 h-6 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#2a2a2a]">{account.name}{account.userType ? ` (${account.userType})` : ''}</p>
                    <p className="text-sm text-[#6b6b6b]">{account.type === 'user' ? 'Conta principal' : `Convidado por ${account.inviterName}`}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowAccountModal(false);
                setAccountOptions([]);
              }}
              className="w-full mt-4 py-3 text-[#6b6b6b] hover:text-[#4a4a4a] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}