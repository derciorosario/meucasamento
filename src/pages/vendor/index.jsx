import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Send,
  MessageCircle,
  ZoomIn,
  CheckCircle,
  Users,
  ArrowLeft,
  X,
  Calendar,
  Loader2,
  Zap,
  Images,
  ChevronDown,
  Heart,
  User,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL, getVendor, requestVendorQuote, addVendorReview, getVendorsByCategory } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useData } from '../../contexts/DataContext';


/*
const FAQ_QUESTIONS = [
  { id: 'services', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', category: 'services' },
  { id: 's2', question: 'Quantas horas de serviço estão incluídas?', type: 'text', category: 'services', placeholder: 'Ex: 8 horas, dia inteiro, etc.' },
  { id: 's3', question: 'É possível contratar serviços adicionais?', type: 'boolean', category: 'services' },
  { id: 's4', question: 'Quais são as opções de personalização disponíveis?', type: 'multi-select', options: ['Cores', 'Tema', 'Decoração', 'Música', 'Menu', 'Outro'], category: 'services' },
  { id: 'p1', question: 'Qual é o custo por convidado adicional?', type: 'text', category: 'pricing', placeholder: 'Ex: 250 MT por convidado' },
  { id: 'p2', question: 'Quais formas de pagamento são aceites?', type: 'multi-select', options: ['Dinheiro', 'Transferência bancária', 'Multicaixa', 'PayPal', 'Cartão de crédito', 'Parcelamento'], category: 'pricing' },
  { id: 'p3', question: 'É necessário pagar uma caução?', type: 'boolean', category: 'pricing' },
  { id: 'p4', question: 'Qual é a política de reembolso?', type: 'text', category: 'pricing', placeholder: 'Ex: Reembolso total até 30 dias antes' },
  { id: 'a2', question: 'Com antecedência precisa contratar?', type: 'text', category: 'availability', placeholder: 'Ex: Com pelo menos 2 meses de antecedência' },
  { id: 'a3', question: 'Trabalha em quais dias da semana?', type: 'multi-select', options: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Feriados'], category: 'availability' },
  { id: 'a4', question: 'Aceita eventos em diferentes locais?', type: 'boolean', category: 'availability' },
  { id: 'l1', question: 'Inclui transporte e logística?', type: 'boolean', category: 'logistics' },
  { id: 'l2', question: 'Qual é o raio de atuação?', type: 'text', category: 'logistics', placeholder: 'Ex: Até 50km de Maputo' },
  { id: 'l3', question: 'Há custos adicionais para deslocação?', type: 'text', category: 'logistics', placeholder: 'Ex: 5 MT por km acima de 20km' },
  { id: 'l4', question: 'Quais equipamentos são fornecidos?', type: 'multi-select', options: ['Som', 'Iluminação', 'Projétor', 'Decoração', 'Mobiliário', 'Pratos e talheres', 'Copos', 'Outro'], category: 'logistics' },
  { id: 'st1', question: 'Qual é o estilo principal do serviço?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Minimalista', 'Boho', 'Vintage', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'st2', question: 'É possível ver trabalhos anteriores?', type: 'boolean', category: 'style' },
  { id: 'st3', question: 'Oferece serviços em diferentes idiomas?', type: 'multi-select', options: ['Português', 'Inglês', 'Espanhol', 'Francês', 'Outro'], category: 'style' },
  { id: 'st4', question: 'Pode criar um design exclusivo?', type: 'boolean', category: 'style' },


  // Fotografia & Filmagem
  { id: 'services', vendorType: 'fotografia-filmagem', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Fotografia', 'Vídeo', 'Álbum fotográfico', 'Making-of', 'Drone', 'Edição de vídeo', 'Galeria online'], category: 'services' },
  { id: 'ff1', vendorType: 'fotografia-filmagem', question: 'Trabalha sozinho ou conta com uma equipe de profissionais?', type: 'text', placeholder: 'Ex: Trabalho com uma equipe de 3 profissionais', category: 'services' },
  { id: 'ff2', vendorType: 'fotografia-filmagem', question: 'Tem um substituto em caso de imprevisto?', type: 'boolean', category: 'services' },
  { id: 'ff3', vendorType: 'fotografia-filmagem', question: 'Reserva o direito de publicar as fotos do casamento?', type: 'boolean', category: 'style' },
  { id: 'ff4', vendorType: 'fotografia-filmagem', question: 'Com que antecedência devo pagar a caução de reserva?', type: 'text', placeholder: 'Ex: 30 dias antes do evento', category: 'pricing' },
  { id: 'ff5', vendorType: 'fotografia-filmagem', question: 'Qual é o tempo de entrega aproximado do álbum finalizado?', type: 'text', placeholder: 'Ex: 60 dias após o casamento', category: 'availability' },
  { id: 'ff6', vendorType: 'fotografia-filmagem', question: 'Recebe por horas ou por evento?', type: 'multi-select', options: ['Por hora', 'Por evento', 'Pacote completo'], category: 'pricing' },
  { id: 'ff7', vendorType: 'fotografia-filmagem', question: 'Se fosse necessário, poderia realizar horas extras?', type: 'boolean', category: 'services' },
  
  // Salão e Espaço de Casamento
  { id: 'services', vendorType: 'salao-espaco-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Aluguer do espaço', 'Decoração', 'Som', 'Iluminação', 'Catering', 'Bolo de casamento', 'Copa'], category: 'services' },
  { id: 'se1', vendorType: 'salao-espaco-casamento', question: 'O estacionamento está para quantas viaturas?', type: 'text', placeholder: 'Ex: 50 viaturas', category: 'services' },
  { id: 'se2', vendorType: 'salao-espaco-casamento', question: 'Tem hora limite para término do evento', type: 'text', placeholder: 'Ex: 04:00 da manhã', category: 'availability' },
  { id: 'se3', vendorType: 'salao-espaco-casamento', question: 'Tem que pagar caução?', type: 'boolean', category: 'pricing' },
  { id: 'se4', vendorType: 'salao-espaco-casamento', question: 'Dispõe de Cozinha?', type: 'boolean', category: 'services' },
  { id: 'se5', vendorType: 'salao-espaco-casamento', question: 'Tem jardim?', type: 'boolean', category: 'services' },
  { id: 'se6', vendorType: 'salao-espaco-casamento', question: 'O salão é climatizado?', type: 'boolean', category: 'services' },
  { id: 'se7', vendorType: 'salao-espaco-casamento', question: 'Inclui casa da noiva?', type: 'boolean', category: 'services' },
  { id: 'se8', vendorType: 'salao-espaco-casamento', question: 'Tem sistema de frio para bebidas?', type: 'boolean', category: 'services' },
  
  // Decoração de Casamento
  { id: 'services', vendorType: 'decoracao-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Centro de mesa', 'Arranjos florais', 'Iluminação', 'Mesa do bolo', 'Arquitetura de flores', 'Cortinados', 'Balões'], category: 'services' },
  { id: 'dc1', vendorType: 'decoracao-casamento', question: 'Qual é o estilo de decoração que trabalha?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Boho', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'dc2', vendorType: 'decoracao-casamento', question: 'Inclui arranjos florais?', type: 'boolean', category: 'services' },
  { id: 'dc3', vendorType: 'decoracao-casamento', question: 'Trabalha com flores naturais ou artificiais?', type: 'multi-select', options: ['Naturais', 'Artificiais', 'Ambas'], category: 'style' },
  { id: 'dc4', vendorType: 'decoracao-casamento', question: 'Faz decoração de cerimónia e recepção?', type: 'boolean', category: 'services' },
  { id: 'dc5', vendorType: 'decoracao-casamento', question: 'Qual é o prazo para marcação?', type: 'text', placeholder: 'Ex: Com 2 meses de antecedência', category: 'availability' },
  { id: 'dc6', vendorType: 'decoracao-casamento', question: 'Faz entrega e montagem no local?', type: 'boolean', category: 'logistics' },
  
  // MC
  { id: 'services', vendorType: 'mc', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Animação', 'Jogos', 'Apresentação', 'Musicalização', 'Hora do bolo', 'Despedida de solteiro'], category: 'services' },
  { id: 'mc1', vendorType: 'mc', question: 'Quantos anos de experiência tem?', type: 'text', placeholder: 'Ex: 10 anos de experiência', category: 'services' },
  { id: 'mc2', vendorType: 'mc', question: 'Trabalha com equipamento de som próprio?', type: 'boolean', category: 'logistics' },
  { id: 'mc3', vendorType: 'mc', question: 'Faz animação e jogos para os convidados?', type: 'boolean', category: 'services' },
  { id: 'mc4', vendorType: 'mc', question: 'Qual é o tempo de atuação?', type: 'text', placeholder: 'Ex: 6 horas', category: 'availability' },
  { id: 'mc5', vendorType: 'mc', question: 'Tem substituto em caso de imprevisto?', type: 'boolean', category: 'services' },
  
  // DJ & Som
  { id: 'services', vendorType: 'dj-som', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Som ambiente', 'Iluminação DJ', 'Mesa de mistura', 'Microfones', 'Hora do bolo', 'Actuação ao vivo'], category: 'services' },
  { id: 'dj1', vendorType: 'dj-som', question: 'Qual é o estilo musical que toca?', type: 'multi-select', options: ['Pop', 'Rock', 'Kizomba', 'Kuduro', 'House', 'Semba', 'Afrobeat', 'Electrónica'], category: 'style' },
  { id: 'dj2', vendorType: 'dj-som', question: 'Trabalha com equipamento de som próprio?', type: 'boolean', category: 'logistics' },
  { id: 'dj3', vendorType: 'dj-som', question: 'Faz animação na hora do corte do bolo?', type: 'boolean', category: 'services' },
  { id: 'dj4', vendorType: 'dj-som', question: 'Tem packs de iluminação?', type: 'boolean', category: 'services' },
  { id: 'dj5', vendorType: 'dj-som', question: 'Qual é o tempo de atuação?', type: 'text', placeholder: 'Ex: 8 horas', category: 'availability' },
  { id: 'dj6', vendorType: 'dj-som', question: 'Pode actuar em diferentes locais?', type: 'boolean', category: 'availability' },
  
  // Carros de Casamento
  { id: 'services', vendorType: 'carros-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Carro da noiva', 'Carro do noivo', 'Carros de acompanhamento', 'Transporte de convidados', 'Carro decorado', 'Chauffeur'], category: 'services' },
  { id: 'cc1', vendorType: 'carros-casamento', question: 'Quantos carros dispõe?', type: 'text', placeholder: 'Ex: 3 carros', category: 'services' },
  { id: 'cc2', vendorType: 'carros-casamento', question: 'Os carros são próprios ou trabalha com parceiros?', type: 'text', placeholder: 'Ex: Frota própria', category: 'services' },
  { id: 'cc3', vendorType: 'carros-casamento', question: 'Inclui chauffeur?', type: 'boolean', category: 'services' },
  { id: 'cc4', vendorType: 'carros-casamento', question: 'Qual a distância máxima do serviço?', type: 'text', placeholder: 'Ex: 100km da cidade', category: 'logistics' },
  { id: 'cc5', vendorType: 'carros-casamento', question: 'Tem seguro de passageiros?', type: 'boolean', category: 'services' },
  
  // Florista
  { id: 'services', vendorType: 'florista', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Buqué da noiva', 'Lapela do noivo', 'Centro de mesa', 'Arranjo cerimonial', 'Decoração de arco', 'Corredor de pétalas'], category: 'services' },
  { id: 'fl1', vendorType: 'florista', question: 'Trabalha com flores nacionais ou importadas?', type: 'multi-select', options: ['Nacionais', 'Importadas', 'Ambas'], category: 'style' },
  { id: 'fl2', vendorType: 'florista', question: 'Faz buqué da noiva?', type: 'boolean', category: 'services' },
  { id: 'fl3', vendorType: 'florista', question: 'Faz decoração de cerimónia?', type: 'boolean', category: 'services' },
  { id: 'fl4', vendorType: 'florista', question: 'Faz entrega e montagem?', type: 'boolean', category: 'logistics' },
  { id: 'fl5', vendorType: 'florista', question: 'Com antecedência precisa fazer a encomenda?', type: 'text', placeholder: 'Ex: 1 mês de antecedência', category: 'availability' },
  
  // Ourivesaria & Joalharia
  { id: 'services', vendorType: 'ourivesaria-joalharia', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Alianças', 'Alianças personalizadas', 'Pulsaira de noiva', 'Brincos', 'Colar', 'Relógio'], category: 'services' },
  { id: 'oj1', vendorType: 'ourivesaria-joalharia', question: 'Faz alianças sob medida?', type: 'boolean', category: 'services' },
  { id: 'oj2', vendorType: 'ourivesaria-joalharia', question: 'Quais materiais trabalha?', type: 'multi-select', options: ['Ouro', 'Prata', 'Platina', 'Aço inoxidável'], category: 'style' },
  { id: 'oj3', vendorType: 'ourivesaria-joalharia', question: 'Faz gravura nas alianças?', type: 'boolean', category: 'services' },
  { id: 'oj4', vendorType: 'ourivesaria-joalharia', question: 'Tem garantia dos produtos?', type: 'boolean', category: 'services' },
  { id: 'oj5', vendorType: 'ourivesaria-joalharia', question: 'Faz reposição em caso de perda?', type: 'boolean', category: 'services' },
  
  // Wedding Planner
  { id: 'services', vendorType: 'wedding-planner', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Planeamento completo', 'Coordenação no dia', 'Fornecedores', 'Orçamento', 'Cronograma', 'Decoração'], category: 'services' },
  { id: 'wp1', vendorType: 'wedding-planner', question: 'Quantos casamentos já organizou?', type: 'text', placeholder: 'Ex: Mais de 50 casamentos', category: 'services' },
  { id: 'wp2', vendorType: 'wedding-planner', question: 'O serviço inclui supervisão no dia do casamento?', type: 'boolean', category: 'services' },
  { id: 'wp3', vendorType: 'wedding-planner', question: 'Trabalha com fornecedores próprios?', type: 'boolean', category: 'services' },
  { id: 'wp4', vendorType: 'wedding-planner', question: 'Faz planeamento completo ou apenas no dia?', type: 'multi-select', options: ['Completo', 'Apenas no dia', 'Ambos'], category: 'services' },
  { id: 'wp5', vendorType: 'wedding-planner', question: 'Qual a área de atuação?', type: 'text', placeholder: 'Ex: Todo o país', category: 'logistics' },
  
  // Criador de Convites
  { id: 'services', vendorType: 'criador-convites', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Convites', 'Save the date', 'Cartões de agradecimento', 'Menu de casamento', 'Placas de mesa', 'Envelope'], category: 'services' },
  { id: 'cv1', vendorType: 'criador-convites', question: 'Faz design exclusivo ou usa templates?', type: 'multi-select', options: ['Exclusivo', 'Templates', 'Ambos'], category: 'style' },
  { id: 'cv2', vendorType: 'criador-convites', question: 'Quais materiais utiliza?', type: 'multi-select', options: ['Papel couchê', 'Papelão', 'Papel vegetal', 'Papel artesanal'], category: 'style' },
  { id: 'cv3', vendorType: 'criador-convites', question: 'Inclui impressão?', type: 'boolean', category: 'services' },
  { id: 'cv4', vendorType: 'criador-convites', question: 'Qual o prazo de entrega?', type: 'text', placeholder: 'Ex: 15 dias úteis', category: 'availability' },
  { id: 'cv5', vendorType: 'criador-convites', question: 'Faz outros cartões (agradecimento, menu, etc)?', type: 'boolean', category: 'services' },
  
  // Ateliers
  { id: 'services', vendorType: 'ateliers', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Vestido de noiva', 'Fato de noivo', 'Vestido de madrinha', 'Acessórios', 'Provas', 'Ajustes'], category: 'services' },
  { id: 'at1', vendorType: 'ateliers', question: 'Faz vestidos sob medida?', type: 'boolean', category: 'services' },
  { id: 'at2', vendorType: 'ateliers', question: 'Inclui prova do vestido?', type: 'boolean', category: 'services' },
  { id: 'at3', vendorType: 'ateliers', question: 'Quantas provas inclui?', type: 'text', placeholder: 'Ex: 3 provas', category: 'services' },
  { id: 'at4', vendorType: 'ateliers', question: 'Faz ajustes após a entrega?', type: 'boolean', category: 'services' },
  { id: 'at5', vendorType: 'ateliers', question: 'Qual o prazo de confecção?', type: 'text', placeholder: 'Ex: 3 a 4 meses', category: 'availability' },
  { id: 'at6', vendorType: 'ateliers', question: 'Trabalha com tecidos nacionais ou importados?', type: 'multi-select', options: ['Nacionais', 'Importados', 'Ambos'], category: 'style' },
  
  // Maquiador
  { id: 'services', vendorType: 'maquiador', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Maquilhagem da noiva', 'Hair styling', 'Madrinhas', 'Noivo', 'Mãe da noiva', 'Prova de maquiagem'], category: 'services' },
  { id: 'ma1', vendorType: 'maquiador', question: 'Inclui teste de maquiagem?', type: 'boolean', category: 'services' },
  { id: 'ma2', vendorType: 'maquiador', question: 'Quantas pessoas pode maquiar?', type: 'text', placeholder: 'Ex: Até 5 pessoas', category: 'services' },
  { id: 'ma3', vendorType: 'maquiador', question: 'O produto inclui/pode incluir hair styling?', type: 'boolean', category: 'services' },
  { id: 'ma4', vendorType: 'maquiador', question: 'Trabalha para noiva e convidados?', type: 'boolean', category: 'services' },
  { id: 'ma5', vendorType: 'maquiador', question: 'Faz aplicação no local ou em estúdio?', type: 'multi-select', options: ['No local', 'Em estúdio', 'Ambos'], category: 'logistics' },
  { id: 'ma6', vendorType: 'maquiador', question: 'Usa produtos próprios?', type: 'boolean', category: 'services' },
  
  // Bolo de Casamento
  { id: 'services', vendorType: 'bolo-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Bolo de noiva', 'Bolo de corte', 'Bolos individuais', 'Cupcakes', 'Doces tradicionais', 'Bolo vegano'], category: 'services' },
  { id: 'bc1', vendorType: 'bolo-casamento', question: 'Quais sabores oferece?', type: 'multi-select', options: ['Chocolate', 'Baunilha', 'Morango', 'Cenoura', 'Red Velvet', 'Nozes'], category: 'style' },
  { id: 'bc2', vendorType: 'bolo-casamento', question: 'Faz bolo para dietéticos/veganos?', type: 'boolean', category: 'services' },
  { id: 'bc3', vendorType: 'bolo-casamento', question: 'Inclui decoração com Flores?', type: 'boolean', category: 'services' },
  { id: 'bc4', vendorType: 'bolo-casamento', question: 'Faz entrega e montagem?', type: 'boolean', category: 'logistics' },
  { id: 'bc5', vendorType: 'bolo-casamento', question: 'Qual o prazo de encomenda?', type: 'text', placeholder: 'Ex: 1 mês de antecedência', category: 'availability' },
  { id: 'bc6', vendorType: 'bolo-casamento', question: 'Qual o número mínimo de fatias?', type: 'text', placeholder: 'Ex: 50 fatias', category: 'services' },
  
  // Tendas de Casamento
  { id: 'services', vendorType: 'tendas-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Tenda principal', 'Tenda de cocktail', 'Tenda de crianças', 'Palco', 'Piso', 'Iluminação'], category: 'services' },
  { id: 'tn1', vendorType: 'tendas-casamento', question: 'Qual tipo de tendas dispõe?', type: 'multi-select', options: ['Toldos', 'Tendas transparentes', 'Tendas estruturadas', 'Gazebos'], category: 'services' },
  { id: 'tn2', vendorType: 'tendas-casamento', question: 'Qual a capacidade máxima?', type: 'text', placeholder: 'Ex: 200 pessoas', category: 'services' },
  { id: 'tn3', vendorType: 'tendas-casamento', question: 'Inclui montagem e desmontagem?', type: 'boolean', category: 'logistics' },
  { id: 'tn4', vendorType: 'tendas-casamento', question: 'Faz instalação de piso?', type: 'boolean', category: 'services' },
  { id: 'tn5', vendorType: 'tendas-casamento', question: 'Tem sistema de iluminação?', type: 'boolean', category: 'services' },
  { id: 'tn6', vendorType: 'tendas-casamento', question: 'Trabalha com geração própria de energia?', type: 'boolean', category: 'services' },
  
  // Lua de Mel
  { id: 'services', vendorType: 'lua-mel', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Pacote completo', 'Voos', 'Hotel', 'Passeios', 'Seguro de viagem', 'Transfers'], category: 'services' },
  { id: 'lm1', vendorType: 'lua-mel', question: 'Quais destinos oferece?', type: 'multi-select', options: ['Ilhas Maurícias', 'África do Sul', 'Dubai', 'Europa', 'Brasil', 'Maurícia'], category: 'services' },
  { id: 'lm2', vendorType: 'lua-mel', question: 'Inclui passagem e hotel?', type: 'boolean', category: 'services' },
  { id: 'lm3', vendorType: 'lua-mel', question: 'Faz seguro de viagem?', type: 'boolean', category: 'services' },
  { id: 'lm4', vendorType: 'lua-mel', question: 'Possui paquetes próprios?', type: 'boolean', category: 'services' },
  { id: 'lm5', vendorType: 'lua-mel', question: 'Ajuda com vistos e documentação?', type: 'boolean', category: 'services' },
  
  // Música & Actuação
  { id: 'services', vendorType: 'musica-atuacao', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Música cerimonial', 'Música na recepção', 'Banda ao vivo', 'Solo/Duo', 'Actuação especial', 'Som e iluminação'], category: 'services' },
  { id: 'mu1', vendorType: 'musica-atuacao', question: 'Que tipo de actuações oferece?', type: 'multi-select', options: ['Música ao vivo', 'Banda', 'Solo', 'Duo', 'Actuações teatrais', 'Dança'], category: 'services' },
  { id: 'mu2', vendorType: 'musica-atuacao', question: 'Qual o tempo de actuação?', type: 'text', placeholder: 'Ex: 4 horas', category: 'availability' },
  { id: 'mu3', vendorType: 'musica-atuacao', question: 'Actua em cerimónia e recepção?', type: 'boolean', category: 'services' },
  { id: 'mu4', vendorType: 'musica-atuacao', question: 'Trabalha com equipamento de som próprio?', type: 'boolean', category: 'logistics' },
  { id: 'mu5', vendorType: 'musica-atuacao', question: 'Qual o repertório?', type: 'text', placeholder: 'Ex: Músicas populares portuguesas e internacionais', category: 'style' },
  { id: 'mu6', vendorType: 'musica-atuacao', question: 'Pode personalizar a actuação?', type: 'boolean', category: 'services' }

];
*/




