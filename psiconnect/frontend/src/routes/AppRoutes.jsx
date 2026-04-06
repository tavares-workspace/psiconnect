import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/authUtils';
import Layout from '../components/Layout';

import LoginPage           from '../pages/LoginPage';
import RegisterPage        from '../pages/RegisterPage';
import DashboardPage       from '../pages/DashboardPage';
import PatientsPage        from '../pages/PatientsPage';
import PatientFormPage     from '../pages/PatientFormPage';
import PatientDetailPage   from '../pages/PatientDetailPage';
import AgendaPage          from '../pages/AgendaPage';
import AppointmentFormPage from '../pages/AppointmentFormPage';
import HistoryPage         from '../pages/HistoryPage';
import PipelinePage        from '../pages/PipelinePage';
import RemindersPage       from '../pages/RemindersPage';
import SettingsPage        from '../pages/SettingsPage';

function PrivateRoute({ children }) {
  return isAuthenticated()
    ? <Layout>{children}</Layout>
    : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        <Route path="/dashboard"             element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/patients"              element={<PrivateRoute><PatientsPage /></PrivateRoute>} />
        <Route path="/patients/new"          element={<PrivateRoute><PatientFormPage /></PrivateRoute>} />
        <Route path="/patients/:id"          element={<PrivateRoute><PatientDetailPage /></PrivateRoute>} />
        <Route path="/patients/:id/edit"     element={<PrivateRoute><PatientFormPage /></PrivateRoute>} />
        <Route path="/agenda"                element={<PrivateRoute><AgendaPage /></PrivateRoute>} />
        <Route path="/appointments/new"      element={<PrivateRoute><AppointmentFormPage /></PrivateRoute>} />
        <Route path="/appointments/:id/edit" element={<PrivateRoute><AppointmentFormPage /></PrivateRoute>} />
        <Route path="/history/:patientId"    element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="/pipeline"              element={<PrivateRoute><PipelinePage /></PrivateRoute>} />
        <Route path="/reminders"             element={<PrivateRoute><RemindersPage /></PrivateRoute>} />
        <Route path="/settings"              element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
