import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminDashboard } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';

const API_URL = 'http://localhost:5005';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.users?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-green-600">{stats?.users?.couples || 0} Couples</span>
              <span className="text-purple-600">{stats?.users?.vendors || 0} Vendors</span>
            </div>
          </div>

          {/* Active Vendors */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Vendors</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.vendors?.active || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-yellow-600">{stats?.vendors?.featured || 0} Featured</span>
            </div>
          </div>

          {/* Total Guests */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Guests</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.guests?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-green-600">{stats?.guests?.confirmed || 0} Confirmed</span>
              <span className="text-red-600">{stats?.guests?.declined || 0} Declined</span>
            </div>
          </div>

          {/* Albums */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Albums</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.albums?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 text-sm">
              <span className="text-gray-600">{stats?.tasks?.completionRate || 0}% Tasks Complete</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/admin/users"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Users</h3>
            <p className="text-gray-500 text-sm">View, edit, and manage user accounts</p>
          </Link>
          
          <Link
            to="/admin/vendors"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Vendors</h3>
            <p className="text-gray-500 text-sm">View and manage vendor profiles</p>
          </Link>
          
          <Link
            to="/admin/categories"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Categories</h3>
            <p className="text-gray-500 text-sm">Add, edit, and remove categories</p>
          </Link>
          
          <Link
            to="/admin/galleries"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Galleries</h3>
            <p className="text-gray-500 text-sm">View and manage photo galleries</p>
          </Link>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Registrations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Role</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentUsers?.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{user.name}</td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'vendor' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
