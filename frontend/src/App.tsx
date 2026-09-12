import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Activities from './pages/admin/Activities';
import ActivityForm from './pages/admin/ActivityForm';
import Login from './pages/auth/Login';
import RegistrationForm from './pages/public/RegistrationForm';
import ProtectedRoute from './components/ProtectedRoute';

import Participants from './pages/admin/Participants';
import ParticipantDetail from './pages/admin/ParticipantDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public: Registration form — home page goes directly to latest activity */}
        <Route path="/" element={<Navigate to="/register/1" replace />} />
        <Route path="/register/:activityId" element={<RegistrationForm />} />

        {/* Auth: Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected: Admin portal — requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="activities" element={<Activities />} />
            <Route path="activities/new" element={<ActivityForm />} />
            <Route path="activities/:id/edit" element={<ActivityForm />} />
            <Route path="participants" element={<Participants />} />
            <Route path="participants/:id" element={<ParticipantDetail />} />
            <Route path="interviews" element={<div className="p-4">Interviews — Coming soon</div>} />
            <Route path="reports" element={<div className="p-4">Reports — Coming soon</div>} />
            <Route path="masters" element={<div className="p-4">Masters — Coming soon</div>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
