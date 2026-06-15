import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import CreateEditService from './pages/CreateEditService';
import Providers from './pages/Providers';
import ProviderProfilePublic from './pages/ProviderProfilePublic';
import Profile from './pages/Profile';
import RequestDetail from './pages/RequestDetail';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import ProviderDashboard from './pages/dashboards/ProviderDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/providers/:id" element={<ProviderProfilePublic />} />

          {/* Authenticated - any role */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/requests/:id" element={<RequestDetail />} />
          </Route>

          {/* Customer only */}
          <Route element={<ProtectedRoute roles={['customer']} />}>
            <Route path="/dashboard/customer" element={<CustomerDashboard />} />
          </Route>

          {/* Provider only */}
          <Route element={<ProtectedRoute roles={['provider']} />}>
            <Route path="/dashboard/provider" element={<ProviderDashboard />} />
            <Route path="/services/new" element={<CreateEditService />} />
            <Route path="/services/:id/edit" element={<CreateEditService />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
