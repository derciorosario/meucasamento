import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminVendors, updateAdminVendor, deleteAdminVendor } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';

const AdminVendors = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    isActive: '',
    isFeatured: '',
    search: '',
  });
  const [editingVendor, setEditingVendor] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchVendors();
  }, [currentUser, pagination.page, filters]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
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
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
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
    if (!window.confirm('Are you sure you want to deactivate this vendor?')) return;
    try {
      const response = await deleteAdminVendor(vendorId);
      if (response.data.success) {
        toast.success('Vendor deactivated successfully');
        fetchVendors();
      }
    } catch (error) {
      console.error('Error deactivating vendor:', error);
      toast.error('Failed to deactivate vendor');
    }
  };

  if (loading && vendors.length === 0) return <Loader />;
  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Vendors</h1>
          <Link to="/admin" className="text-[#9CAA8E] hover:underline">← Back to Dashboard</Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search vendors..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
            />
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={filters.isFeatured}
              onChange={(e) => setFilters({ ...filters, isFeatured: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Featured</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </select>
            <button
              onClick={() => setFilters({ isActive: '', isFeatured: '', search: '' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Rating</th>
                  <th className="text-left py-3 px-4">Featured</th>
                  <th className="text-left py-3 px-4">Verified</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b hover:bg-gray-50">
                    {editingVendor === vendor._id ? (
                      <>
                        <td className="py-3 px-4 text-gray-600">
                          <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="px-2 py-1 border rounded" />
                        </td>
                        <td className="py-3 px-4 text-gray-600">{vendor.category?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <input type="text" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="px-2 py-1 border rounded" />
                        </td>
                        <td className="py-3 px-4 text-gray-600">{vendor.averageRating}</td>
                        <td className="py-3 px-4 text-gray-600">
                          <input type="checkbox" checked={editForm.isFeatured} onChange={(e) => setEditForm({...editForm, isFeatured: e.target.checked})} />
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <input type="checkbox" checked={editForm.isVerified} onChange={(e) => setEditForm({...editForm, isVerified: e.target.checked})} />
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})} />
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <button onClick={() => handleSave(vendor._id)} className="text-green-600 mr-2">Save</button>
                          <button onClick={() => setEditingVendor(null)} className="text-gray-600">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-medium text-gray-600">{vendor.name}</td>
                        <td className="py-3 px-4 text-gray-600">{vendor.category?.name || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{vendor.city || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{vendor.averageRating} ({vendor.totalReviews})</td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${vendor.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                            {vendor.isFeatured ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${vendor.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {vendor.isVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className={`px-2 py-1 rounded-full text-xs ${vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {vendor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <button onClick={() => handleEdit(vendor)} className="text-blue-600 mr-2">Edit</button>
                          <button onClick={() => handleDelete(vendor._id)} className="text-red-600">Deactivate</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">Page {pagination.page} of {pagination.pages}</span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVendors;
