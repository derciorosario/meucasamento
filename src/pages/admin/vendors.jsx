import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminVendors, updateAdminVendor, deleteAdminVendor, approveVendor, rejectVendor, getVendor } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import VendorProfileModal from '../../components/VendorProfileModal';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  TagIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const AdminVendors = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    isActive: '',
    isFeatured: '',
    status: '',
    search: '',
  });
  const [editingVendor, setEditingVendor] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [firstLoad,setFirstLoad]=useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, vendorId: null, vendorName: '' });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchVendors();
  }, [currentUser, pagination.page, filters, sortConfig]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: `${sortConfig.direction === 'asc' ? '' : '-'}${sortConfig.key}`,
        ...filters,
      };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const response = await getAdminVendors(params);
      if (response.data.success) {
        setVendors(response.data.data.vendors);
        setPagination(response.data.data.pagination);
      }

      setFirstLoad(true)
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
      setFirstLoad(true)
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor._id);
    setEditForm({
      name: vendor.name,
      description: vendor.description,
      isActive: vendor.isActive,
      isFeatured: vendor.isFeatured,
      isVerified: vendor.isVerified,
      city: vendor.city,
      priceRange: vendor.priceRange,
      startingPrice: vendor.startingPrice,
    });
  };

  const handleSave = async (vendorId) => {
    try {
      const response = await updateAdminVendor(vendorId, editForm);
      if (response.data.success) {
        toast.success('Vendor updated successfully');
        setEditingVendor(null);
        fetchVendors();
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast.error('Failed to update vendor');
    }
  };

  const handleDelete = async (vendorId) => {
    setDeleteModal({ show: true, vendorId, vendorName: vendors.find(v => v._id === vendorId)?.name || 'this vendor' });
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteAdminVendor(deleteModal.vendorId);
      if (response.data.success) {
        toast.success('Vendor deactivated successfully');
        setDeleteModal({ show: false, vendorId: null, vendorName: '' });
        fetchVendors();
      }
    } catch (error) {
      console.error('Error deactivating vendor:', error);
      toast.error('Failed to deactivate vendor');
    }
  };

  const handleApprove = async (vendorId) => {
    try {
      const response = await approveVendor(vendorId);
      if (response.data.success) {
        toast.success('Vendor approved successfully');
        fetchVendors();
      }
    } catch (error) {
      console.error('Error approving vendor:', error);
      toast.error('Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const response = await rejectVendor(vendorId, reason || '');
      if (response.data.success) {
        toast.success('Vendor rejected');
        fetchVendors();
      }
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      toast.error('Failed to reject vendor');
    }
  };

  const handleViewProfile = async (vendor) => {
    try {
      const response = await getVendor(vendor._id);
      setSelectedVendor(response.data);
      setCurrentSlide(0);
      setShowProfile(true);
    } catch (error) {
      console.error('Error loading vendor:', error);
      toast.error('Failed to load vendor details');
    }
  };

  const getPriceRangeColor = (range) => {
    const colors = {
      budget: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      luxury: 'text-purple-600 bg-purple-50'
    };
    return colors[range] || 'text-gray-600 bg-gray-50';
  };

  const getPriceRangeLabel = (range) => {
    const labels = {
      budget: 'Budget',
      medium: 'Medium',
      high: 'High',
      luxury: 'Luxury'
    };
    return labels[range] || range;
  };

  const handleBulkAction = async (action) => {
    if (selectedVendors.length === 0) {
      toast.error('Please select vendors first');
      return;
    }

    if (action === 'deactivate') {
      setBulkDeleteModal(true);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const toggleVendorSelection = (vendorId) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const toggleAllVendors = () => {
    if (selectedVendors.length === vendors.length) {
      setSelectedVendors([]);
    } else {
      setSelectedVendors(vendors.map(v => v._id));
    }
  };

  if (!firstLoad) return <Loader />;
  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-white border-gray-200 shadow-sm border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all vendors, their status, and featured placements
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <button
                onClick={() => fetchVendors()}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
              </div>
              <div className="p-3 bg-[#9CAA8E]/10 rounded-lg">
                <BuildingStorefrontIcon className="w-6 h-6 text-[#9CAA8E]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.isActive).length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {vendors.filter(v => v.isFeatured).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <StarIconSolid className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {(vendors.reduce((acc, v) => acc + (v.averageRating || 0), 0) / vendors.length || 0).toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <StarIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search  vendors by name, city, or category..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent transition-all"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 border rounded-lg transition-colors ${
                    showFilters || filters.isActive || filters.isFeatured
                      ? 'bg-[#9CAA8E] text-white border-[#9CAA8E]'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
              </div>

              {selectedVendors.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedVendors.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Deactivate Selected
                  </button>
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approval</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                    <select
                      value={filters.isFeatured}
                      onChange={(e) => setFilters({ ...filters, isFeatured: e.target.value })}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="true">Featured</option>
                      <option value="false">Not Featured</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Verified</label>
                    <select
                      value={filters.isVerified}
                      onChange={(e) => setFilters({ ...filters, isVerified: e.target.value })}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="true">Verified</option>
                      <option value="false">Not Verified</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Approval</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ isActive: '', isFeatured: '', isVerified: '', status: '', search: '' })}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedVendors.length === vendors.length && vendors.length > 0}
                      onChange={toggleAllVendors}
                      className="w-4 h-4 text-[#9CAA8E] border-gray-300 rounded focus:ring-[#9CAA8E]"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    Vendor {getSortIcon('name')}
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th 
                    onClick={() => handleSort('city')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    Location {getSortIcon('city')}
                  </th>
                  <th 
                    onClick={() => handleSort('averageRating')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    Rating {getSortIcon('averageRating')}
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approval
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendors.map((vendor) => (
                  <tr 
                    key={vendor._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      editingVendor === vendor._id ? 'bg-[#9CAA8E]/5' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor._id)}
                        onChange={() => toggleVendorSelection(vendor._id)}
                        className="w-4 h-4 text-[#9CAA8E] border-gray-300 rounded focus:ring-[#9CAA8E]"
                      />
                    </td>
                    
                    {editingVendor === vendor._id ? (
                      <>
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                            placeholder="Vendor name"
                          />
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {vendor.category?.name || '-'}
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            value={editForm.city}
                            onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                            className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                            placeholder="City"
                          />
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {vendor.averageRating?.toFixed(1) || '0.0'}
                        </td>
                        <td className="py-4 px-6">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isFeatured}
                              onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9CAA8E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                          </label>
                        </td>
                        <td className="py-4 px-6">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isVerified}
                              onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9CAA8E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </td>
                        <td className="py-4 px-6">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9CAA8E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(vendor._id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingVendor(null)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {vendor.logo ? (
                                <img
                                  src={vendor.logo}
                                  alt={vendor.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-[#9CAA8E]/10 flex items-center justify-center">
                                  <BuildingStorefrontIcon className="w-5 h-5 text-[#9CAA8E]" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                              <div className="text-sm text-gray-500">{vendor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <TagIcon className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">{vendor.category?.name || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">{vendor.city || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIconSolid
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(vendor.averageRating || 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              ({vendor.totalReviews || 0})
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vendor.isFeatured
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vendor.isFeatured ? 'Featured' : 'Standard'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vendor.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vendor.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vendor.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vendor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            vendor.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : vendor.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vendor.status === 'approved' ? 'Approved' : vendor.status === 'pending' ? 'Pending' : 'Rejected'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewProfile(vendor)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="View vendor"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            {vendor.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(vendor._id)}
                                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                  title="Approve vendor"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(vendor._id)}
                                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                  title="Reject vendor"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(vendor)}
                              className="p-1 text-gray-500 hover:text-[#9CAA8E] transition-colors"
                              title="Edit vendor"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(vendor._id)}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              title="Deactivate vendor"
                            >
                              <XCircleIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {vendors.length === 0 && (
            <div className="text-center py-12">
              <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-[#9CAA8E] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setDeleteModal({ show: false, vendorId: null, vendorName: '' })}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Deactivate Vendor
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to deactivate <span className="font-semibold">{deleteModal.vendorName}</span>? This action can be reversed later.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteModal({ show: false, vendorId: null, vendorName: '' })}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setBulkDeleteModal(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Deactivate Vendors
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to deactivate <span className="font-semibold">{selectedVendors.length} selected vendors</span>? This action can be reversed later.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setBulkDeleteModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await Promise.all(selectedVendors.map(id => deleteAdminVendor(id)));
                        toast.success(`${selectedVendors.length} vendors deactivated`);
                        setSelectedVendors([]);
                        setBulkDeleteModal(false);
                        fetchVendors();
                      } catch (error) {
                        toast.error('Failed to deactivate some vendors');
                      }
                    }}
                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Profile Modal */}
      {showProfile && selectedVendor && (
        <VendorProfileModal
          vendor={selectedVendor}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
          onClose={() => setShowProfile(false)}
          onRequestQuote={() => {}}
          onAddReview={() => {}}
          getPriceRangeColor={getPriceRangeColor}
          getPriceRangeLabel={getPriceRangeLabel}
        />
      )}
    </div>
  );
};

export default AdminVendors;