const FAQ_QUESTIONS = [
  { id: 'services', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', category: 'style' },
  { id: 's2', question: 'Quantas horas de serviço estão incluídas?', type: 'text', category: 'availability', placeholder: 'Ex: 8 horas, dia inteiro, etc.' },
  { id: 's3', question: 'É possível contratar serviços adicionais?', type: 'boolean', category: 'pricing' },
  { id: 's4', question: 'Quais são as opções de personalização disponíveis?', type: 'multi-select', options: ['Cores', 'Tema', 'Decoração', 'Música', 'Menu', 'Outro'], category: 'style' },
  { id: 'p1', question: 'Qual é o custo por convidado adicional?', type: 'text', category: 'pricing', placeholder: 'Ex: 250 MT por convidado' },
  { id: 'p2', question: 'Quais formas de pagamento são aceites?', type: 'multi-select', options: ['Dinheiro', 'Transferência bancária', 'Multicaixa', 'PayPal', 'Cartão de crédito', 'Parcelamento'], category: 'pricing' },
  { id: 'p3', question: 'É necessário pagar uma caução?', type: 'boolean', category: 'pricing' },
  { id: 'p4', question: 'Qual é a política de reembolso?', type: 'text', category: 'pricing', placeholder: 'Ex: Reembolso total até 30 dias antes' },
  { id: 'a2', question: 'Com antecedência precisa contratar?', type: 'text', category: 'availability', placeholder: 'Ex: Com pelo menos 2 meses de antecedência' },
  { id: 'a3', question: 'Trabalha em quais dias da semana?', type: 'multi-select', options: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo', 'Feriados'], category: 'availability' },
  { id: 'a4', question: 'Aceita eventos em diferentes locais?', type: 'boolean', category: 'availability' },
  { id: 'l1', question: 'Inclui transporte e logística?', type: 'boolean', category: 'logistics' },
  { id: 'l2', question: 'Qual é o raio de atuação?', type: 'text', category: 'logistics', placeholder: 'Ex: Até 50km de Maputo' },
  { id: 'l3', question: 'Há custos adicionais para deslocação?', type: 'text', category: 'logistics', placeholder: 'Ex: 5 MT por km acima de 20km' },
  { id: 'l4', question: 'Quais equipamentos são fornecidos?', type: 'multi-select', options: ['Som', 'Iluminação', 'Projétor', 'Decoração', 'Mobiliário', 'Pratos e talheres', 'Copos', 'Outro'], category: 'logistics' },
  { id: 'st1', question: 'Qual é o estilo principal do serviço?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Minimalista', 'Boho', 'Vintage', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'st2', question: 'É possível ver trabalhos anteriores?', type: 'boolean', category: 'style' },
  { id: 'st3', question: 'Oferece serviços em diferentes idiomas?', type: 'multi-select', options: ['Português', 'Inglês', 'Espanhol', 'Francês', 'Outro'], category: 'style' },
  { id: 'st4', question: 'Pode criar um design exclusivo?', type: 'boolean', category: 'style' },

  
  // Fotografia & Filmagem
  { id: 'services', vendorType: 'fotografia-filmagem', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Fotografia', 'Vídeo', 'Álbum fotográfico', 'Making-of', 'Drone', 'Edição de vídeo', 'Galeria online'], category: 'style' },
  { id: 'ff1', vendorType: 'fotografia-filmagem', question: 'Trabalha sozinho ou conta com uma equipe de profissionais?', type: 'text', placeholder: 'Ex: Trabalho com uma equipe de 3 profissionais', category: 'logistics' },
  { id: 'ff2', vendorType: 'fotografia-filmagem', question: 'Tem um substituto em caso de imprevisto?', type: 'boolean', category: 'availability' },
  { id: 'ff3', vendorType: 'fotografia-filmagem', question: 'Reserva o direito de publicar as fotos do casamento?', type: 'boolean', category: 'style' },
  { id: 'ff4', vendorType: 'fotografia-filmagem', question: 'Com que antecedência devo pagar a caução de reserva?', type: 'text', placeholder: 'Ex: 30 dias antes do evento', category: 'pricing' },
  { id: 'ff5', vendorType: 'fotografia-filmagem', question: 'Qual é o tempo de entrega aproximado do álbum finalizado?', type: 'text', placeholder: 'Ex: 60 dias após o casamento', category: 'availability' },
  { id: 'ff6', vendorType: 'fotografia-filmagem', question: 'Recebe por horas ou por evento?', type: 'multi-select', options: ['Por hora', 'Por evento', 'Pacote completo'], category: 'pricing' },
  { id: 'ff7', vendorType: 'fotografia-filmagem', question: 'Se fosse necessário, poderia realizar horas extras?', type: 'boolean', category: 'availability' },
  
  // Salão e Espaço de Casamento
  { id: 'services', vendorType: 'salao-espaco-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Aluguer do espaço', 'Decoração', 'Som', 'Iluminação', 'Catering', 'Bolo de casamento', 'Copa'], category: 'style' },
  { id: 'se1', vendorType: 'salao-espaco-casamento', question: 'O estacionamento está para quantas viaturas?', type: 'text', placeholder: 'Ex: 50 viaturas', category: 'logistics' },
  { id: 'se2', vendorType: 'salao-espaco-casamento', question: 'Tem hora limite para término do evento', type: 'text', placeholder: 'Ex: 04:00 da manhã', category: 'availability' },
  { id: 'se3', vendorType: 'salao-espaco-casamento', question: 'Tem que pagar caução?', type: 'boolean', category: 'pricing' },
  { id: 'se4', vendorType: 'salao-espaco-casamento', question: 'Dispõe de Cozinha?', type: 'boolean', category: 'logistics' },
  { id: 'se5', vendorType: 'salao-espaco-casamento', question: 'Tem jardim?', type: 'boolean', category: 'logistics' },
  { id: 'se6', vendorType: 'salao-espaco-casamento', question: 'O salão é climatizado?', type: 'boolean', category: 'logistics' },
  { id: 'se7', vendorType: 'salao-espaco-casamento', question: 'Inclui casa da noiva?', type: 'boolean', category: 'logistics' },
  { id: 'se8', vendorType: 'salao-espaco-casamento', question: 'Tem sistema de frio para bebidas?', type: 'boolean', category: 'logistics' },
  
  // Decoração de Casamento
  { id: 'services', vendorType: 'decoracao-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Centro de mesa', 'Arranjos florais', 'Iluminação', 'Mesa do bolo', 'Arquitetura de flores', 'Cortinados', 'Balões'], category: 'style' },
  { id: 'dc1', vendorType: 'decoracao-casamento', question: 'Qual é o estilo de decoração que trabalha?', type: 'multi-select', options: ['Clássico', 'Rústico', 'Moderno', 'Boho', 'Romântico', 'Luxo'], category: 'style' },
  { id: 'dc2', vendorType: 'decoracao-casamento', question: 'Inclui arranjos florais?', type: 'boolean', category: 'style' },
  { id: 'dc3', vendorType: 'decoracao-casamento', question: 'Trabalha com flores naturais ou artificiais?', type: 'multi-select', options: ['Naturais', 'Artificiais', 'Ambas'], category: 'style' },
  { id: 'dc4', vendorType: 'decoracao-casamento', question: 'Faz decoração de cerimónia e recepção?', type: 'boolean', category: 'style' },
  { id: 'dc5', vendorType: 'decoracao-casamento', question: 'Qual é o prazo para marcação?', type: 'text', placeholder: 'Ex: Com 2 meses de antecedência', category: 'availability' },
  { id: 'dc6', vendorType: 'decoracao-casamento', question: 'Faz entrega e montagem no local?', type: 'boolean', category: 'logistics' },
  
  // MC
  { id: 'services', vendorType: 'mc', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Animação', 'Jogos', 'Apresentação', 'Musicalização', 'Hora do bolo', 'Despedida de solteiro'], category: 'style' },
  { id: 'mc1', vendorType: 'mc', question: 'Quantos anos de experiência tem?', type: 'text', placeholder: 'Ex: 10 anos de experiência', category: 'style' },
  { id: 'mc2', vendorType: 'mc', question: 'Trabalha com equipamento de som próprio?', type: 'boolean', category: 'logistics' },
  { id: 'mc3', vendorType: 'mc', question: 'Faz animação e jogos para os convidados?', type: 'boolean', category: 'style' },
  { id: 'mc4', vendorType: 'mc', question: 'Qual é o tempo de atuação?', type: 'text', placeholder: 'Ex: 6 horas', category: 'availability' },
  { id: 'mc5', vendorType: 'mc', question: 'Tem substituto em caso de imprevisto?', type: 'boolean', category: 'availability' },
  
  // DJ & Som
  { id: 'services', vendorType: 'dj-som', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Som ambiente', 'Iluminação DJ', 'Mesa de mistura', 'Microfones', 'Hora do bolo', 'Actuação ao vivo'], category: 'style' },
  { id: 'dj1', vendorType: 'dj-som', question: 'Qual é o estilo musical que toca?', type: 'multi-select', options: ['Pop', 'Rock', 'Kizomba', 'Kuduro', 'House', 'Semba', 'Afrobeat', 'Electrónica'], category: 'style' },
  { id: 'dj2', vendorType: 'dj-som', question: 'Trabalha com equipamento de som próprio?', type: 'boolean', category: 'logistics' },
  { id: 'dj3', vendorType: 'dj-som', question: 'Faz animação na hora do corte do bolo?', type: 'boolean', category: 'style' },
  { id: 'dj4', vendorType: 'dj-som', question: 'Tem packs de iluminação?', type: 'boolean', category: 'style' },
  { id: 'dj5', vendorType: 'dj-som', question: 'Qual é o tempo de atuação?', type: 'text', placeholder: 'Ex: 8 horas', category: 'availability' },
  { id: 'dj6', vendorType: 'dj-som', question: 'Pode actuar em diferentes locais?', type: 'boolean', category: 'availability' },
  
  // Carros de Casamento
  { id: 'services', vendorType: 'carros-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Carro da noiva', 'Carro do noivo', 'Carros de acompanhamento', 'Transporte de convidados', 'Carro decorado', 'Chauffeur'], category: 'style' },
  { id: 'cc1', vendorType: 'carros-casamento', question: 'Quantos carros dispõe?', type: 'text', placeholder: 'Ex: 3 carros', category: 'logistics' },
  { id: 'cc2', vendorType: 'carros-casamento', question: 'Os carros são próprios ou trabalha com parceiros?', type: 'text', placeholder: 'Ex: Frota própria', category: 'logistics' },
  { id: 'cc3', vendorType: 'carros-casamento', question: 'Inclui chauffeur?', type: 'boolean', category: 'logistics' },
  { id: 'cc4', vendorType: 'carros-casamento', question: 'Qual a distância máxima do serviço?', type: 'text', placeholder: 'Ex: 100km da cidade', category: 'logistics' },
  { id: 'cc5', vendorType: 'carros-casamento', question: 'Tem seguro de passageiros?', type: 'boolean', category: 'logistics' },
  
  // Florista
  { id: 'services', vendorType: 'florista', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Buqué da noiva', 'Lapela do noivo', 'Centro de mesa', 'Arranjo cerimonial', 'Decoração de arco', 'Corredor de pétalas'], category: 'style' },
  { id: 'fl1', vendorType: 'florista', question: 'Trabalha com flores nacionais ou importadas?', type: 'multi-select', options: ['Nacionais', 'Importadas', 'Ambas'], category: 'style' },
  { id: 'fl2', vendorType: 'florista', question: 'Faz buqué da noiva?', type: 'boolean', category: 'style' },
  { id: 'fl3', vendorType: 'florista', question: 'Faz decoração de cerimónia?', type: 'boolean', category: 'style' },
  { id: 'fl4', vendorType: 'florista', question: 'Faz entrega e montagem?', type: 'boolean', category: 'logistics' },
  { id: 'fl5', vendorType: 'florista', question: 'Com antecedência precisa fazer a encomenda?', type: 'text', placeholder: 'Ex: 1 mês de antecedência', category: 'availability' },
  
  // Ourivesaria & Joalharia
  { id: 'services', vendorType: 'ourivesaria-joalharia', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Alianças', 'Alianças personalizadas', 'Pulsaira de noiva', 'Brincos', 'Colar', 'Relógio'], category: 'style' },
  { id: 'oj1', vendorType: 'ourivesaria-joalharia', question: 'Faz alianças sob medida?', type: 'boolean', category: 'style' },
  { id: 'oj2', vendorType: 'ourivesaria-joalharia', question: 'Quais materiais trabalha?', type: 'multi-select', options: ['Ouro', 'Prata', 'Platina', 'Aço inoxidável'], category: 'style' },
  { id: 'oj3', vendorType: 'ourivesaria-joalharia', question: 'Faz gravura nas alianças?', type: 'boolean', category: 'style' },
  { id: 'oj4', vendorType: 'ourivesaria-joalharia', question: 'Tem garantia dos produtos?', type: 'boolean', category: 'pricing' },
  { id: 'oj5', vendorType: 'ourivesaria-joalharia', question: 'Faz reposição em caso de perda?', type: 'boolean', category: 'pricing' },
  
  // Wedding Planner
  { id: 'services', vendorType: 'wedding-planner', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Planeamento completo', 'Coordenação no dia', 'Fornecedores', 'Orçamento', 'Cronograma', 'Decoração'], category: 'style' },
  { id: 'wp1', vendorType: 'wedding-planner', question: 'Quantos casamentos já organizou?', type: 'text', placeholder: 'Ex: Mais de 50 casamentos', category: 'style' },
  { id: 'wp2', vendorType: 'wedding-planner', question: 'O serviço inclui supervisão no dia do casamento?', type: 'boolean', category: 'style' },
  { id: 'wp3', vendorType: 'wedding-planner', question: 'Trabalha com fornecedores próprios?', type: 'boolean', category: 'logistics' },
  { id: 'wp4', vendorType: 'wedding-planner', question: 'Faz planeamento completo ou apenas no dia?', type: 'multi-select', options: ['Completo', 'Apenas no dia', 'Ambos'], category: 'style' },
  { id: 'wp5', vendorType: 'wedding-planner', question: 'Qual a área de atuação?', type: 'text', placeholder: 'Ex: Todo o país', category: 'logistics' },
  
  // Criador de Convites
  { id: 'services', vendorType: 'criador-convites', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Convites', 'Save the date', 'Cartões de agradecimento', 'Menu de casamento', 'Placas de mesa', 'Envelope'], category: 'style' },
  { id: 'cv1', vendorType: 'criador-convites', question: 'Faz design exclusivo ou usa templates?', type: 'multi-select', options: ['Exclusivo', 'Templates', 'Ambos'], category: 'style' },
  { id: 'cv2', vendorType: 'criador-convites', question: 'Quais materiais utiliza?', type: 'multi-select', options: ['Papel couchê', 'Papelão', 'Papel vegetal', 'Papel artesanal'], category: 'style' },
  { id: 'cv3', vendorType: 'criador-convites', question: 'Inclui impressão?', type: 'boolean', category: 'style' },
  { id: 'cv4', vendorType: 'criador-convites', question: 'Qual o prazo de entrega?', type: 'text', placeholder: 'Ex: 15 dias úteis', category: 'availability' },
  { id: 'cv5', vendorType: 'criador-convites', question: 'Faz outros cartões (agradecimento, menu, etc)?', type: 'boolean', category: 'style' },
  
  // Ateliers
  { id: 'services', vendorType: 'ateliers', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Vestido de noiva', 'Fato de noivo', 'Vestido de madrinha', 'Acessórios', 'Provas', 'Ajustes'], category: 'style' },
  { id: 'at1', vendorType: 'ateliers', question: 'Faz vestidos sob medida?', type: 'boolean', category: 'style' },
  { id: 'at2', vendorType: 'ateliers', question: 'Inclui prova do vestido?', type: 'boolean', category: 'style' },
  { id: 'at3', vendorType: 'ateliers', question: 'Quantas provas inclui?', type: 'text', placeholder: 'Ex: 3 provas', category: 'style' },
  { id: 'at4', vendorType: 'ateliers', question: 'Faz ajustes após a entrega?', type: 'boolean', category: 'style' },
  { id: 'at5', vendorType: 'ateliers', question: 'Qual o prazo de confecção?', type: 'text', placeholder: 'Ex: 3 a 4 meses', category: 'availability' },
  { id: 'at6', vendorType: 'ateliers', question: 'Trabalha com tecidos nacionais ou importados?', type: 'multi-select', options: ['Nacionais', 'Importados', 'Ambos'], category: 'style' },
  
  // Maquiador
  { id: 'services', vendorType: 'maquiador', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Maquilhagem da noiva', 'Hair styling', 'Madrinhas', 'Noivo', 'Mãe da noiva', 'Prova de maquiagem'], category: 'style' },
  { id: 'ma1', vendorType: 'maquiador', question: 'Inclui teste de maquiagem?', type: 'boolean', category: 'style' },
  { id: 'ma2', vendorType: 'maquiador', question: 'Quantas pessoas pode maquiar?', type: 'text', placeholder: 'Ex: Até 5 pessoas', category: 'logistics' },
  { id: 'ma3', vendorType: 'maquiador', question: 'O produto inclui/pode incluir hair styling?', type: 'boolean', category: 'style' },
  { id: 'ma4', vendorType: 'maquiador', question: 'Trabalha para noiva e convidados?', type: 'boolean', category: 'logistics' },
  { id: 'ma5', vendorType: 'maquiador', question: 'Faz aplicação no local ou em estúdio?', type: 'multi-select', options: ['No local', 'Em estúdio', 'Ambos'], category: 'logistics' },
  { id: 'ma6', vendorType: 'maquiador', question: 'Usa produtos próprios?', type: 'boolean', category: 'logistics' },
  
  // Bolo de Casamento
  { id: 'services', vendorType: 'bolo-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Bolo de noiva', 'Bolo de corte', 'Bolos individuais', 'Cupcakes', 'Doces tradicionais', 'Bolo vegano'], category: 'style' },
  { id: 'bc1', vendorType: 'bolo-casamento', question: 'Quais sabores oferece?', type: 'multi-select', options: ['Chocolate', 'Baunilha', 'Morango', 'Cenoura', 'Red Velvet', 'Nozes'], category: 'style' },
  { id: 'bc2', vendorType: 'bolo-casamento', question: 'Faz bolo para dietéticos/veganos?', type: 'boolean', category: 'style' },
  { id: 'bc3', vendorType: 'bolo-casamento', question: 'Inclui decoração com Flores?', type: 'boolean', category: 'style' },
  { id: 'bc4', vendorType: 'bolo-casamento', question: 'Faz entrega e montagem?', type: 'boolean', category: 'logistics' },
  { id: 'bc5', vendorType: 'bolo-casamento', question: 'Qual o prazo de encomenda?', type: 'text', placeholder: 'Ex: 1 mês de antecedência', category: 'availability' },
  { id: 'bc6', vendorType: 'bolo-casamento', question: 'Qual o número mínimo de fatias?', type: 'text', placeholder: 'Ex: 50 fatias', category: 'logistics' },
  
  // Tendas de Casamento
  { id: 'services', vendorType: 'tendas-casamento', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Tenda principal', 'Tenda de cocktail', 'Tenda de crianças', 'Palco', 'Piso', 'Iluminação'], category: 'style' },
  { id: 'tn1', vendorType: 'tendas-casamento', question: 'Qual tipo de tendas dispõe?', type: 'multi-select', options: ['Toldos', 'Tendas transparentes', 'Tendas estruturadas', 'Gazebos'], category: 'logistics' },
  { id: 'tn2', vendorType: 'tendas-casamento', question: 'Qual a capacidade máxima?', type: 'text', placeholder: 'Ex: 200 pessoas', category: 'logistics' },
  { id: 'tn3', vendorType: 'tendas-casamento', question: 'Inclui montagem e desmontagem?', type: 'boolean', category: 'logistics' },
  { id: 'tn4', vendorType: 'tendas-casamento', question: 'Faz instalação de piso?', type: 'boolean', category: 'logistics' },
  { id: 'tn5', vendorType: 'tendas-casamento', question: 'Tem sistema de iluminação?', type: 'boolean', category: 'logistics' },
  { id: 'tn6', vendorType: 'tendas-casamento', question: 'Trabalha com geração própria de energia?', type: 'boolean', category: 'logistics' },
  
  // Lua de Mel
  { id: 'services', vendorType: 'lua-mel', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Pacote completo', 'Voos', 'Hotel', 'Passeios', 'Seguro de viagem', 'Transfers'], category: 'style' },
  { id: 'lm1', vendorType: 'lua-mel', question: 'Quais destinos oferece?', type: 'multi-select', options: ['Ilhas Maurícias', 'África do Sul', 'Dubai', 'Europa', 'Brasil', 'Maurícia'], category: 'style' },
  { id: 'lm2', vendorType: 'lua-mel', question: 'Inclui passagem e hotel?', type: 'boolean', category: 'style' },
  { id: 'lm3', vendorType: 'lua-mel', question: 'Faz seguro de viagem?', type: 'boolean', category: 'pricing' },
  { id: 'lm4', vendorType: 'lua-mel', question: 'Possui paquetes próprios?', type: 'boolean', category: 'logistics' },
  { id: 'lm5', vendorType: 'lua-mel', question: 'Ajuda com vistos e documentação?', type: 'boolean', category: 'logistics' },
  
  // Música & Actuação
  { id: 'services', vendorType: 'musica-atuacao', question: 'Quais serviços estão inclusos no pacote?', type: 'multi-select', allowCustom: true, options: ['Música cerimonial', 'Música na recepção', 'Banda ao vivo', 'Solo/Duo', 'Actuação especial', 'Som e iluminação'], category: 'style' },
  { id: 'mu1', vendorType: 'musica-atuacao', question: 'Que tipo de actuações oferece?', type: 'multi-select', options: ['Música ao vivo', 'Banda', 'Solo', 'Duo', 'Actuações teatrais', 'Dança'], category: 'style' },
  { id: 'mu2', vendorType: 'musica-atuacao', question: 'Qual o tempo de actuação?', type: 'text', placeholder: 'Ex: 4 horas', category: 'availability' },
  { id: 'mu3', vendorType: 'musica-atuacao', question: 'Actua em cerimónia e recepção?', type: 'boolean', category: 'style' },
  { id: 'mu4', vendorType: 'musica-atuacao', question: 'Trabalha com equipamento de som próprio?', type: 'boolean', category: 'logistics' },
  { id: 'mu5', vendorType: 'musica-atuacao', question: 'Qual o repertório?', type: 'text', placeholder: 'Ex: Músicas populares portuguesas e internacionais', category: 'style' },
  { id: 'mu6', vendorType: 'musica-atuacao', question: 'Pode personalizar a actuação?', type: 'boolean', category: 'style' }
];




const getCategoryLabel = (category) => {
  const labels = { services: 'Serviços', pricing: 'Preços', availability: 'Disponibilidade', logistics: 'Logística', style: 'Estilo' };
  return labels[category] || category;
};

const getPriceRangeColor = (range) => {
  const colors = { budget: 'bg-green-100 text-green-700', moderate: 'bg-yellow-100 text-yellow-700', premium: 'bg-orange-100 text-orange-700', luxury: 'bg-purple-100 text-purple-700' };
  return colors[range] || 'bg-gray-100 text-gray-700';
};

const getPriceRangeLabel = (range) => {
  const labels = { budget: 'Económico', moderate: 'Moderado', premium: 'Premium', luxury: 'Luxo' };
  return labels[range] || range;
};

const TABS = [
  { id: 'informacao', label: 'Informação' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'galeria', label: 'Galeria' }
];

const VendorProfilePage = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('informacao');

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ eventDate: '', guestCount: 50, message: 'Olá! Gostaria de pedir um orçamento para o meu casamento. Por favor, entre em contacto para mais detalhes.' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [relatedVendors, setRelatedVendors] = useState([]);
  const [relatedVendorsLoading, setRelatedVendorsLoading] = useState(false);


    const data=useData()
        
    useEffect(()=>{
        if(!data.postDialogOpen){
            setLightboxIndex(-1)
            setShowQuoteModal(false);
            setShowReviewModal(false);
            setShowLightbox(false)
  
        }
    },[data.postDialogOpen])
  
    useEffect(()=>{
  
      if(lightboxIndex>=0){
            data.setPostDialogOpen(true)
      }
  
    },[lightboxIndex])

  // Sticky state
  const [tabsSticky, setTabsSticky] = useState(false);
  const [showStickyQuote, setShowStickyQuote] = useState(false);
  const [quoteSidebarTop, setQuoteSidebarTop] = useState(0);
  
  const tabsRef = useRef(null);
  const heroRef = useRef(null);
  const quoteSidebarRef = useRef(null);
  const contentSectionsRef = useRef({
    informacao: null,
    servicos: null,
    faqs: null,
    avaliacoes: null,
    galeria: null
  });

  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsTop = tabsRef.current.getBoundingClientRect().top;
        setTabsSticky(tabsTop <= 0);
      }
      
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setShowStickyQuote(heroBottom <= 0);
      }

      // Update active tab based on scroll position
      const scrollPosition = window.scrollY + 150; // Offset for better UX
      
      let currentActiveTab = 'informacao';
      for (const [tabId, element] of Object.entries(contentSectionsRef.current)) {
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentActiveTab = tabId;
            break;
          }
        }
      }
      
      setActiveTab(currentActiveTab);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const response = await getVendor(vendorId);
        if (response.data) {
          setVendor({...response.data,faqs:response.data.faqs.filter(i=>i.questionId!="s1" && i.questionId!="services")});
          setServices(response.data.faqs.filter(i=>i.questionId=="s1" || i.questionId=="services")?.[0]?.answer || [])
          // Fetch related vendors from the same category
          if (response.data.category?.slug) {
            fetchRelatedVendors(response.data.category.slug, response.data._id);
          }
        } else {
          setError('Fornecedor não encontrado');
        }
      } catch (err) {
        console.error('Error fetching vendor:', err);
        setError('Erro ao carregar fornecedor');
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchVendor();
  }, [vendorId]);

  const fetchRelatedVendors = async (categorySlug, currentVendorId) => {
    try {
      setRelatedVendorsLoading(true);
      const response = await getVendorsByCategory(categorySlug);
      // Filter out the current vendor and limit to 3
      const related = (response.data || [])
        .filter(v => v._id !== currentVendorId)
        .slice(0, 3);
      setRelatedVendors(related);
    } catch (err) {
      console.error('Error fetching related vendors:', err);
    } finally {
      setRelatedVendorsLoading(false);
    }
  };

  const getAllImages = () => {
    if (!vendor) return [];
    const images = [...(vendor.images || [])];
    if (vendor.galleries && vendor.galleries.length > 0) {
      vendor.galleries.forEach(gallery => {
        if (gallery.photos && gallery.photos.length > 0) {
          gallery.photos.forEach(photo => { if (photo.url) images.push(photo.url); });
        }
      });
    }
    return images;
  };

  const allImages = getAllImages();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://www.acadiate.com/images/Placeholder.png';
    if (imagePath.includes('https')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const openLightbox = (index) => { setLightboxIndex(index); setShowLightbox(true); };
  const closeLightbox = () => setShowLightbox(false);
  const nextLightboxSlide = () => setLightboxIndex((prev) => (prev + 1) % allImages.length);
  const prevLightboxSlide = () => setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleRequestQuote = () => {
    if (!user) { toast.error('Precisa fazer login para pedir orçamento'); return; }
    setShowQuoteModal(true);
    data.setPostDialogOpen(true)
  };

  const submitQuote = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingQuote(true);
      await requestVendorQuote(vendor._id, quoteForm);
      toast.success('Pedido de orçamento enviado com sucesso!');
      setShowQuoteModal(false);
      setQuoteForm({ eventDate: '', guestCount: 50, message: '' });
    } catch (error) {
      console.error('Error requesting quote:', error);
      toast.error('Erro ao enviar pedido de orçamento');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleAddReview = () => {
    if (!user) { toast.error('Precisa fazer login para avaliar'); return; }
    setShowReviewModal(true);
    data.setPostDialogOpen(true)
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingReview(true);
      await addVendorReview(vendor._id, reviewForm);
      toast.success('Avaliação adicionada com sucesso!');
      setShowReviewModal(false);
      setReviewForm({ rating: 5, comment: '' });
      const response = await getVendor(vendor._id);
      setVendor({...response.data,faqs:response.data.faqs.filter(i=>i.questionId!="s1" && i.questionId!="services")});
      setServices(response.data.faqs.filter(i=>i.questionId=="s1" || i.questionId=="services")?.[0]?.answer || [])
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error(error.response?.data?.message || 'Erro ao adicionar avaliação');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const scrollToSection = (tabId) => {
    const element = contentSectionsRef.current[tabId];
    if (element) {
      const offset = 80; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setActiveTab(tabId);
  };

  // Get display images for hero (max 4, no repeats)
  const getHeroImages = () => {
    if (allImages.length === 0) return [];
    // Get unique images (first 4)
    return allImages.slice(0, 4);
  };

  const heroImages = getHeroImages();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9CAA8E]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{error || 'Fornecedor não encontrado'}</h2>
          <button onClick={() => {
              if(user?.role!="admin"){
                navigate('/vendors')
              }else{
                navigate('/admin/vendors')
              }
          }} className="flex items-center gap-2 px-6 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Fornecedores
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const tabReviewCount = vendor.reviews?.length || 0;
  const tabGalleryCount = allImages.length;

  // Inline Quote Form (for sticky sidebar)
  const InlineQuoteForm = ({ compact = false }) => (
    <form onSubmit={submitQuote} className={compact ? 'space-y-3' : 'space-y-4'}>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Data do evento</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="date"
            required
            value={quoteForm.eventDate}
            onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Número de convidados</label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            min="1"
            value={quoteForm.guestCount}
            onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: parseInt(e.target.value) || 0 })}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Mensagem</label>
        <textarea
          rows={compact ? 3 : 4}
          value={quoteForm.message}
          onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
          className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm resize-none"
          placeholder="Descreva o que precisa..."
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-[#9CAA8E]">
        <Zap className="w-3.5 h-3.5" />
        <span>Responde rapidamente</span>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmittingQuote}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-70"
      >
        {isSubmittingQuote ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><Send className="w-4 h-4" />Enviar pedido</>}
      </motion.button>
    </form>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header notSticky={true} />

      <main className="flex-1 py-4 md:py-8">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Back Button - Hidden on mobile */}
          <button
            onClick={() => {
                if(user?.role!="admin"){
                navigate('/vendors')
              }else{
                navigate('/admin/vendors')
              }
            }}
            className="hidden md:flex items-center gap-2 text-gray-500 hover:text-[#9CAA8E] mb-5 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Fornecedores
          </button>

          {/* Mobile Back Button */}
          <button
            onClick={() => navigate('/vendors')}
            className="md:hidden flex items-center gap-1 text-gray-500 mb-3 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Voltar</span>
          </button>

          {/* ── HERO ── */}
          <div ref={heroRef} className="flex flex-col md:flex-row gap-4 md:gap-6 mb-0">
            {/* Left: image grid */}
            
            
            {/* Left: image grid */}
<div className="flex-1 min-w-0">
  {heroImages.length > 0 ? (
    <div className={`grid gap-1 md:gap-2 h-48 sm:h-64 md:h-80 lg:h-96 ${
      heroImages.length === 1 ? 'grid-cols-1' :
      heroImages.length === 2 ? 'grid-cols-2' :
      heroImages.length === 3 ? 'grid-cols-2' :
      'grid-cols-2'
    }`}>
      {heroImages.length === 1 && (
        <div className="relative w-full h-full cursor-pointer group overflow-hidden rounded-lg md:rounded-2xl" onClick={() => openLightbox(0)}>
          <img 
            src={getImageUrl(heroImages[0])} 
            alt={vendor.name} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      )}

      {heroImages.length === 2 && (
        <>
          {heroImages.map((image, idx) => (
            <div key={idx} className="relative w-full h-full cursor-pointer group overflow-hidden rounded-lg md:rounded-2xl" onClick={() => openLightbox(idx)}>
              <img 
                src={getImageUrl(image)} 
                alt={`${vendor.name} - ${idx + 1}`} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </>
      )}

      {heroImages.length === 3 && (
        <>
          {/* First image - full height on left */}
          <div className="relative row-span-2 h-full cursor-pointer group overflow-hidden rounded-l-lg md:rounded-l-2xl" onClick={() => openLightbox(0)}>
            <img 
              src={getImageUrl(heroImages[0])} 
              alt={vendor.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Second image - top right */}
          <div className="relative h-full cursor-pointer group overflow-hidden" onClick={() => openLightbox(1)}>
            <img 
              src={getImageUrl(heroImages[1])} 
              alt={vendor.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Third image - bottom right */}
          <div className="relative h-full cursor-pointer group overflow-hidden rounded-br-lg md:rounded-br-2xl" onClick={() => openLightbox(2)}>
            <img 
              src={getImageUrl(heroImages[2])} 
              alt={vendor.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        </>
      )}

      {heroImages.length >= 4 && (
        <>
          {/* First image - full height on left */}
          <div className="relative row-span-2 h-full cursor-pointer group overflow-hidden rounded-l-lg md:rounded-l-2xl" onClick={() => openLightbox(0)}>
            <img 
              src={getImageUrl(heroImages[0])} 
              alt={vendor.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          
          {/* Second image - top right */}
          <div className="relative h-full cursor-pointer group overflow-hidden" onClick={() => openLightbox(1)}>
            <img 
              src={getImageUrl(heroImages[1])} 
              alt={vendor.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
          </div>
          
          {/* Third image - bottom right with overlay button */}
          <div className="relative h-full cursor-pointer group overflow-hidden rounded-br-lg md:rounded-br-2xl" onClick={() => openLightbox(2)}>
            <img 
              src={getImageUrl(heroImages[2])} 
              alt={vendor.name} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            
            {/* Overlay for remaining photos count */}
            {allImages.length > 3 && (
              <>
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                
                {/* Button to view all photos */}
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    scrollToSection('galeria'); 
                  }}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white"
                >
                  <Images className="w-8 h-8 mb-2 opacity-90" />
                  <span className="text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    +{allImages.length - 3} fotos
                  </span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  ) : (
    <div className="h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg md:rounded-2xl bg-gray-200 flex items-center justify-center">
      <Images className="w-12 h-12 text-gray-400" />
    </div>
  )}
</div>

            {/* Right: sidebar card (non-sticky, stays in hero) */}
            <div className="w-full md:w-72 flex-shrink-0">
              {/* Mobile Sticky bottom bar */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-lg">
                <div className="flex items-center justify-between max-w-md mx-auto">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Preço desde</p>
                    <p className="text-base font-bold text-gray-900">
                      {vendor.startingPrice ? `${vendor.startingPrice.toLocaleString('pt-MZ')} MT` : 'Sob consulta'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddReview} className="p-2.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-primary-300">
                      <Star className="w-5 h-5" />
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRequestQuote}
                      className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      Orçamento
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Desktop sidebar card */}
              <div className="hidden md:flex flex-col bg-white rounded-2xl shadow-md border border-gray-100 p-5 h-full">
                <div className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-lg">{vendor.category?.icon}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{vendor.category?.name}</span>
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{vendor.name}</h1>
                  <div className="flex items-center gap-1.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(vendor.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                    <span className="text-sm font-semibold text-gray-800">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
                    <span className="text-sm text-gray-400">· {vendor.totalReviews} opiniões</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-3.5 h-3.5 text-[#9CAA8E]" />
                    <span>{vendor.city}, {vendor.region}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3" />

                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-0.5">Preço desde</p>
                  <p className="text-xl font-bold text-gray-900">
                    {vendor.startingPrice ? `${vendor.startingPrice.toLocaleString('pt-MZ')} MT` : 'Sob consulta'}
                  </p>
                  {vendor.priceDescription && <p className="text-xs text-gray-400 mt-0.5">{vendor.priceDescription}</p>}
                  {vendor.maxCapacity && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <Users className="w-3.5 h-3.5" />
                      <span>Máx. {vendor.maxCapacity} convidados</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#9CAA8E] mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Responde rapidamente</span>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestQuote}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Pedir Orçamento Grátis
                  </motion.button>

                  <div className="flex gap-2">
                  
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddReview}
                      className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 text-sm"
                    >
                      <Star className="w-4 h-4" />
                      Avaliar
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Vendor Info Card */}
          <div className="md:hidden bg-white rounded-xl p-4 mt-3 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{vendor.category?.icon}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{vendor.category?.name}</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-yellow-600">{vendor.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4 text-[#9CAA8E]" />
              <span>{vendor.city}, {vendor.region}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{vendor.totalReviews} opiniões</span>
            </div>
            <div className="flex items-center gap-2">
              {vendor.phone && (
                <a href={`tel:${vendor.phone}`} className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Ligar</span>
                </a>
              )}
              {vendor.email && (
                <a href={`mailto:${vendor.email}`} className="flex-1 border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:border-primary-300 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* ── TAB NAV — sticky when scrolled past ── */}
          <div ref={tabsRef} className="mt-4">
            {/* Sticky placeholder to prevent layout jump */}
            <div className={tabsSticky ? 'h-[48px]' : ''} />
            <div
              className={`bg-white border-b border-gray-200 rounded-t-xl overflow-x-auto hide-scrollbar transition-shadow ${
                tabsSticky
                  ? 'fixed top-0 left-0 right-0 z-30 shadow-md rounded-none'
                  : ''
              }`}
            >
              <div className={`flex gap-0 px-2 min-w-max md:min-w-0 ${tabsSticky ? 'max-w-6xl mx-auto' : ''}`}>
                {TABS.map((tab) => {
                  let label = tab.label;
                  if (tab.id === 'avaliacoes' && tabReviewCount > 0) label = `Avaliações (${tabReviewCount})`;
                  if (tab.id === 'galeria' && tabGalleryCount > 0) label = `Galeria (${tabGalleryCount})`;
                  if (tab.id === 'faqs' && vendor.faqs?.length > 0) label = `FAQs (${vendor.faqs?.length})`;
                  if (tab.id === 'servicos' && services.length > 0) label = `Serviços (${services.length})`;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => scrollToSection(tab.id)}
                      className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-[#9CAA8E] text-[#9CAA8E]'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── CONTENT + STICKY QUOTE SIDEBAR ── */}
            <div className="flex gap-6 items-start">
              {/* Main content with section refs */}
              <div className="flex-1 min-w-0 gap-3 _vendor_section">
                {/* Informação section */}
                <section 
                  ref={el => contentSectionsRef.current.informacao = el}
                  id="section-informacao"
                  className="bg-white rounded-b-xl shadow-sm border border-gray-100 border-t-0 p-4 md:p-6 mb-16 md:mb-0 scroll-mt-20"
                >
                  <div className="max-w-2xl">
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Sobre</h2>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-6">{vendor.description}</p>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Contactos</h3>
                    <div className="space-y-2">
                      {vendor.email && (
                        <a href={`mailto:${vendor.email}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                          <Mail className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                          <span className="text-sm truncate">{vendor.email}</span>
                        </a>
                      )}
                      {vendor.phone && (
                        <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                          <Phone className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                          <span className="text-sm">{vendor.phone}</span>
                        </a>
                      )}
                      {vendor.website && (
                        <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                          <Globe className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                          <span className="text-sm truncate">Website</span>
                        </a>
                      )}
                      {vendor.mapLink && (
                        <a href={vendor.mapLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-700 hover:text-primary-600 transition-all group">
                          <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                          <span className="text-sm truncate">Ver no Mapa</span>
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                {/* Serviços section */}
                <section 
                  ref={el => contentSectionsRef.current.servicos = el}
                  id="section-servicos"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-16 md:mb-0 scroll-mt-20"
                >
                  <div className="max-w-2xl">
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Serviços Inclusos</h2>
                    {services && services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {services.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-2 _bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4 text-[#9CAA8E] hidden" />
                             <Check className="w-3.5 h-3.5 text-green-600" />
                            {service}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Nenhum serviço disponível.</p>
                    )}
                  </div>
                </section>

                {/* FAQs section */}
                <section 
                  ref={el => contentSectionsRef.current.faqs = el}
                  id="section-faqs"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-16 md:mb-0 scroll-mt-20"
                >
                  <div className="max-w-2xl">
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">FAQs</h2>
                    {vendor.faqs && vendor.faqs.length > 0 ? (
                      ['services', 'pricing', 'availability', 'logistics', 'style'].map(category => {
                        const categoryFaqs = vendor.faqs.filter(faq => {
                          const question = FAQ_QUESTIONS.find(q => q.id === faq.questionId);
                          return question && question.category === category && faq.answer !== undefined && faq.answer !== null && faq.answer !== '' &&
                            (Array.isArray(faq.answer) ? faq.answer.length > 0 : true);
                        });
                        if (categoryFaqs.length === 0) return null;
                        return (
                          <div key={category} className="mb-6">
                            <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">{getCategoryLabel(category)}</h4>
                            <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                              {categoryFaqs.map((faq, idx) => {
                                const question = FAQ_QUESTIONS.find(q => q.id === faq.questionId);
                                if (!question) return null;
                                return (
                                  <div key={idx} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                                    <p className="text-sm font-semibold text-gray-800 mb-2">{question.question}</p>
                                    {question.type === 'text' && (
                                      <div className="inline-flex items-center gap-1.5 text-sm font-medium">
                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                        <p className="text-sm text-gray-600">{faq.answer}</p>
                                      </div>         
                                    )}
                                    {question.type === 'boolean' && (
                                      <div className="flex items-center gap-2">
                                        {faq.answer === true ? (
                                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700">
                                            <span className="w-5 h-5 rounded-full __bg-green-100 flex items-center justify-center">
                                              <Check className="w-3.5 h-3.5 text-green-600" />
                                            </span>
                                            Sim
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500">
                                            <span className="w-5 h-5 rounded-full __bg-gray-100 flex items-center justify-center">
                                              <X className="w-3 h-3 text-gray-400 hidden" />
                                              <Check className="w-3.5 h-3.5 text-green-600" />
                                            </span>
                                            Não
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {question.type === 'multi-select' && Array.isArray(faq.answer) && (
                                      <div className="flex flex-wrap gap-1.5 mt-1">
                                        {faq.answer.map((option, optIdx) => (
                                          <span
                                            key={optIdx}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 __bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                                          >
                                            <CheckCircle className="w-3 h-3 text-[#9CAA8E] hidden" />
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                            {option}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-sm">Nenhuma pergunta frequente disponível.</p>
                    )}
                  </div>
                </section>

                {/* Avaliações section */}
                <section 
                  ref={el => contentSectionsRef.current.avaliacoes = el}
                  id="section-avaliacoes"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-16 md:mb-0 scroll-mt-20"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base md:text-lg font-semibold text-gray-900">Avaliações</h2>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAddReview}
                        className="flex items-center gap-1 px-3 py-2 border-2 border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-700 hover:border-primary-300"
                      >
                        <Star className="w-4 h-4" />
                        <span className="hidden xs:inline">Avaliar</span>
                      </motion.button>
                    </div>
                    {vendor.reviews && vendor.reviews.length > 0 ? (
                      <div className="space-y-3">
                        {vendor.reviews.map((review, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            className="bg-gray-50 rounded-xl p-3 md:p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {/* Check if user is populated (object with name) or just an ID or has authorName */}
                                {(review.user && typeof review.user === 'object' && review.user.name) ? (
                                  <>
                                    {review.user.avatar ? (
                                      <img 
                                        src={review.user.avatar.startsWith('https') ? review.user.avatar : `${API_URL}${review.user.avatar}`}
                                        alt={review.user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-[#9CAA8E] flex items-center justify-center">
                                        <span className="text-sm text-white font-medium">
                                          {review.user.name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-900">{review.user.name}</span>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                      <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">{review.authorName || 'Convidado'}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            {review.comment && <p className="text-xs md:text-sm text-gray-600">{review.comment}</p>}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Ainda sem avaliações.</p>
                    )}
                  </div>
                </section>

                {/* Galeria section */}
                <section 
                  ref={el => contentSectionsRef.current.galeria = el}
                  id="section-galeria"
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-16 md:mb-0 scroll-mt-20"
                >
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Galeria ({allImages.length} fotos)</h2>
                    {allImages.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 md:gap-2">
                        {allImages.map((image, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-pointer group"
                            onClick={() => openLightbox(idx)}
                          >
                            <img src={getImageUrl(image)} alt={`${vendor.name} - ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-5 h-5 md:w-7 md:h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <ZoomIn className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-gray-700" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Sem fotos disponíveis.</p>
                    )}
                  </div>
                </section>

                {/* Related Vendors Section - Inline horizontal layout */}
                {(relatedVendors.length > 0 || relatedVendorsLoading) && (
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-16 md:mb-0 scroll-mt-20">
                    <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Alguns fornecedores relacionados</h2>
                    {relatedVendorsLoading ? (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse flex gap-3 p-2 min-w-[200px]">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-3/4" />
                              <div className="h-2 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                        {relatedVendors.map((relatedVendor) => (
                          <div
                            key={relatedVendor._id}
                            onClick={() => navigate(`/vendor/${relatedVendor._id}`)}
                            className="flex gap-3 p-2 min-w-[200px] rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group border border-gray-100"
                          >
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={relatedVendor.coverImage || relatedVendor.images?.[0] || 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=300&fit=crop'}
                                alt={relatedVendor.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#9CAA8E] transition-colors">
                                {relatedVendor.name}
                              </h5>
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < Math.round(relatedVendor.averageRating || 0)
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-200 fill-gray-200'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400">
                                  {relatedVendor.averageRating?.toFixed(1) || '0.0'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span>{relatedVendor.city}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* ── STICKY QUOTE SIDEBAR (desktop only, appears after hero scrolls away) ── */}
              <AnimatePresence>
                {showStickyQuote && (
                  <motion.div
                    ref={quoteSidebarRef}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25 }}
                    className="hidden md:block w-72 flex-shrink-0"
                    style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start' }}
                  >
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{vendor.category?.icon}</span>
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{vendor.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(vendor.averageRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                          ))}
                          <span className="text-xs text-gray-500">{vendor.averageRating?.toFixed(1) || '0.0'} · {vendor.totalReviews} opiniões</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 mb-4" />

                      <p className="text-sm font-semibold text-gray-900 mb-3">Pedir orçamento</p>
                      <InlineQuoteForm compact />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button onClick={closeLightbox} className="absolute top-2 right-2 md:top-4 md:right-4 w-8 h-8 md:w-10 md:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10">
              <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            {allImages.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevLightboxSlide(); }} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextLightboxSlide(); }} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
              </>
            )}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={getImageUrl(allImages[lightboxIndex])}
              alt={`${vendor.name} - ${lightboxIndex + 1}`}
              className="max-w-[95vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 md:px-4 md:py-2 bg-black/50 backdrop-blur-sm text-white rounded-full text-xs md:text-sm">
              {lightboxIndex + 1} / {allImages.length}
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 flex gap-1 md:gap-2 max-w-[90vw] overflow-x-auto px-2 md:px-4 hide-scrollbar">
                {allImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === lightboxIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote Request Modal (dialog) */}
      <AnimatePresence>
        {showQuoteModal && vendor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowQuoteModal(false)} className="fixed inset-0 bg-black z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            >
              <div className="bg-white rounded-t-3xl md:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Pedir Orçamento</h2>
                  <button onClick={() => setShowQuoteModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={submitQuote} className="p-4 md:p-6 space-y-4 md:space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{vendor.category?.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Para</p>
                      <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Data do evento</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" required value={quoteForm.eventDate} onChange={(e) => setQuoteForm({ ...quoteForm, eventDate: e.target.value })} className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Número de convidados</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="number" min="1" value={quoteForm.guestCount} onChange={(e) => setQuoteForm({ ...quoteForm, guestCount: parseInt(e.target.value) || 0 })} className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                    <textarea rows={4} value={quoteForm.message} onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm" placeholder="Descreva o que precisa..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowQuoteModal(false)} disabled={isSubmittingQuote} className="flex-1 px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all text-sm">
                      Cancelar
                    </button>
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmittingQuote} className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-md text-sm">
                      {isSubmittingQuote ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><Send className="w-4 h-4" />Enviar</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && vendor && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowReviewModal(false)} className="fixed inset-0 bg-black z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            >
              <div className="bg-white rounded-t-3xl md:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Avaliar Fornecedor</h2>
                  <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={submitReview} className="p-4 md:p-6 space-y-4 md:space-y-5">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{vendor.category?.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Para</p>
                      <p className="font-medium text-gray-900 truncate">{vendor.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">Avaliação</label>
                    <div className="flex items-center justify-center gap-1 md:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button key={star} type="button" whileTap={{ scale: 0.9 }} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="p-1 focus:outline-none">
                          <Star className={`w-8 h-8 md:w-10 md:h-10 transition-all ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400 filter drop-shadow-lg' : 'text-gray-300 hover:text-gray-400'}`} />
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-center text-xs md:text-sm text-gray-500 mt-2">
                      {reviewForm.rating === 5 && 'Excelente!'}
                      {reviewForm.rating === 4 && 'Muito bom'}
                      {reviewForm.rating === 3 && 'Bom'}
                      {reviewForm.rating === 2 && 'Regular'}
                      {reviewForm.rating === 1 && 'Ruim'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Comentário</label>
                    <textarea rows={4} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} className="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-900 text-sm" placeholder="Partilhe a sua experiência..." />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowReviewModal(false)} disabled={isSubmittingReview} className="flex-1 px-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-all text-sm">
                      Cancelar
                    </button>
                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmittingReview} className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-all shadow-md text-sm">
                      {isSubmittingReview ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><MessageCircle className="w-4 h-4" />Avaliar</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 480px) {
          .xs\\:inline { display: inline; }
          .xs\\:hidden { display: none; }
        }
        .scroll-mt-20 {
          scroll-margin-top: 80px;
        }
      `}</style>
    </div>
  );
};

export default VendorProfilePage;