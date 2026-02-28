import React from 'react';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/DefaultLayout';
import { Heart, Users, Star, Award, Target, Lightbulb, Sparkles } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const stats = [
    { value: '+10.000', label: 'Casais atendidos' },
    { value: '+2.000', label: 'Fornecedores parceiros' },
    { value: '4.9', label: 'Avaliação média' },
    { value: '98%', label: 'Satisfação' }
  ];

  const values = [
    { icon: Heart, title: 'Paixão', description: 'Acreditamos que cada casamento é único e merece ser celebrado de forma especial' },
    { icon: Target, title: 'Missão', description: 'Simplificar o planejamento de casamentos para que os casais possam aproveitar cada momento' },
    { icon: Lightbulb, title: 'Inovação', description: 'Constantemente buscamos novas formas de tornar a experiência ainda melhor' },
    { icon: Sparkles, title: 'Qualidade', description: 'Trabalhamos apenas com fornecedores verificados e de confiança' }
  ];

  const team = [
    { name: 'João Mucacho', role: 'Fundador & CEO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
    { name: 'Ana Mucacho', role: 'Co-fundadora', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop' },
    { name: 'Pedro Santos', role: 'Diretor de Tecnologia', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
    { name: 'Maria José', role: 'Diretora de Operações', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' }
  ];

  const timeline = [
    { year: '2020', title: 'O Início', description: 'Tudo começou com uma ideia de facilitar o planejamento de casamentos em Moçambique' },
    { year: '2021', title: 'Crescimento', description: 'Alcançamos 1.000 casais atendidos e expandimos para todo o país' },
    { year: '2022', title: 'Expansão', description: 'Lançamos o programa de fornecedores parceiros e atingimos 500 fornecedores' },
    { year: '2023', title: 'Liderança', description: 'Tornamo-nos a plataforma líder de casamentos em Moçambique' },
    { year: '2024', title: 'Inovação', description: 'Introduzimos novas funcionalidades e inteligência artificial para melhorar a experiência' }
  ];

  return (
    <DefaultLayout hero={{ 
      title: 'Sobre Nós', 
      subtitle: 'Ajudando casais a realizar o casamento dos sonhos',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Nossa História
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            O MeuCasamento foi criado com o objetivo de tornar o planejamento de casamentos mais simples, acessível e memorável para casais Moçambicanos.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl font-bold text-[#9CAA8E] mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h2>
            <p className="text-gray-600">
              Democratizar o acesso a ferramentas de planejamento de casamentos de qualidade, conectando casais a fornecedores confiáveis e simplificando cada etapa do processo.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h2>
            <p className="text-gray-600">
              Ser a plataforma referência em planejamento de casamentos em África, reconhecida pela qualidade dos serviços e pela felicidade dos casais atendidos.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossos Valores</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="w-14 h-14 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-[#9CAA8E]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossa Jornada</h2>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-[#9CAA8E]/20"></div>
            <div className="space-y-8">
              {timeline.map((item, idx) => (
                <div key={idx} className={`flex items-center ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 pr-8 text-right">
                    <div className="bg-white rounded-xl p-6 shadow-md inline-block">
                      <span className="text-[#9CAA8E] font-bold text-lg">{item.year}</span>
                      <h3 className="font-semibold text-gray-900 mt-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-[#9CAA8E] rounded-full flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="w-1/2 pl-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16 hidden">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nossa Equipa</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Faça parte da nossa história</h2>
          <p className="text-gray-600 mb-8">Junte-se a milhares de casais e fornecedores que confiam em nós</p>
          <div className="flex justify-center gap-4">
            <a 
              href="/signup" 
              className="px-8 py-3 bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] text-white rounded-full font-medium hover:shadow-lg transition-all"
            >
              Criar conta
            </a>
            <a 
              href="/vendors" 
              className="px-8 py-3 border-2 border-[#9CAA8E] text-[#9CAA8E] rounded-full font-medium hover:bg-[#9CAA8E] hover:text-white transition-all"
            >
              Ver Fornecedores
            </a>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
