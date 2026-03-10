import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from '../../lib/toast';
import client from '../../api/client';
import COUNTRIES from '../../constants/countries';

// Email validation function
const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(v || "").toLowerCase());

// Password strength validation
const validatePassword = (password) => {
  if (!password) return "Senha é obrigatória";
  if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
  if (!/(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+/.test(password)) {
    return "Crie uma senha forte com uma mistura de letras, números e símbolos";
  }
  return "";
};

// Phone validation
const validatePhone = (phone) => {
  if (!phone) return "Telefone é obrigatório";
  const phoneDigits = String(phone).replace(/\D/g, "");
  if (phoneDigits.length < 6) return "Por favor, insira um número de telefone válido";
  if (phoneDigits.length > 15) return "Número de telefone muito longo";
  if (!/^\+?[\d\s\-\(\)]+$/.test(phone)) return "Por favor, insira um formato de telefone válido";
  return "";
};

export default function VendorSignUp() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // User info
    name: '',
    email: '',
    password: '',
    phone: '',
    country: 'Moçambique',
    city: '',
    // Company info
    companyName: '',
    category: '',
    description: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    city: '',
    companyName: '',
    category: '',
    description: '',
    terms: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  
  // Country options with Portuguese labels
  const countryOptions = COUNTRIES.map(country => ({
    value: country.pt,
    label: country.pt,
  }));
  
  // Cities state for dynamic filtering
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await client.get('/vendors/categories');
        if (response.data) {
          setCategories(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);
  
  // Load cities based on selected country
  const loadCities = async (countryName) => {
    if (!countryName) {
      setCities([]);
      return;
    }
    
    setLoadingCities(true);
    try {
      const response = await fetch('/data/cities.json');
      const allCities = await response.json();
      
      // Find country code from COUNTRIES constant
      const country = COUNTRIES.find(c => c.pt === countryName || c.en === countryName);
      
      if (country) {
        // Filter cities by country - using English name for matching
        const filteredCities = allCities
          .filter(city => city.country === country.en)
          .map(city => city.city);
        
        // Remove duplicates and sort
        const uniqueCities = [...new Set(filteredCities)].sort();
        setCities(uniqueCities);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };
  
  // Load cities when country changes
  useEffect(() => {
    if (formData.country) {
      loadCities(formData.country);
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Special handling for phone input
    if (name === 'phone') {
      // Allow only one "+" and it should be at the beginning, no spaces allowed
      const cleaned = value.replace(/[^+\d\-\(\)]/g, '');
      const plusCount = (cleaned.match(/\+/g) || []).length;
      if (plusCount > 1) {
        // If more than one +, remove all + and add one at the beginning
        const withoutPlus = cleaned.replace(/\+/g, '');
        setFormData(prev => ({ ...prev, [name]: '+' + withoutPlus }));
      } else {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      }
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      phone: '',
      country: '',
      city: '',
      companyName: '',
      category: '',
      description: '',
      terms: ''
    };

    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
      isValid = false;
    } else if (!emailOK(formData.email)) {
      newErrors.email = 'Por favor, insira um e-mail válido';
      isValid = false;
    }

    // Password validation (only for non-Google users)
    if (!googleConnected) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
        isValid = false;
      }
    }

    // Phone validation
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
      isValid = false;
    }

    // Company country validation
    if (!formData.country) {
      newErrors.country = 'País é obrigatório';
      isValid = false;
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
      isValid = false;
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nome da empresa é obrigatório';
      isValid = false;
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
      isValid = false;
    }

    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = 'Você precisa aceitar os termos de uso para continuar';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Google OAuth - connect Google account but don't submit yet
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

        // Clear any previous errors
        setErrors({
          name: '',
          email: '',
          password: '',
          phone: '',
          country: '',
          city: '',
          companyName: '',
          category: '',
          description: '',
          terms: ''
        });

        // Populate form with Google data
        setFormData(prev => ({
          ...prev,
          name: name || '',
          email: email || '',
          googleId: googleId || '',
          avatar: picture || ''
        }));

        setGoogleConnected(true);
        
        // Clear password field since Google users don't need password
        setFormData(prev => ({ ...prev, password: '' }));
        
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
    setFormData(prev => ({
      ...prev,
      name: '',
      email: '',
      googleId: '',
      avatar: ''
    }));
    setGoogleConnected(false);
    
    // Clear errors
    setErrors(prev => ({
      ...prev,
      name: '',
      email: '',
      password: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os campos destacados.');
      return;
    }

    setLoading(true);

    try {
      // Prepare the data for API
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        userType: 'vendor',
        googleId: formData.googleId || '',
        avatar: formData.avatar || '',
        // Vendor data
        vendorData: {
          companyName: formData.companyName,
          category: formData.category,
          description: formData.description,
        }
      };

      const response = await client.post('/auth/register', submitData);

      if (googleConnected && response.data.data.accessToken) {
        // Google users get tokens immediately
        localStorage.setItem('accessToken', response.data.data.accessToken);
      }
      
      if (googleConnected) {
        // Google users are already verified, go to home
        toast.success('Conta criada com sucesso!');
        window.location.href = "/"
      } else {
        // Email users need to verify
        toast.success('Conta criada! Verifique seu e-mail.');
        navigate(`/email-verification-sent?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-[100vh] flex flex-col lg:flex-row-reverse font-serif bg-[#f8f6f3]">
        {/* Right Panel - Sign Up Form */}
        <div className="w-full h-[100vh] overflow-y-auto lg:w-2/5 bg-[#f8f6f3] px-6 py-8 lg:px-12 lg:py-12">
          <div className="max-w-md mx-auto w-full">
            {/* Title */}
            <div className="mb-8">
              <div onClick={() => navigate('/')} className="flex items-center gap-3 mb-4 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#9CAF88] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-[#3a3a3a] tracking-tight">Meu casamento</h1>
              </div>
              <p className="text-[#6b6b6b] text-sm">Encontre os melhores fornecedores</p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2a2a2a] mb-2 tracking-tight">Criar conta de fornecedor</h2>
              <p className="text-[#6b6b6b] text-sm">Anuncie os seus serviços e conquiste novos clientes</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Google Sign In / Connected State */}
              {googleConnected ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {formData.avatar && (
                        <img 
                          src={formData.avatar} 
                          alt="Google avatar" 
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-green-800">{formData.name}</p>
                        <p className="text-xs text-green-600">{formData.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={disconnectGoogle}
                      className="text-xs text-red-600 hover:text-red-700 underline"
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
                  className={`w-full bg-white border-2 border-[#d4d4d4] hover:border-[#9CAF88] text-[#4a4a4a] font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-md ${
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#d4d4d4]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#f8f6f3] text-[#6b6b6b]">ou</span>
                </div>
              </div>

              {/* User Info Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#4a4a4a] mb-3">Informações Pessoais</h3>
                
                {/* Name field */}
                 <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Nome</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                      errors.name ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email field */}
                {!googleConnected && <div className="mb-4">
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
                      required
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                        errors.email ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>}

                {/* Password - Only show when NOT using Google */}
                {!googleConnected && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength={8}
                        className={`w-full px-4 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
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
                    {formData.password && !errors.password && /(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+/.test(formData.password) ? (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        <p className="text-xs">Senha validada</p>
                      </div>
                    ) : !errors.password ? (
                      <p className="text-xs text-gray-500 my-2">Crie uma senha forte com uma mistura de letras, números e símbolos.</p>
                    ) : null}
                  </div>
                )}

                {/* Phone */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                      errors.phone ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>

                {/* Country and City */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4a4a4a] mb-2">País</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-4  py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] transition-all appearance-none cursor-pointer ${
                        errors.country ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                      }`}
                    >
                      <option value="">Selecionar</option>
                      {countryOptions.map((country) => (
                        <option key={country.value} value={country.value}>{country.label}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-xs text-red-600">{errors.country}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Cidade</label>
                    {loadingCities ? (
                      <div className="w-full px-4 py-3 border border-[#d4d4d4] rounded-lg bg-white text-[#2a2a2a]">
                        Carregando...
                      </div>
                    ) : cities.length > 0 ? (
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] transition-all appearance-none cursor-pointer ${
                          errors.city ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                        }`}
                      >
                        <option value="">Selecionar</option>
                        {cities.map((city, index) => (
                          <option key={index} value={city}>{city}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Sua cidade"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                          errors.city ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                        }`}
                      />
                    )}
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Info Section */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-[#4a4a4a] mb-3">Informações da Empresa</h3>
                
                {/* Company Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: Foto & Vídeos LM"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                      errors.companyName ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                    }`}
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
                  )}
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Categoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] transition-all appearance-none cursor-pointer ${
                      errors.category ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                    }`}
                  >
                    <option value="">Selecionar categoria</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#4a4a4a] mb-2">Descrição</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descreva os seus serviços..."
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:border-transparent bg-white text-[#2a2a2a] placeholder-[#a8a8a8] transition-all ${
                      errors.description ? 'border-red-400 ring-red-400' : 'border-[#d4d4d4]'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                  className={`mt-1 w-4 h-4 border-2 rounded text-[#9CAF88] focus:ring-2 focus:ring-[#9CAF88] focus:ring-offset-0 cursor-pointer ${
                    errors.terms ? 'border-red-400 ring-red-400' : 'border-[#9CAF88]'
                  }`}
                />
                <label className="text-sm text-[#6b6b6b] leading-relaxed">
                  Aceito os{' '}
                  <a target="_blank" href="/terms" className="text-[#9CAF88] hover:text-[#8a9d85] font-medium transition-colors underline">
                    Termos de Uso
                  </a>
                  {' '}e a{' '}
                  <a target="_blank" href="/privacy" className="text-[#9CAF88] hover:text-[#8a9d85] font-medium transition-colors underline">
                    Política de Privacidade
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-600 mt-1">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-[#9CAF88] hover:bg-[#8a9d85] text-white font-medium py-3.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-sm text-[#6b6b6b]">
              Já tem uma conta?{' '}
              <a href="/login" className="text-[#9CAF88] hover:text-[#8a9d85] font-medium transition-colors">
                Fazer login
              </a>
            </p>
          </div>
        </div>

        {/* Left Panel - Hero Image */}
        <div className="max-md:hidden flex lg:w-3/5 relative overflow-hidden">
          <div 
            className="absolute bg_vendor_1 inset-0 bg-cover bg-center"
            style={{
              backgroundImage_: `url('https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=2070&auto=format&fit=crop')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-end w-full p-12 pb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-white mb-5 leading-tight drop-shadow-2xl">
                Alcance mais clientes
              </h2>
              <p className="text-lg text-white/95 leading-relaxed drop-shadow-lg mb-6">
                Anuncie os seus serviços de casamento na maior plataforma de casamentos de Moçambique
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#9CAF88] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white">Perfil completo com galeria de fotos</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#9CAF88] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white">Receba pedidos de orçamento por email</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#9CAF88] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white">Avaliações e ratings de clientes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>

      </div>
    </GoogleOAuthProvider>
  );
}
