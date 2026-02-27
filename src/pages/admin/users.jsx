import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAdminUsers, 
  updateAdminUser, 
  deleteAdminUser, 
  reactivateAdminUser 
} from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: '',
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [currentUser, pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const response = await getAdminUsers(params);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
    });
  };

  const handleSave = async (userId) => {
    try {
      const response = await updateAdminUser(userId, editForm);
      if (response.data.success) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }
    try {
      const response = await deleteAdminUser(userId);
      if (response.data.success) {
        toast.success('User deactivated successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user');
    }
  };

  const handleReactivate = async (userId) => {
    try {
      const response = await reactivateAdminUser(userId);
      if (response.data.success) {
        toast.success('User reactivated successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    }
  };

  if (loading && users.length === 0) {
    return <Loader />;
  }

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <Link to="/admin" className="text-[#9CAA8E] hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
            />
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="couple">Couple</option>
              <option value="vendor">Vendor</option>
            </select>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E]"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button
              onClick={() => setFilters({ role: '', isActive: '', search: '' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Verified</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    {editingUser === user._id ? (
                      <>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="admin">Admin</option>
                            <option value="couple">Couple</option>
                            <option value="vendor">Vendor</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={editForm.userType}
                            onChange={(e) => setEditForm({ ...editForm, userType: e.target.value })}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="bride">Bride</option>
                            <option value="groom">Groom</option>
                            <option value="vendor">Vendor</option>
                            <option value="wedding_planner">Wedding Planner</option>
                            <option value="other">Other</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={editForm.isEmailVerified}
                            onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                          />
                        </td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleSave(user._id)}
                            className="text-green-600 hover:underline mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="text-gray-600 hover:underline"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700' :
                            user.role === 'vendor' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.userType}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isEmailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isEmailVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            Edit
                          </button>
                          {user.isActive ? (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(user._id)}
                              className="text-green-600 hover:underline"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-[#9CAA8E] text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
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

export default AdminUsers;
