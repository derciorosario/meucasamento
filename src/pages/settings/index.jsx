import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/DefaultLayout';
import { 
  User, Lock, Bell, Globe, Trash2, 
  Loader2, Check, ChevronRight, AlertTriangle,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { getSettings, updateSettings, changePassword, deleteAccount } from '../../api/client';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../api/client';

const SettingsPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    budget: true,
    checklist: true,
    guests: true,
    vendors: true
  });
  
  // Language state
  const [language, setLanguage] = useState('pt');
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await getSettings();
      const settings = response.data;
      setLanguage(settings.language || 'pt');
      setNotifications(settings.notifications || {
        email: true,
        push: true,
        budget: true,
        checklist: true,
        guests: true,
        vendors: true
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateSettings({ notifications });
      toast.success('Notificações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error('Erro ao guardar notificações');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      await updateSettings({ language });
      toast.success('Idioma atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving language:', error);
      toast.error('Erro ao guardar idioma');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('As passwords não coincidem');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('A password deve ter pelo menos 8 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Erro ao alterar password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount({ password: deletePassword });
      toast.success('Conta eliminada com sucesso');
      // Redirect to home or login
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Erro ao eliminar conta');
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    //{ id: 'language', label: 'Idioma', icon: Globe },
    { id: 'account', label: 'Conta', icon: Trash2 }
  ];

  if (loading) {
    return (
      <DefaultLayout hero={{ title: "Configurações", subtitle: "Gerencie as suas configurações" }}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout hero={{ 
      title: "Configurações", 
      subtitle: "Gerencie as suas configurações de conta",
      image: "https://images.unsplash.com/photo-1519167758481-83f29da8c1e8?w=1200&h=400&fit=crop"
    }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Perfil</h2>
            
            {/* Profile Info Display */}
            <div className="flex items-center gap-6 mb-6">
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-primary-100">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Nome</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Tipo de Conta</p>
                <p className="font-medium text-gray-900 capitalize">{user?.role || 'Utilizador'}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6 text-center">
              Para alterar o seu perfil, aceda à página de perfil.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="mt-3 w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Editar Perfil
            </button>
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Alterar Password</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full text-gray-700 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>

              <div>
                <label className="block  text-sm font-medium text-gray-700 mb-2">Nova Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full text-gray-700 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full text-gray-700 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={changingPassword}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Alterar Password
                  </>
                )}
              </motion.button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Esqueceu a sua password?</p>
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
              >
                Recuperar Password
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferências de Notificações</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Notificações por Email</p>
                  <p className="text-sm text-gray-500">Receba notificações no seu email</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notifications.email ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.email ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Notificações Push</p>
                  <p className="text-sm text-gray-500">Receba notificações no navegador</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    notifications.push ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.push ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">Notificações por funcionalidade</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">💰 Orçamento</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, budget: !notifications.budget })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        notifications.budget ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.budget ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">✅ Checklist</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, checklist: !notifications.checklist })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        notifications.checklist ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.checklist ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">👥 Convidados</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, guests: !notifications.guests })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        notifications.guests ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.guests ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">🏪 Fornecedores</span>
                    <button
                      onClick={() => setNotifications({ ...notifications, vendors: !notifications.vendors })}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        notifications.vendors ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.vendors ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveNotifications}
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Notificações
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Idioma</h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setLanguage('pt')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  language === 'pt'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🇲🇿</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Português</p>
                    <p className="text-sm text-gray-500">Idioma padrão</p>
                  </div>
                </div>
                {language === 'pt' && (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                  language === 'en'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🇬🇧</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">English</p>
                    <p className="text-sm text-gray-500">English language</p>
                  </div>
                </div>
                {language === 'en' && (
                  <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveLanguage}
                disabled={saving}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Idioma
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Gerir Conta</h2>
            
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Eliminar Conta</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Ao eliminar a sua conta, todos os dados serão removidos permanentemente. 
                    Esta ação não pode ser desfeita.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Conta
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Digite a sua password para confirmar"
                        className="w-full text-gray-800 px-4 py-2 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeletePassword('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleting || !deletePassword}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Confirmar Eliminação
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default SettingsPage;
