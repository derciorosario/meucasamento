import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminGalleries, deleteAdminGallery } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5005';

const AdminGalleries = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [galleries, setGalleries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({ search: '' });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchGalleries();
  }, [currentUser, pagination.page, filters]);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: pagination.limit, ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });
      
      const response = await getAdminGalleries(params);
      if (response.data.success) {
        setGalleries(response.data.data.galleries);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      toast.error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (galleryId) => {
    if (!window.confirm('Are you sure you want to delete this gallery?')) return;
    try {
      const response = await deleteAdminGallery(galleryId);
      if (response.data.success) {
        toast.success('Gallery deleted successfully');
        fetchGalleries();
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Failed to delete gallery');
    }
  };

  if (loading && galleries.length === 0) return <Loader />;
  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Galleries</h1>
          <Link to="/admin" className="text-[#9CAA8E] hover:underline">← Back to Dashboard</Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder="Search galleries..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] w-full md:w-64"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Cover</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Owner</th>
                  <th className="text-left py-3 px-4">Photos</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleries.map((gallery) => (
                  <tr key={gallery._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {gallery.coverImage ? (
                        <img 
                          src={`${API_URL}${gallery.coverImage}`} 
                          alt={gallery.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400">-</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{gallery.name}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{gallery.user?.name || 'Unknown'}</div>
                        <div className="text-gray-500 text-sm">{gallery.user?.email || ''}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{gallery.photos?.length || 0}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(gallery.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handleDelete(gallery._id)} 
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No galleries found.
          </div>
        )}

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

export default AdminGalleries;
