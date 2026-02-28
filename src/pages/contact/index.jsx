import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/DefaultLayout';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';
import { toast } from '../../lib/toast';
import { submitContactForm } from '../../api/client';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSending(true);
    try {
      const response = await submitContactForm(formData);
      if (response.data.success) {
        toast.success('Mensagem enviada! Retornaremos em breve.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(response.data.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    { icon: Mail, title: 'Email', content: 'contact@meucasamento.com', description: 'Respondemos em até 24h' },
    { icon: Phone, title: 'Telefone', content: '+258 84 123 4567', description: 'Seg-Sex: 8h-18h' },
    { icon: MapPin, title: 'Endereço', content: 'Maputo, Moçambique', description: 'Av. Julius Nyerere, 1234' },
    { icon: Clock, title: 'Horário', content: 'Segunda a Sexta', description: '8h00 - 18h00' }
  ];

  return (
    <DefaultLayout hero={{ 
      title: 'Fale Conosco', 
      subtitle: 'Estamos aqui para ajudar. Entre em contato!',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Contact Info */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <info.icon className="w-7 h-7 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
              <p className="text-[#9CAA8E] font-medium">{info.content}</p>
              <p className="text-sm text-gray-500 mt-1">{info.description}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                    placeholder="+258 84 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900 appearance-none cursor-pointer"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="general">Geral</option>
                    <option value="support">Suporte Técnico</option>
                    <option value="partnership">Parcerias</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900 resize-none"
                  placeholder="Como podemos ajudar?"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  'Enviando...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Mensagem
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Additional Info */}
          <div>
            <div className="bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] rounded-2xl p-8 text-white mb-6">
              <h2 className="text-2xl font-bold mb-4">Outros canais de atendimento</h2>
              <p className="text-white/90 mb-6">
                Além do formulário, você também pode nos encontrar nas redes sociais ou através dos canais abaixo.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Perguntas frequentes</h2>
              <div className="space-y-4">
                {[
                  { q: 'Qual o tempo de resposta?', a: 'Respondemos em até 24 horas úteis.' },
                  { q: 'Atendem aos fins de semana?', a: 'No momento, nosso atendimento é de Segunda a Sexta.' },
                  { q: 'Vocês fazem eventos presenciais?', a: 'Somos uma plataforma digital, mas trabalhamos com fornecedores em todo o país.' }
                ].map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-4 last:border-0">
                    <h3 className="font-medium text-gray-900">{faq.q}</h3>
                    <p className="text-sm text-gray-600 mt-1">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
