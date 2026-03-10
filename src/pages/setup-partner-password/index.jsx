import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyInvitation, setupPartnerPassword } from '../../api/client';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import { Eye, EyeOff, Lock, User, CheckCircle, XCircle, Loader } from 'lucide-react';

const SetupPartnerPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitationData, setInvitationData] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await verifyInvitation(token);
        if (response.data.success) {
          setInvitationData(response.data);
        }
      } catch (error) {
        console.error('Error verifying invitation:', error);
        toast.error('Convite inválido ou expirado');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const validatePassword = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'A senha deve conter pelo menos um número';
    } else if (!/[a-zA-Z]/.test(password)) {
      newErrors.password = 'A senha deve conter pelo menos uma letra';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) return;

    setSubmitting(true);
    try {
      const response = await setupPartnerPassword({
        token,
        password,
      });

      if (response.data.success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error setting up password:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao criar conta');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-[#9CAA8E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-[#9CAA8E]" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-black">
              Bem-vindo!
            </h1>
            <p className="text-gray-500 mt-2">
              Você foi convidado(a) por <strong>{invitationData?.inviterName}</strong> para acessar o casamento no Meu Casamento.
            </p>
          </div>

          {/* Partner Info */}
          {invitationData && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Parceiro(a):</span> {invitationData.partnerName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {invitationData.email}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Criar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a sua senha"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent text-black text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-2">A senha deve conter:</p>
              <div className="space-y-1">
                <div className={`flex items-center gap-2 text-xs ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                  {password.length >= 8 ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Pelo menos 8 caracteres
                </div>
                <div className={`flex items-center gap-2 text-xs ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {/\d/.test(password) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Pelo menos um número
                </div>
                <div className={`flex items-center gap-2 text-xs ${/[a-zA-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                  {/[a-zA-Z]/.test(password) ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  Pelo menos uma letra
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#9CAA8E] text-white font-medium rounded-xl hover:bg-[#8A9A7E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  A criar conta...
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem uma conta?{' '}
            <a href="/login" className="text-[#9CAA8E] hover:text-[#8A9A7E] font-medium">
              Fazer login
            </a>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-black mb-2">
                Conta Criada com Sucesso!
              </h2>
              <p className="text-gray-600">
                A sua conta de parceiro(a) foi criada com sucesso. Agora pode fazer login para aceder ao casamento.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#9CAA8E]/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#9CAA8E]" />
                </div>
                <div>
                  <p className="font-medium text-black">{invitationData?.partnerName}</p>
                  <p className="text-sm text-gray-500">{invitationData?.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Próximos Passos</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Use o email e a senha que criou para fazer login. Após o login, você terá acesso ao perfil do casamento ao lado do seu parceiro.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-[#9CAA8E] text-white font-medium rounded-xl hover:bg-[#8A9A7E] transition-colors"
            >
              Ir para Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupPartnerPassword;
