import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, getAdminDashboard } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  CalendarIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChartBarIcon,
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  UserPlusIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import {
  UserGroupIcon as UserGroupIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  PhotoIcon as PhotoIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month', 'year'

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboard();
  }, [user, timeRange]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard({ timeRange });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  if (loading) {
    return <Loader />;
  }

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hero Section with Welcome Message */}
      <div className="bg-white border-y border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
              <p className="mt-1 text-sm text-gray-500">
                Here's what's happening with your platform today.
              </p>
            </div>
            <div className="flex items-center gap-3 hidden">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
              </select>
              
              <button
                onClick={fetchDashboard}
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
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:border-[#9CAA8E]/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.users?.total)}</p>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{stats?.users?.growth || 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{formatNumber(stats?.users?.couples)}</span> Couples
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{formatNumber(stats?.users?.vendors)}</span> Vendors
                </span>
              </div>
            </div>
          </div>

          {/* Active Vendors Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:border-[#9CAA8E]/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Vendors</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.vendors?.active)}</p>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {Math.round((stats?.vendors?.active / stats?.users?.vendors) * 100)}% active
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{formatNumber(stats?.vendors?.featured)}</span> Featured
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{formatNumber(stats?.vendors?.verified)}</span> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Guest Management Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:border-[#9CAA8E]/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Guest Management</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.guests?.total)}</p>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Total Guests
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Confirmed</span>
                  <span className="text-xs font-medium text-gray-900">{stats?.guests?.confirmed}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${(stats?.guests?.confirmed / stats?.guests?.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Declined</span>
                  <span className="text-xs font-medium text-gray-900">{stats?.guests?.declined}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${(stats?.guests?.declined / stats?.guests?.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Stats Card */}
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:border-[#9CAA8E]/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Photo Gallery</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.albums?.total)}</p>
                  <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Albums
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                <PhotoIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Photos</p>
                <p className="text-xl font-semibold text-gray-900">{formatNumber(stats?.albums?.totalPhotos)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-xl font-semibold text-gray-900">{stats?.tasks?.completionRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden">
          {/* Today's Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Today's Activity</h3>
              <ClockIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="font-medium text-gray-900">+{stats?.activity?.newUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Vendors</span>
                <span className="font-medium text-gray-900">+{stats?.activity?.newVendors || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Photos Uploaded</span>
                <span className="font-medium text-gray-900">+{stats?.activity?.newPhotos || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="font-medium text-gray-900">{stats?.activity?.activeSessions || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Quick Stats</h3>
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className="font-medium text-gray-900">{stats?.users?.verified}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Rating</span>
                <span className="font-medium text-gray-900">{stats?.vendors?.avgRating || 0} ⭐</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Engagement Rate</span>
                <span className="font-medium text-gray-900">{stats?.engagement || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Returning Users</span>
                <span className="font-medium text-gray-900">{stats?.retention || 0}%</span>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Platform Health</h3>
              <TrophyIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Server Uptime</span>
                  <span className="text-xs font-medium text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">API Response</span>
                  <span className="text-xs font-medium text-green-600">120ms</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="text-xs font-medium text-gray-600">{stats?.storage?.used || 0}GB / {stats?.storage?.total || 100}GB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${(stats?.storage?.used / stats?.storage?.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Users</h3>
                <p className="text-sm text-gray-500 mb-4">View, edit, and manage user accounts</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  Go to Users <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            <Link
              to="/admin/vendors"
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BuildingStorefrontIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Vendors</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage vendor profiles</p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  Go to Vendors <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
            
            <Link
              to="/admin/galleries"
              className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <PhotoIcon className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Galleries</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage photo galleries</p>
                <div className="flex items-center text-pink-600 text-sm font-medium">
                  Go to Galleries <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="group hidden relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <ChartBarIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Analytics</h3>
                <p className="text-sm text-gray-500 mb-4">View detailed platform analytics</p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  View Reports <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
              <Link
                to="/admin/users"
                className="text-sm font-medium text-[#9CAA8E] hover:text-[#8B9A7E] transition-colors flex items-center"
              >
                View All <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="py-4 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentUsers?.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profileImage ? (
                            <img
                              src={`${API_URL}${user.profileImage}`}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#9CAA8E]/20 to-[#9CAA8E]/30 flex items-center justify-center ring-2 ring-gray-200">
                              <span className="text-[#9CAA8E] font-medium text-sm">
                                {user.name?.charAt(0)?.toUpperCase()}
                              </span>
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
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20'
                          : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                      }`}>
                        {user.isActive ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
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
                      <Link
                        to={`/profile/${user._id}`}
                        className="text-[#9CAA8E] hover:text-[#8B9A7E] transition-colors inline-flex items-center"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent users</h3>
              <p className="mt-1 text-sm text-gray-500">
                No users have registered recently.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;