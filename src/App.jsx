import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/login';
import Signup from './pages/signup';
import Home from './pages/home';
import EmailVerificationSent from './pages/email-verification-sent';
import VerifyEmail from './pages/verify-email';
import ResendVerification from './pages/resend-verification';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';
import WeddingBudget from './pages/budget';
import WeddingChecklist from './pages/checklist';
import WeddingVendors from './pages/vendors';
import ProtectedRoute from './ProtectedRoute';
import GuestsPage from './pages/guests';
import ProfilePage from './pages/profile';
import UserProfile from './pages/user-profile';
import SharedGallery from './pages/shared-gallery';
import AdminDashboard from './pages/admin';
import AdminUsers from './pages/admin/users';
import AdminVendors from './pages/admin/vendors';
import AdminGalleries from './pages/admin/galleries';
import AdminSettings from './pages/admin/settings';
import VendorPlans from './pages/vendors/plans';
import Support from './pages/support';
import About from './pages/about';
import Contact from './pages/contact';
import Privacy from './pages/privacy';
import Terms from './pages/terms';
import PublicGallery from './pages/public-gallery';
import Settings from './pages/settings';
import Gallery from './pages/gallery';
import GuestConfirm from './pages/guest-confirm';
import CalendarPage from './pages/calendar';
import VendorProfilePage from './pages/vendor';

function App() {
  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/email-verification-sent" element={<EmailVerificationSent />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/resend-verification" element={<ResendVerification />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/gallery/shared/:shareCode" element={<SharedGallery />} />
      <Route path="/profile/:userId" element={<UserProfile />} />
      <Route path="/vendors" element={<WeddingVendors />} />
      <Route path="/vendors/plans" element={<VendorPlans />} />
      <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
      <Route path="/support" element={<Support />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/public-gallery" element={<PublicGallery />} />
      <Route path="/guest-confirm/:token" element={<GuestConfirm />} />
      
      {/* Protected Routes - Require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/budget" element={<WeddingBudget />} />
        <Route path="/checklist" element={<WeddingChecklist />} />
        <Route path="/guests" element={<GuestsPage/>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/calendar" element={<CalendarPage />} />

        
        {/* Admin Routes - Require admin role */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/vendors" element={<AdminVendors />} />
        <Route path="/admin/galleries" element={<AdminGalleries />} />
        <Route path="/admin/settings" element={<AdminSettings />} />


      </Route>
    </Routes>
  );
}

export default App;
