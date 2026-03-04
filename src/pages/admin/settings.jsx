import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminSettings, updateAdminSettings } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import Loader from '../../components/loader';
import { toast } from 'react-hot-toast';
import {
  Cog6ToothIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [settings, setSettings] = useState({
    tutorialVideos: {
      guests: '',
      checklist: '',
      budget: '',
      vendors: '',
      gallery: '',
      gifts: ''
    },
    siteSettings: {
      maintenanceMode: false,
      allowVendorRegistration: true,
      allowCoupleRegistration: true
    }
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await getAdminSettings();
      if (response.data.success) {
        setSettings(response.data.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateAdminSettings(settings);
      if (response.data.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handlePlayVideo = (sectionKey) => {
    const url = settings.tutorialVideos[sectionKey];
    if (url) {
      setPlayingVideo({ key: sectionKey, url });
    }
  };

  const closeVideoPlayer = () => {
    setPlayingVideo(null);
  };

  const tutorialSections = [
    { key: 'guests', label: 'Guests Page', placeholder: 'Enter YouTube URL for guests tutorial', color: 'green' },
    { key: 'checklist', label: 'Checklist Page', placeholder: 'Enter YouTube URL for checklist tutorial', color: 'blue' },
    { key: 'budget', label: 'Budget Page', placeholder: 'Enter YouTube URL for budget tutorial', color: 'yellow' },
    { key: 'vendors', label: 'Vendors Page', placeholder: 'Enter YouTube URL for vendors tutorial', color: 'purple' },
    { key: 'gallery', label: 'Gallery Page', placeholder: 'Enter YouTube URL for gallery tutorial', color: 'pink' },
    { key: 'gifts', label: 'Gifts Page', placeholder: 'Enter YouTube URL for gifts tutorial', color: 'red' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'border-gray-300 focus:ring-[#9CAA8E] focus:border-[#9CAA8E]',
      blue: 'border-gray-300 focus:ring-[#9CAA8E] focus:border-[#9CAA8E]',
      yellow: 'border-gray-300 focus:ring-[#9CAA8E] focus:border-[#9CAA8E]',
      purple: 'border-gray-300 focus:ring-[#9CAA8E] focus:border-[#9CAA8E]',
      pink: 'border-gray-300 focus:ring-[#9CAA8E] focus:border-[#9CAA8E]',
      red: 'border-gray-300 focus:ring-[#9CAA8E] focus:border-[#9CAA8E]'
    };
    return colors[color] || colors.green;
  };

  const getAccentColor = (color) => {
    const colors = {
      green: 'text-[#9CAA8E]',
      blue: 'text-[#9CAA8E]',
      yellow: 'text-[#9CAA8E]',
      purple: 'text-[#9CAA8E]',
      pink: 'text-[#9CAA8E]',
      red: 'text-[#9CAA8E]'
    };
    return colors[color] || colors.green;
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
      
      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white rounded-xl overflow-hidden max-w-4xl w-full">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {tutorialSections.find(s => s.key === playingVideo.key)?.label} Tutorial
              </h3>
              <button
                onClick={closeVideoPlayer}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(playingVideo.url)}?autoplay=1`}
                title="YouTube video player"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Cog6ToothIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">
                  Configure tutorial videos and site settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tutorial Videos Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
            <div className="flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5 text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900">Tutorial Videos</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Add YouTube video links for each section. You can preview videos directly in this page.
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorialSections.map((section) => {
                const hasVideo = settings.tutorialVideos[section.key];
                const videoId = getYouTubeVideoId(settings.tutorialVideos[section.key]);
                
                return (
                  <div key={section.key} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {section.label}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={settings.tutorialVideos[section.key] || ''}
                        onChange={(e) => handleInputChange('tutorialVideos', section.key, e.target.value)}
                        placeholder={section.placeholder}
                        className={`w-full px-4 py-3 pr-24 border-2 rounded-lg transition-all text-sm font-medium text-gray-700 placeholder-gray-400 bg-white ${getColorClasses(section.color)}`}
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {hasVideo && (
                          <button
                            onClick={() => handlePlayVideo(section.key)}
                            className={`p-1.5 rounded-lg ${getAccentColor(section.color)} bg-white hover:bg-gray-100 transition-colors`}
                            title="Play video"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                        )}
                        {hasVideo ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <ExclamationCircleIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </div>
                    {hasVideo && videoId && (
                      <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 rounded-lg">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                          alt="Video thumbnail"
                          className="w-24 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 truncate">
                            {settings.tutorialVideos[section.key]}
                          </p>
                          <button
                            onClick={() => handlePlayVideo(section.key)}
                            className={`text-xs font-medium ${getAccentColor(section.color)} hover:underline`}
                          >
                            Click to play preview
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {hasVideo ? 'Video link saved' : 'No video link added yet'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Site Settings Section */}
        <div className="bg-white hid rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Site Settings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure general site behavior and registration settings
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                <p className="text-sm text-gray-500">
                  When enabled, only admins can access the site
                </p>
              </div>
              <button
                onClick={() => handleInputChange('siteSettings', 'maintenanceMode', !settings.siteSettings.maintenanceMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:ring-offset-2 ${
                  settings.siteSettings.maintenanceMode ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.siteSettings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Vendor Registration */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Vendor Registration</h3>
                <p className="text-sm text-gray-500">
                  Allow new vendors to create accounts
                </p>
              </div>
              <button
                onClick={() => handleInputChange('siteSettings', 'allowVendorRegistration', !settings.siteSettings.allowVendorRegistration)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:ring-offset-2 ${
                  settings.siteSettings.allowVendorRegistration ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.siteSettings.allowVendorRegistration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Couple Registration */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Couple Registration</h3>
                <p className="text-sm text-gray-500">
                  Allow new couples to create accounts
                </p>
              </div>
              <button
                onClick={() => handleInputChange('siteSettings', 'allowCoupleRegistration', !settings.siteSettings.allowCoupleRegistration)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#9CAA8E] focus:ring-offset-2 ${
                  settings.siteSettings.allowCoupleRegistration ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.siteSettings.allowCoupleRegistration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={fetchSettings}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-[#9CAA8E] rounded-lg hover:bg-[#8B9A7E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CAA8E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
