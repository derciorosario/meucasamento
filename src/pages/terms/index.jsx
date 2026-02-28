import React from 'react';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/DefaultLayout';
import { Scale, FileText, Users, Heart, CreditCard, Shield, AlertCircle } from 'lucide-react';

export default function Terms() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: Scale,
      title: 'Aceitação dos Termos',
      content: `Ao acessar e usar o MeuCasamento, você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma. Estes termos constituem um acordo legal entre você e o MeuCasamento.`
    },
    {
      icon: FileText,
      title: 'Descrição do Serviço',
      content: `O MeuCasamento é uma plataforma online que permite aos usuários planejar e organizar casamentos, encontrar fornecedores de serviços para casamento, criar listas de convidados, gerenciar orçamentos e compartilhar fotos e memórias. Oferecemos tanto serviços gratuitos quanto premium.`
    },
    {
      icon: Users,
      title: 'Cadastro de Conta',
      content: `Para usar nossos serviços, você deve criar uma conta. Você é responsável por fornecer informações precisas e atualizadas, manter a confidencialidade de sua senha e conta, e por todas as atividades que ocorrem em sua conta. Você deve ter pelo menos 18 anos para criar uma conta.`
    },
    {
      icon: Heart,
      title: 'Conteúdo do Usuário',
      content: `Você pode publicar fotos, textos e outros materiais na plataforma ("Conteúdo do Usuário"). Você mantém a propriedade do seu conteúdo, mas nos concede licença para usá-lo para operar e melhorar nossos serviços. Você é responsável por garantir que tem direitos sobre o conteúdo que publica.`
    },
    {
      icon: CreditCard,
      title: 'Pagamentos e Assinaturas',
      content: `Alguns de nossos serviços são pagos. Os preços incluem todos os impostos aplicáveis. Você concorda em pagar todas as taxas associadas aos serviços premium. As assinaturas renovam automaticamente até que sejam canceladas.`
    },
    {
      icon: Shield,
      title: 'Conduta do Usuário',
      content: `Você concorda em não usar nossos serviços para: publicar conteúdo ilegal, difamatório ou ofensivo; harassment ou prejudica outros usuários; violar direitos de terceiros; ou intentar atividades fraudulentas. Reservamo-nos o direito de remover conteúdo e suspender contas que violem estas regras.`
    },
    {
      icon: AlertCircle,
      title: 'Isenção de Garantias',
      content: `Nuestros serviços são fornecidos "como estão" sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que nossos serviços serão sempre seguros, sem erros ou disponíveis.`
    },
    {
      icon: Scale,
      title: 'Limitação de Responsabilidade',
      content: `O MeuCasamento não será responsável por danos indiretos, incidentais, especiais ou consequenciaisresultantes do uso ou incapacidade de usar nossos serviços. Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.`
    }
  ];

  const userTypes = [
    { type: 'Noivos', description: 'Usuários que estão planejando seu casamento' },
    { type: 'Fornecedores', description: 'Profissionais e empresas que oferecem serviços para casamentos' },
    { type: 'Convidados', description: 'Pessoas convidadas para participar do casamento' },
    { type: 'Planejadores', description: 'Profissionais de planejamento de casamentos' }
  ];

  return (
    <DefaultLayout hero={{ 
      title: 'Termos de Uso', 
      subtitle: 'Conheça as regras para uso da plataforma',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=400&fit=crop'
    }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <p className="text-gray-600 text-lg">
            Estes Termos de Uso regem o relacionamento entre você e o MeuCasamento.
          </p>
          <p className="text-gray-500 mt-2">
            Última atualização: 27 de Fevereiro de 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] rounded-2xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Bem-vindo ao MeuCasamento</h2>
          <p className="text-white/90 leading-relaxed">
            Estes Termos de Uso estabelecem as condições para o uso da plataforma MeuCasamento. 
            Ao usar nossos serviços, você concorda com estes termos. Por favor, leia-os com atenção 
            antes de criar uma conta.
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

        {/* User Types */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Tipos de Usuários</h2>
          <p className="text-gray-600 mb-6">
            Nossa plataforma atende diferentes tipos de usuários, cada um com suas específicas funcionalidades:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTypes.map((user, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-2 h-2 bg-[#9CAA8E] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.type}</h3>
                  <p className="text-sm text-gray-600">{user.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prohibited Activities */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Atividades Proibidas</h2>
          <p className="text-gray-600 mb-6">
            É proibido usar a plataforma para:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✕</span>
              <span>Publicar conteúdo ilegal, difamatório, obsceno ou ofensivo</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✕</span>
              <span>Assediar, ameaçar ou prejudicar outros usuários</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✕</span>
              <span>Violar direitos de propriedade intelectual de terceiros</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✕</span>
              <span>Realizar atividades fraudulentas ou enganosas</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✕</span>
              <span>Tentar acessar sistemas ou dados não autorizados</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-500 mt-1">✕</span>
              <span>Spam ou mensagens não solicitadas</span>
            </li>
          </ul>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rescisão</h2>
          <p className="text-gray-600 leading-relaxed">
            Podemos rescindir ou suspender sua conta a qualquer tempo, sem aviso prévio, se você 
            violar estes Termos de Uso ou por qualquer outra razão a nosso critério. Após a rescisão, 
            você não terá mais acesso à sua conta e todo o seu conteúdo poderá ser excluído.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alterações nos Termos</h2>
          <p className="text-gray-600 leading-relaxed">
            Podemos modificar estes Termos de Uso a qualquer tempo. Notificaremos sobre alterações 
            significativas através de email ou notificação na plataforma. Seu uso continuado da 
            plataforma após as alterações constitui aceitação dos novos termos.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-[#9CAA8E] to-[#8A9A7E] rounded-2xl p-8 text-white mb-12">
          <h2 className="text-xl font-bold mb-4">Dúvidas?</h2>
          <p className="text-white/90 mb-6">
            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-6 py-3 bg-white text-[#9CAA8E] rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Fale Conosco
          </a>
        </div>

        {/* Related Links */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Documentos Relacionados</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/privacy" 
              className="flex-1 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">Política de Privacidade</h3>
              <p className="text-sm text-gray-600">Saiba como protegemos seus dados</p>
            </a>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
