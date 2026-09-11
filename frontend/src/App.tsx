import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Activities from './pages/admin/Activities';
import ActivityForm from './pages/admin/ActivityForm';
import Login from './pages/auth/Login';
import RegistrationForm from './pages/public/RegistrationForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/:activityId" element={<RegistrationForm />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="activities" element={<Activities />} />
          <Route path="activities/new" element={<ActivityForm />} />
          <Route path="activities/:id/edit" element={<ActivityForm />} />
          {/* Placeholders for future pages */}
          <Route path="participants" element={<div className="p-4">Participants List Placeholder</div>} />
          <Route path="interviews" element={<div className="p-4">Interviews Placeholder</div>} />
          <Route path="reports" element={<div className="p-4">Reports Placeholder</div>} />
          <Route path="masters" element={<div className="p-4">Masters Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
