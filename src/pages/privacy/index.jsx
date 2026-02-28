import React from 'react';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/DefaultLayout';
import { Shield, Lock, Eye, User, Database, Trash2 } from 'lucide-react';

export default function Privacy() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Shield,
      title: 'Nossa Compromisso',
      content: `O MeuCasamento está comprometido em proteger sua privacidade. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais. Ao usar nossa plataforma, você concorda com as práticas descritas nesta política.`
    },
    {
      icon: User,
      title: 'Informações que Coletamos',
      content: `Coletamos informações que você nos fornece diretamente, incluindo: nome, email, telefone, dados de pagamento, fotos e conteúdo que você upload. Também coletamos automaticamente informações de uso, como páginas visitadas, tempo gasto no site e interações com funcionalidades.`
    },
    {
      icon: Database,
      title: 'Como Usamos suas Informações',
      content: `Usamos suas informações para: fornecer e melhorar nossos serviços, personalizar sua experiência, processar transações, comunicar com você sobre sua conta e enviar notificações relevantes. Também usamos dados agregados para análises e melhoria dos serviços.`
    },
    {
      icon: Lock,
      title: 'Proteção de Dados',
      content: `Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações, incluindo criptografia SSL, firewalls e controles de acesso. Você também pode ajudar protegendo sua conta através de senhas fortes e não compartilhando suas credenciais.`
    },
    {
      icon: Eye,
      title: 'Compartilhamento de Informações',
      content: `Não vendemos suas informações pessoais. Compartilhamos dados apenas com: fornecedores de serviços que nos ajudam a operar a plataforma (sob acordos de confidencialidade), quando exigido por lei, e com seu consentimento explícito. Fornecedores têm acesso apenas ao necessário para prestação do serviço.`
    },
    {
      icon: Trash2,
      title: 'Seus Direitos',
      content: `Você tem direitos sobre seus dados: acesso, correção, exclusão, portabilidade, revogação de consentimento e oposição ao tratamento. Para exercer esses direitos, entre em contato através do email contact@meucasamento.com. Responderemos em até 30 dias.`
    }
  ];

  const cookies = [
    { type: 'Essenciais', description: 'Necessários para o funcionamento do site, como login e carrinho' },
    { type: 'Analíticos', description: 'Nos ajudam a entender como o site é usado para melhorarmos' },
    { type: 'Marketing', description: 'Usados para mostrar conteúdos relevantes e medir campanhas' }
  ];

  const updates = [
    { date: '27 de Fevereiro de 2026', description: 'Versão atual da política de privacidade' },
    { date: '15 de Janeiro de 2025', description: 'Atualização sobre armazenamento de dados e cookies' },
    { date: '01 de Março de 2024', description: 'Primeira versão da política de privacidade' }
  ];

  return (
    <DefaultLayout hero={{ 
      title: 'Política de Privacidade', 
      subtitle: 'Sua privacidade é importante para nós',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop'
    }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-gray-600 text-lg">
            Esta Política de Privacidade descreve como o MeuCasamento coleta, usa e protege suas informações pessoais.
          </p>
          <p className="text-gray-500 mt-2">
            Última atualização: 27 de Fevereiro de 2026
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-8 shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#9CAA8E]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="w-6 h-6 text-[#9CAA8E]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cookies Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Cookies e Tecnologias Semelhantes</h2>
          <p className="text-gray-600 mb-6">
            Usamos cookies e tecnologias semelhantes para melhorar sua experiência. Você pode controlar cookies através das configurações do seu navegador.
          </p>
          <div className="space-y-4">
            {cookies.map((cookie, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-[#9CAA8E] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">{cookie.type}</h3>
                  <p className="text-sm text-gray-600">{cookie.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Proteção de Menores</h2>
          <p className="text-gray-600 leading-relaxed">
            Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se você acredita que coletamos dados de uma criança sem consentimento dos pais, entre em contato imediatamente e removeremos tais informações.
          </p>
        </div>

        {/* International Transfer */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transferência Internacional</h2>
          <p className="text-gray-600 leading-relaxed">
            Suas informações podem ser transferidas e armazenadas em servidores fora de seu país. Quando isso ocorre, garantimos que os dados sejam protegidos pelas mesmas medidas de segurança aplicadas em Moçambique, incluindo cláusulas contratuais padrãoapproved pela legislação aplicável.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] rounded-2xl p-8 text-white mb-12">
          <h2 className="text-xl font-bold mb-4">Dúvidas?</h2>
          <p className="text-white/90 mb-6">
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato conosco.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 bg-white text-[#9CAA8E] rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Fale Conosco
          </a>
        </div>

        {/* Updates History */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Histórico de Atualizações</h2>
          <div className="space-y-4">
            {updates.map((update, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 border-l-2 border-[#9CAA8E]">
                <span className="text-sm text-gray-500 whitespace-nowrap">{update.date}</span>
                <p className="text-gray-700">{update.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
