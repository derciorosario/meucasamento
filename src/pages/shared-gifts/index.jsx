import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../api/client';
import { Gift, Search, Check, Heart, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/Header';

const categories = ['Todos', 'Cozinha', 'Quarto', 'Sala', 'Casa', 'Eletrodomésticos', 'Outros'];

const SharedGifts = () => {
  const { shareCode } = useParams();
  const [gifts, setGifts] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [claiming, setClaiming] = useState(false);

  // Fetch shared gifts
  useEffect(() => {
    const fetchSharedGifts = async () => {
      try {
        const response = await fetch(`${API_URL}/gifts/shared/${shareCode}`);
        const data = await response.json();

        if (data.success) {
          setGifts(data.data.gifts);
          setOwner(data.data.owner);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao carregar lista de presentes');
      } finally {
        setLoading(false);
      }
    };

    if (shareCode) {
      fetchSharedGifts();
    }
  }, [shareCode]);

  // Filter gifts
  const filteredGifts = gifts.filter((gift) => {
    const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gift.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || gift.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle claim gift
  const handleClaimGift = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Por favor, insira o seu nome');
      return;
    }

    setClaiming(true);
    try {
      const response = await fetch(`${API_URL}/gifts/${selectedGift._id}/claim-guest`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestName }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setShowClaimModal(false);
        setGuestName('');
        // Update local state
        setGifts(gifts.map(g => 
          g._id === selectedGift._id 
            ? { ...g, status: 'claimed', claimedBy: guestName }
            : g
        ));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Erro ao reservar presente');
    } finally {
      setClaiming(false);
    }
  };

  // Open claim modal
  const openClaimModal = (gift) => {
    setSelectedGift(gift);
    setShowClaimModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9CAA8E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4 max-md:hidden" />
            <h2 className="text-2xl font-bold text-black mb-2">Lista de Presentes</h2>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header */}
      <div className="bg-white shadow-md p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center max-md:justify-center justify-between">
            <div className="flex items-center gap-4 max-md:hidden">
              <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </a>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Gift className="w-6 h-6 text-[#9CAA8E]" />
                <h1 className="text-2xl font-serif font-bold text-black max-md:text-[18px]">
                  Lista de Presentes
                </h1>
              </div>
              {owner && (
                <p className="text-gray-500 text-sm">
                  {owner.partner1Name && owner.partner2Name 
                    ? `${owner.partner1Name} & ${owner.partner2Name}`
                    : owner.name
                  }
                </p>
              )}
            </div>
            <div className="w-24 max-md:hidden"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar presentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#9CAA8E] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gift Grid */}
        {filteredGifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGifts.map((gift) => (
              <div
                key={gift._id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${
                  gift.status === 'claimed' ? 'opacity-75' : ''
                }`}
              >
                {/* Gift Image */}
                <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                  {gift.image?.url ? (
                    <img 
                      src={`${API_URL}${gift.image.url}`} 
                      alt={gift.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Gift className="w-16 h-16 text-gray-300" />
                  )}
                  {/* Status Badge */}
                  {gift.status === 'claimed' && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Reservado
                    </div>
                  )}
                </div>

                {/* Gift Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{gift.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{gift.category}</p>
                  
                  {gift.price > 0 && (
                    <p className="text-base font-bold text-[#9CAA8E] mb-2">
                      {gift.price.toLocaleString('pt-MZ')} MT
                    </p>
                  )}

                  {gift.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {gift.description}
                    </p>
                  )}

                  {/* Claimed By or Claim Button */}
                  {gift.status === 'claimed' ? (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600 font-medium truncate">
                        Reservado por {gift.claimedBy}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => openClaimModal(gift)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8A9A7E] transition-colors text-sm font-medium"
                    >
                      <Heart className="w-4 h-4" />
                      Reservar Presente
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum presente encontrado</p>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedGift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#9CAA8E]" />
              </div>
              <h2 className="text-xl font-serif font-bold text-gray-900">
                Reservar Presente
              </h2>
              <p className="text-gray-600 mt-2 text-sm">
                Você está reservando: <span className="font-semibold">{selectedGift.name}</span>
              </p>
            </div>

            <form onSubmit={handleClaimGift}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Digite o seu nome"
                  className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowClaimModal(false);
                    setGuestName('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="flex-1 px-4 py-3 bg-[#9CAA8E] text-white rounded-xl hover:bg-[#8A9A7E] transition-colors font-medium disabled:opacity-50"
                >
                  {claiming ? 'Reservando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedGifts;