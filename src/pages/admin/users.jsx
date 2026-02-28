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
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import {
  UserCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/solid';

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
    isEmailVerified: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null, userName: '' });

  const [firstLoad,setFirstLoad]=useState('')

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [currentUser, pagination.page, filters, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: `${sortConfig.direction === 'asc' ? '' : '-'}${sortConfig.key}`,
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

      setFirstLoad(true)



    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setFirstLoad(true)
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
    setDeleteModal({ show: true, userId, userName: users.find(u => u._id === userId)?.name || 'this user' });
  };

  const confirmDelete = async () => {
    try {
      const response = await deleteAdminUser(deleteModal.userId);
      if (response.data.success) {
        toast.success('User deactivated successfully');
        setSelectedUsers([]);
        setDeleteModal({ show: false, userId: null, userName: '' });
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
        setSelectedUsers([]);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast.error('Failed to reactivate user');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    if (action === 'deactivate') {
      if (!window.confirm(`Deactivate ${selectedUsers.length} selected users?`)) return;
      
      try {
        await Promise.all(selectedUsers.map(id => deleteAdminUser(id)));
        toast.success(`${selectedUsers.length} users deactivated`);
        setSelectedUsers([]);
        fetchUsers();
      } catch (error) {
        toast.error('Failed to deactivate some users');
      }
    } else if (action === 'reactivate') {
      if (!window.confirm(`Reactivate ${selectedUsers.length} selected users?`)) return;
      
      try {
        await Promise.all(selectedUsers.map(id => reactivateAdminUser(id)));
        toast.success(`${selectedUsers.length} users reactivated`);
        setSelectedUsers([]);
        fetchUsers();
      } catch (error) {
        toast.error('Failed to reactivate some users');
      }
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

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.filter(i=>i.role!="admin").length === users.filter(i=>i.role!="admin").length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.filter(i=>i.role!="admin").map(u => u._id));
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'vendor':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'couple':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getUserTypeIcon = (type) => {
    switch(type) {
      case 'bride':
        return '👰';
      case 'groom':
        return '🤵';
      case 'wedding_planner':
        return '📋';
      case 'vendor':
        return '🏢';
      default:
        return '👤';
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage all users, their roles, permissions, and account status
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
                onClick={() => fetchUsers()}
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
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
              </div>
              <div className="p-3 bg-[#9CAA8E]/10 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-[#9CAA8E]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.isActive).length}
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
                <p className="text-sm font-medium text-gray-600">Verified Emails</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => u.isEmailVerified).length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {users.filter(u => {
                    const date = new Date(u.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <UserPlusIcon className="w-6 h-6 text-purple-600" />
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
                    placeholder="Search users by name or email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full text-gray-700 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent transition-all"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2  border rounded-lg transition-colors ${
                    showFilters || filters.role || filters.isActive || filters.isEmailVerified
                      ? 'bg-[#9CAA8E] text-white border-[#9CAA8E]'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FunnelIcon className="w-5 h-5" />
                </button>
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} selected
                  </span>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Deactivate Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('reactivate')}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    Reactivate Selected
                  </button>
                </div>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={filters.role}
                      onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                      className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All Roles</option>
                      <option value="couple">Couple</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                      className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
                    <select
                      value={filters.isEmailVerified}
                      onChange={(e) => setFilters({ ...filters, isEmailVerified: e.target.value })}
                      className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                    >
                      <option value="">All</option>
                      <option value="true">Verified</option>
                      <option value="false">Unverified</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ role: '', isActive: '', isEmailVerified: '', search: '' })}
                      className="w-full  px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
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

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6">
                    <input
                      type="checkbox"
                      checked={selectedUsers.filter(i=>i.role!="admin").length === users.filter(i=>i.role!="admin").length && users.filter(i=>i.role!="admin").length > 0}
                      onChange={toggleAllUsers}
                      className="w-4 h-4 text-[#9CAA8E] border-gray-300 rounded focus:ring-[#9CAA8E]"
                    />
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    User {getSortIcon('name')}
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    Email {getSortIcon('email')}
                  </th>
                  <th 
                    onClick={() => handleSort('role')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    User Role {getSortIcon('role')}
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    onClick={() => handleSort('createdAt')}
                    className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  >
                    Joined {getSortIcon('createdAt')}
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr 
                    key={user._id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      editingUser === user._id ? 'bg-[#9CAA8E]/5' : ''
                    } ${!user.isActive ? 'bg-gray-50/50' : ''}`}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        disabled={user.role=="admin"}
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 text-[#9CAA8E] border-gray-300 rounded focus:ring-[#9CAA8E]"
                      />
                    </td>
                    
                    {editingUser === user._id ? (
                      <>
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                            placeholder="Full name"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:border-transparent"
                            placeholder="Email address"
                          />
                        </td>
                        <td className="py-4 px-6">
                            <span className="text-gray-600">{editForm.role}</span>
                        </td>
                        <td className="py-4 px-6">
                          
                          <span className="text-gray-600">{editForm.userType}</span>
                        </td>
                        <td className="py-4 px-6">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isEmailVerified}
                              onChange={(e) => setEditForm({ ...editForm, isEmailVerified: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9CAA8E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </label>
                        </td>
                        <td className="py-4 px-6">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#9CAA8E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(user._id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
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
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt={user.name}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#9CAA8E]/20 to-[#9CAA8E]/30 flex items-center justify-center ring-2 ring-gray-200">
                                  <UserCircleIcon className="w-6 h-6 text-[#9CAA8E]" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">ID: {user._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getRoleBadgeColor(user.role)}`}>
                            {user.role === 'admin' && <ShieldExclamationIcon className="w-3 h-3 mr-1" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <span className="text-sm mr-1">{getUserTypeIcon(user.userType)}</span>
                            <span className="text-sm text-gray-600 capitalize">
                              {user.userType?.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isEmailVerified
                              ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                              : 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20'
                          }`}>
                            {user.isEmailVerified ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                Unverified
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.isActive
                              ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                              : 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                           
                           {user?.role!="admin"  && <>

                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 text-gray-500 hover:text-[#9CAA8E] transition-colors"
                              title="Edit user"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>

                             {user.isActive ? (
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Deactivate user"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(user._id)}
                                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                                title="Reactivate user"
                              >
                                <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                              </button>
                            )}
                            </>}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
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
              onClick={() => setDeleteModal({ show: false, userId: null, userName: '' })}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                  <XCircleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Deactivate User
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to deactivate <span className="font-semibold">{deleteModal.userName}</span>? This action can be reversed later.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteModal({ show: false, userId: null, userName: '' })}
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
    </div>
  );
};

export default AdminUsers;