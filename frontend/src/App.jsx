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
  try {
    return JSON.parse(localStorage.getItem('utilisateur'));
  } catch {
    return null;
  }
};

const getToken = () => localStorage.getItem('token');

// ============================================================
// ROUTES PROTÉGÉES
// ============================================================

// Route de base — vérifie juste le token
const PrivateRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/login" />;
};

// Route Admin uniquement
const AdminRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// Route Médecin uniquement
const MedecinRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (!['medecin', 'admin'].includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

// Route Infirmier uniquement
const InfirmierRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (!['infirmier', 'admin', 'medecin'].includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

// Route Accueil uniquement
const AccueilRoute = ({ children }) => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;
  if (!['accueil', 'admin'].includes(user?.role)) return <Navigate to="/dashboard" />;
  return children;
};

// ============================================================
// REDIRECTION AUTOMATIQUE SELON LE RÔLE APRÈS LOGIN
// ============================================================
const HomeRedirect = () => {
  const user = getUser();
  if (!getToken()) return <Navigate to="/login" />;

  switch (user?.role) {
    case 'admin':
      return <Navigate to="/dashboard" />;
    case 'medecin':
      return <Navigate to="/medecin" />;
    case 'infirmier':
      return <Navigate to="/infirmier" />;
    case 'accueil':
      return <Navigate to="/accueil" />;
    default:
      return <Navigate to="/dashboard" />;
  }
};

// ============================================================
// APP
// ============================================================
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Page de connexion */}
        <Route path="/login" element={<Login />} />

        {/* Redirection automatique selon rôle */}
        <Route path="/" element={<HomeRedirect />} />

        {/* -------------------------------------------------- */}
        {/* ADMIN — tableau de bord, utilisateurs, tout voir    */}
        {/* -------------------------------------------------- */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/utilisateurs" element={
          <AdminRoute><Utilisateurs /></AdminRoute>
        } />
        <Route path="/patients" element={
          <PrivateRoute><Patients /></PrivateRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* ACCUEIL — recherche patient, création dossier       */}
        {/* -------------------------------------------------- */}
        <Route path="/accueil" element={
          <AccueilRoute><AcceuilPage /></AccueilRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* DOSSIER PATIENT UNIFIÉ — visible par tous           */}
        {/* -------------------------------------------------- */}
        <Route path="/patients/:id/dossier" element={
          <PrivateRoute><Dossierpatientpage /></PrivateRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* INFIRMIER — vitaux, pansements, enquête sociale     */}
        {/* -------------------------------------------------- */}
        <Route path="/infirmier" element={
          <InfirmierRoute><Patients /></InfirmierRoute>
        } />
        <Route path="/constantes/:patient_id" element={
          <InfirmierRoute><Constantes /></InfirmierRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* MÉDECIN — consultation, urgence, référence          */}
        {/* Types de passage : Consultation / Urgence / Référence */}
        {/* -------------------------------------------------- */}
        <Route path="/medecin" element={
          <MedecinRoute><Patients /></MedecinRoute>
        } />

        {/* Consultation normale */}
        <Route path="/consultations/:patient_id" element={
          <MedecinRoute><Consultations /></MedecinRoute>
        } />

        {/* Urgence */}
        <Route path="/urgence/:patient_id" element={
          <MedecinRoute><Consultations type="urgence" /></MedecinRoute>
        } />

        {/* Référence */}
        <Route path="/reference/:patient_id" element={
          <MedecinRoute><Consultations type="reference" /></MedecinRoute>
        } />

        {/* Antécédents */}
        <Route path="/antecedents/:patient_id" element={
          <MedecinRoute><Antecedents /></MedecinRoute>
        } />

        {/* -------------------------------------------------- */}
        {/* Page inconnue → retour login                        */}
        {/* -------------------------------------------------- */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;