import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/DefaultLayout';
import { MessageCircle, Mail, Phone, Clock, ChevronRight, Search, HelpCircle, FileText, Users, Shield } from 'lucide-react';
import { toast } from '../../lib/toast';
import { submitContactForm } from '../../api/client';

export default function Support() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const helpTopics = [
    { 
      icon: HelpCircle, 
      title: 'Central de Ajuda', 
      description: 'Encontre respostas para as perguntas mais frequentes',
      link: '#faq'
    },
    { 
      icon: FileText, 
      title: 'Guias e Tutoriais', 
      description: 'Aprenda a usar todas as funcionalidades da plataforma',
      link: '#guides'
    },
    { 
      icon: Users, 
      title: 'Comunidade', 
      description: 'Conecte-se com outros casais e fornecedores',
      link: '#community'
    },
    { 
      icon: Shield, 
      title: 'Segurança', 
      description: 'Saiba como protegemos seus dados',
      link: '#security'
    }
  ];

  const faqs = [
    { q: 'Como funciona o controle de orçamento?', a: 'Nossa ferramenta de orçamento permite definir um valor total e rastrear todos os gastos. Você pode categorizar despesas, definir limites e receber alertas quando estiver próximo do orçamento.' },
    { q: 'Como posso adicionar fornecedores aos favoritos?', a: 'Na página de fornecedores, clique no ícone de coração em qualquer cartão de fornecedor. Você pode acessar todos os fornecedores salvos na sua área administrativa.' },
    { q: 'Como funciona a lista de convidados?', a: 'Você pode adicionar convidados, organizar mesas, categorizar grupos e enviar convites online. Os convidados podem confirmar presença diretamente pelo site.' },
    { q: 'Posso personalizar o site do casamento?', a: 'Sim! Você pode escolher entre vários temas, adicionar fotos, informações sobre o casal, lista de presentes, e muito mais. Acesse sua área administrativa para customizar.' },
    { q: 'Como recebo as confirmações dos convidados?', a: 'Os convidados podem confirmar presença através do link do site do casamento. Você verá todas as confirmações em tempo real na sua área administrativa.' },
    { q: 'É seguro usar a plataforma?', a: 'Sim! Utilizamos criptografia de dados e seguimos as melhores práticas de segurança. Seus dados e informações de pagamento estão protegidos.' }
  ];

  const handleSubmitContact = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSending(true);
    try {
      const response = await submitContactForm({
        ...contactForm,
        subject: contactForm.subject || 'support'
      });
      if (response.data.success) {
        toast.success('Mensagem enviada! Retornaremos em breve.');
        setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(response.data.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Error sending support form:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <DefaultLayout hero={{ 
      title: 'Centro de Suporte', 
      subtitle: 'Estamos aqui para ajudar você a planejar o casamento perfeito',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12 hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por perguntas ou palavras-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
            />
          </div>
        </div>

        {/* Help Topics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16 hidden">
          {helpTopics.map((topic, idx) => (
            <a
              key={idx}
              href={topic.link}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#9CAA8E] transition-colors">
                <topic.icon className="w-6 h-6 text-[#9CAA8E] group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </a>
          ))}
        </div>

        {/* FAQ Section */}
        <div id="faq" className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Perguntas Frequentes</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {filteredFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
          
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum resultado encontrado para "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Ainda precisa de ajuda?</h2>
              <p className="text-white/90">Preencha o formulário abaixo e nossa equipe retornará em breve</p>
            </div>
            
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4">
                  <Mail className="w-8 h-8 text-[#9CAA8E] mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">contact@meucasamento.com</p>
                </div>
                <div className="text-center p-4">
                  <Phone className="w-8 h-8 text-[#9CAA8E] mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Telefone</p>
                  <p className="text-sm text-gray-600">+258 84 123 4567</p>
                </div>
                <div className="text-center p-4">
                  <Clock className="w-8 h-8 text-[#9CAA8E] mx-auto mb-2" />
                  <p className="font-medium text-gray-900">Horário</p>
                  <p className="text-sm text-gray-600">Seg-Sex: 8h-18h</p>
                </div>
              </div>

              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                      placeholder="+258 84 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assunto (opcional)</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900"
                      placeholder="Sobre o que você quer falar?"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#9CAA8E] text-gray-900 resize-none"
                    placeholder="Como podemos ajudar?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {sending ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
