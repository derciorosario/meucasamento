import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../../layout/DefaultLayout';
import { Check, Star, Users, TrendingUp, Shield, Headphones, ChevronRight } from 'lucide-react';

export default function VendorPlans() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Básico',
      price: 'Grátis',
      description: 'Perfeito para começar',
      features: [
        'Perfil básico do fornecedor',
        'Até 5 fotos na galeria',
        'Listagem no diretório',
        'Avaliações básicas',
        'Suporte por email'
      ],
      cta: 'Começar Grátis',
      popular: false
    },
    {
      name: 'Profissional',
      price: '2.500 MT/mês',
      description: 'Para fornecedores em crescimento',
      features: [
        'Perfil premium com banner',
        'Galeria ilimitada de fotos',
        'Destaque no diretório',
        'Respostas a avaliações',
        'Estatísticas detalhadas',
        '优先Suporte prioritário',
        'Badge "Verificado"'
      ],
      cta: 'Escolher Profissional',
      popular: true
    },
    {
      name: 'Empresarial',
      price: '5.000 MT/mês',
      description: 'Solução completa para negócios',
      features: [
        'Tudo do Profissional',
        'Logo na homepage',
        'Posição topo nos resultados',
        'Campanhas de marketing',
        'API de integração',
        'Gerente de conta dedicado',
        'Relatórios avançados'
      ],
      cta: 'Falar com Consultor',
      popular: false
    }
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Aumente sua visibilidade', description: 'Chegue a milhares de casais que buscam fornecedores diariamente' },
    { icon: Users, title: 'Novos clientes', description: 'Receba pedidos de orçamento diretamente na sua área administrativa' },
    { icon: Shield, title: 'Construa confiança', description: 'Avaliações verificadas ajudam a conquistar a confiança dos clientes' },
    { icon: Headphones, title: 'Suporte dedicado', description: 'Nossa equipe está sempre pronta para ajudar você a crescer' }
  ];

  return (
    <DefaultLayout hero={{ 
      title: 'Planos para Fornecedores', 
      subtitle: 'Escolha o plano ideal para impulsionar seu negócio',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-[#9CAA8E]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] text-white text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-[#9CAA8E] mb-2">{plan.price}</div>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => navigate('/signup?as=vendor')}
                  className={`w-full py-3 rounded-xl font-medium transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] text-white hover:shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que anunciar conosco?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Somos a plataforma líder de casamentos em Moçambique, conectando fornecedores a milhares de casais todos os dias.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="text-center p-6">
              <div className="w-14 h-14 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-7 h-7 text-[#9CAA8E]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            {[
              { q: 'Posso mudar de plano depois?', a: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças serão aplicadas no próximo ciclo de cobrança.' },
              { q: 'Como recebo os pedidos de orçamento?', a: 'Você receberá notificações por email e através da sua área administrativa na plataforma. Todos os pedidos incluem os dados de contato do cliente.' },
              { q: 'O plano gratuito tem limitações?', a: 'O plano gratuito inclui funcionalidades básicas. Para ter maior visibilidade e acesso a todas as funcionalidades, recomendamos os planos pagos.' },
              { q: 'Como funciona o período de teste?', a: 'Oferecemos 14 dias de teste gratuito do plano Profissional para novos fornecedores. Você pode cancelar a qualquer momento durante este período.' }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
          <p className="text-gray-600 mb-8">Junte-se a centenas de fornecedores que já cresceram seus negócios conosco</p>
          <button 
            onClick={() => navigate('/signup?as=vendor')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] text-white rounded-full font-medium hover:shadow-lg transition-all"
          >
            Criar conta gratuita
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
}
