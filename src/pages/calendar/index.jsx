import { useState, useEffect } from 'react';
import Gallery from '../../components/Gallery';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../api/client';
import CalendarComponent from '../../components/Calendar';
import { 
  Store,
  ChevronDown,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorSelector, setShowVendorSelector] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.data.success) {
        const { user, vendors, vendor } = response.data;
        setUser(user);
        setVendors(vendors || []);
        // Set selected vendor - prefer the vendor object from response, otherwise first vendor
        setSelectedVendor(vendor || (vendors && vendors.length > 0 ? vendors[0] : null));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorSelector(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-black">Calendário</h1>
          <p className="text-gray-600 mt-2">Gerencie suas datas, eventos e compromissos</p>
        </div>

        {/* Vendor Selector - Only show if user has vendors */}
        {vendors.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o fornecedor:
            </label>
            <div className="relative">
              <button
                onClick={() => setShowVendorSelector(!showVendorSelector)}
                className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-left hover:border-[#9CAA8E] focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-[#9CAA8E]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">
                      {selectedVendor?.name || 'Selecione um fornecedor'}
                    </p>
                    {selectedVendor?.category && (
                      <p className="text-xs text-gray-500">
                        {selectedVendor.category.name}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showVendorSelector ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showVendorSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-2 w-full md:w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {vendors.map((vendor) => (
                        <button
                          key={vendor._id}
                          onClick={() => handleVendorSelect(vendor)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            selectedVendor?._id === vendor._id ? 'bg-[#9CAA8E]/10' : ''
                          }`}
                        >
                          <div className="w-10 h-10 bg-[#9CAA8E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5 text-[#9CAA8E]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-black truncate">{vendor.name}</p>
                            {vendor.category && (
                              <p className="text-xs text-gray-500">{vendor.category.name}</p>
                            )}
                          </div>
                          {selectedVendor?._id === vendor._id && (
                            <div className="w-2 h-2 bg-[#9CAA8E] rounded-full flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <CalendarComponent userId={user?.id} vendorId={selectedVendor?._id} />
      </div>
    </div>
  );
};

export default CalendarPage;
