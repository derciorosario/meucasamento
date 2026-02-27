import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAdminCategories, 
  createAdminCategory, 
  updateAdminCategory, 
  deleteAdminCategory 
} from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';

const API_URL = 'http://localhost:5005';

const AdminCategories = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', icon: '', description: '' });

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCategories();
  }, [currentUser]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getAdminCategories();
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const response = await updateAdminCategory(editingCategory, formData);
        if (response.data.success) {
          toast.success('Category updated successfully');
        }
      } else {
        const response = await createAdminCategory(formData);
        if (response.data.success) {
          toast.success('Category created successfully');
        }
      }
      setShowModal(false);
      setFormData({ name: '', slug: '', icon: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const response = await deleteAdminCategory(categoryId);
      if (response.data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <Loader />;
  if (currentUser?.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
          <div>
            <Link to="/admin" className="text-[#9CAA8E] hover:underline mr-4">← Back to Dashboard</Link>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', slug: '', icon: '', description: '' });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8a9980]"
            >
              Add Category
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">Icon</th>
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Slug</th>
                  <th className="text-left py-3 px-4">Description</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {category.icon ? (
                        <img src={`${API_URL}${category.icon}`} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600">{category.slug}</td>
                    <td className="py-3 px-4 text-gray-600">{category.description || '-'}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleEdit(category)} className="text-blue-600 mr-2">Edit</button>
                      <button onClick={() => handleDelete(category._id)} className="text-red-600">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories found. Create one to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Icon URL</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg hover:bg-[#8a9980]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
