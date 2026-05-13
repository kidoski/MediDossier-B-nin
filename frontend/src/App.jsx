import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Dossierpatientpage from './pages/Dossierpatientpage';
import Consultations from './pages/Consultations';
import Utilisateurs from './pages/Utilisateurs';
import Constantes from './pages/Constantes';
import Antecedents from './pages/Antecedents';
import AcceuilPage from './pages/AcceuilPage';
import InfirmierPage from './pages/Infirmierpage';
import MedecinPage from './pages/Medecinpage';

// ============================================================
// HELPERS
// ============================================================
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('utilisateur')); }
  catch { return null; }
};
const getToken = () => localStorage.getItem('token');

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================
const PrivateRoute = ({ children }) =>
  getToken() ? children : <Navigate to="/login" />;

const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const MedecinRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (!['medecin', 'admin'].includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

const InfirmierRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (!['infirmier', 'admin', 'medecin'].includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

const AccueilRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (!['accueil', 'admin'].includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

// ============================================================
// REDIRECTION AUTOMATIQUE SELON LE RÔLE
// ============================================================
const HomeRedirect = () => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  // Tous les rôles vont au dashboard — il s'occupe d'afficher le bon contenu
  return <Navigate to="/dashboard" />;
};

// ============================================================
// APP
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Connexion */}
        <Route path="/login" element={<Login />} />

        {/* Racine → dashboard */}
        <Route path="/" element={<HomeRedirect />} />

        {/* -------------------------------------------------- */}
        {/* DASHBOARD — adapté selon le rôle                    */}
        {/* -------------------------------------------------- */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* ADMIN                                               */}
        {/* -------------------------------------------------- */}
        <Route path="/utilisateurs" element={
          <AdminRoute><Utilisateurs /></AdminRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* PATIENTS — accessible à tous les rôles connectés   */}
        {/* -------------------------------------------------- */}
        <Route path="/patients" element={
          <PrivateRoute><Patients /></PrivateRoute>
        } />
        <Route path="/patients/:id/dossier" element={
          <PrivateRoute><Dossierpatientpage /></PrivateRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* ACCUEIL                                             */}
        {/* -------------------------------------------------- */}
        <Route path="/accueil" element={
          <AccueilRoute><AcceuilPage /></AccueilRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* MÉDECIN                                             */}
        {/* -------------------------------------------------- */}
        <Route path="/patients/:patientId/dossier/:dossierId/medecin" element={
          <MedecinRoute><MedecinPage /></MedecinRoute>
        } />
        <Route path="/consultations/:patient_id" element={
          <MedecinRoute><Consultations /></MedecinRoute>
        } />
        <Route path="/urgence/:patient_id" element={
          <MedecinRoute><Consultations /></MedecinRoute>
        } />
        <Route path="/reference/:patient_id" element={
          <MedecinRoute><Consultations /></MedecinRoute>
        } />
        <Route path="/antecedents/:patient_id" element={
          <MedecinRoute><Antecedents /></MedecinRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* INFIRMIER                                           */}
        {/* -------------------------------------------------- */}
        <Route path="/patients/:patientId/dossier/:dossierId/infirmier" element={
          <InfirmierRoute><InfirmierPage /></InfirmierRoute>
        } />
        <Route path="/constantes/:patient_id" element={
          <InfirmierRoute><Constantes /></InfirmierRoute>
        } />

        {/* Page inconnue */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;