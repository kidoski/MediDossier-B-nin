import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Dossierpatientpage from './pages/Dossierpatientpage';
import Consultations from './pages/Consultations';
import Utilisateurs from './pages/Utilisateurs';
import Constantes from './pages/Constantes';
import Antecedents from './pages/Antecedents';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
  if (!token) return <Navigate to="/login" />;
  if (utilisateur?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
        <Route path="/consultations/:patient_id" element={<PrivateRoute><Consultations /></PrivateRoute>} />
        <Route path="/constantes/:patient_id" element={<PrivateRoute><Constantes /></PrivateRoute>} />
        <Route path="/antecedents/:patient_id" element={<PrivateRoute><Antecedents /></PrivateRoute>} />
        <Route path="/patients/:id/dossier" element={<PrivateRoute><Dossierpatientpage /></PrivateRoute>} />
        <Route path="/utilisateurs" element={<AdminRoute><Utilisateurs /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;