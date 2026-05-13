import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('utilisateur')); }
  catch { return null; }
};

export default function Dashboard() {
  const user = getUser();
  const role = user?.role?.toLowerCase();

  if (role === 'admin') return <DashboardAdmin user={user} />;
  if (role === 'medecin') return <DashboardMedecin user={user} />;
  if (role === 'infirmier') return <DashboardInfirmier user={user} />;
  if (role === 'accueil') return <DashboardAccueil user={user} />;
  return <DashboardAdmin user={user} />;
}

function Navbar({ couleur = '#1a73e8', user }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    navigate('/login');
  };
  return (
    <div style={{ backgroundColor: couleur, padding: '14px 30px', display: 'flex',
      justifyContent: 'space-between', alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 20, fontWeight: 'bold', color: 'white' }}>+</div>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>MediDossier Bénin</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
          👤 {user?.prenom} {user?.nom}
        </span>
        <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white',
          padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          {user?.role?.toUpperCase()}
        </span>
        <button onClick={handleLogout} style={{ padding: '8px 16px',
          backgroundColor: 'rgba(255,255,255,0.15)', color: 'white',
          border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
          fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}

function CarteAction({ icone, titre, description, couleur, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: 'white', borderRadius: 16, padding: 24, cursor: 'pointer',
        boxShadow: hover ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        border: `1px solid ${hover ? couleur : '#e8ecf0'}`,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, backgroundColor: couleur + '20',
        borderRadius: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
        {icone}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', marginBottom: 4 }}>{titre}</div>
        <div style={{ fontSize: 13, color: '#888', lineHeight: 1.4 }}>{description}</div>
      </div>
      <span style={{ color: couleur, fontSize: 20 }}>→</span>
    </div>
  );
}

function StatCard({ icone, valeur, label, couleur }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0',
      display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, backgroundColor: couleur + '20',
        borderRadius: 12, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24 }}>
        {icone}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e' }}>{valeur}</div>
        <div style={{ fontSize: 13, color: '#888' }}>{label}</div>
      </div>
    </div>
  );
}

function Bonjour({ user, sousTitre, couleur }) {
  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  return (
    <div style={{ background: `linear-gradient(135deg, ${couleur}, ${couleur}cc)`,
      borderRadius: 16, padding: '28px 32px', color: 'white', marginBottom: 28 }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800 }}>
        {salut}, {user?.prenom} 👋
      </h2>
      <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>{sousTitre} — {date}</p>
    </div>
  );
}

// ============================================================
// DASHBOARD ADMIN
// ============================================================
function DashboardAdmin({ user }) {
  const navigate = useNavigate();
  const modules = [
    { icone: '👥', titre: 'Gestion des Patients', description: 'Voir et gérer tous les dossiers patients', couleur: '#1a73e8', lien: '/patients' },
    { icone: '👤', titre: 'Gestion des Utilisateurs', description: 'Créer et gérer les comptes du personnel médical', couleur: '#7c3aed', lien: '/utilisateurs' },
    { icone: '🩺', titre: 'Consultations', description: 'Voir toutes les consultations, urgences et références', couleur: '#059669', lien: '/patients' },
    { icone: '📊', titre: 'Rapports & Statistiques', description: 'Statistiques des activités du centre de santé', couleur: '#f59e0b', lien: '/patients' },
    { icone: '🏥', titre: 'Accueil Patient', description: 'Rechercher ou créer un dossier patient', couleur: '#0891b2', lien: '/accueil' },
    { icone: '⚙️', titre: 'Paramètres Système', description: 'Configuration du système et des services', couleur: '#6b7280', lien: '/utilisateurs' },
  ];
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar couleur="#1a1a2e" user={user} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <Bonjour user={user} sousTitre="Tableau de bord Administrateur" couleur="#1a1a2e" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icone="👥" valeur="—" label="Patients enregistrés" couleur="#1a73e8" />
          <StatCard icone="🩺" valeur="—" label="Consultations aujourd'hui" couleur="#059669" />
          <StatCard icone="🚨" valeur="—" label="Urgences du jour" couleur="#e53935" />
          <StatCard icone="👤" valeur="—" label="Utilisateurs actifs" couleur="#7c3aed" />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 16 }}>Modules disponibles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {modules.map((m, i) => <CarteAction key={i} {...m} onClick={() => navigate(m.lien)} />)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD MÉDECIN
// ============================================================
function DashboardMedecin({ user }) {
  const navigate = useNavigate();
  const actions = [
    { icone: '🔍', titre: 'Rechercher un Patient', description: 'Accéder au dossier par numéro de pièce', couleur: '#1a73e8', lien: '/patients' },
    { icone: '🩺', titre: 'Nouvelle Consultation', description: 'Ouvrir une consultation médicale', couleur: '#059669', lien: '/patients' },
    { icone: '🚨', titre: 'Prise en charge Urgence', description: 'Gérer une arrivée en urgence', couleur: '#e53935', lien: '/patients' },
    { icone: '📋', titre: 'Référence Patient', description: 'Référer un patient vers une autre structure', couleur: '#f57c00', lien: '/patients' },
    { icone: '📁', titre: 'Dossiers Médicaux', description: 'Consulter l\'historique complet des patients', couleur: '#7c3aed', lien: '/patients' },
    { icone: '🔒', titre: 'Clôturer un Dossier', description: 'Archiver un dossier après clôture médicale', couleur: '#6b7280', lien: '/patients' },
  ];
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0fdf4', fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar couleur="#059669" user={user} />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
        <Bonjour user={user} sousTitre="Espace Médecin — Dossiers & Consultations" couleur="#059669" />
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { label: '🩺 Consultation', couleur: '#1a73e8' },
            { label: '🚨 Urgence', couleur: '#e53935' },
            { label: '📋 Référence', couleur: '#f57c00' },
            { label: '🏥 Admission', couleur: '#7c3aed' },
          ].map((t, i) => (
            <span key={i} style={{ padding: '6px 16px', backgroundColor: t.couleur + '15',
              color: t.couleur, borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: `1px solid ${t.couleur}30` }}>
              {t.label}
            </span>
          ))}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 16 }}>Actions disponibles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {actions.map((a, i) => <CarteAction key={i} {...a} onClick={() => navigate(a.lien)} />)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD INFIRMIER
// ============================================================
function DashboardInfirmier({ user }) {
  const navigate = useNavigate();
  const actions = [
    { icone: '🔍', titre: 'Rechercher un Patient', description: 'Trouver un patient par numéro de pièce', couleur: '#1a73e8', lien: '/patients' },
    { icone: '❤️', titre: 'Constantes Vitales', description: 'Saisir tension, pouls, température, SaO2', couleur: '#e53935', lien: '/patients' },
    { icone: '🩹', titre: 'Pansements & Soins', description: 'Enregistrer un soin infirmier ou pansement', couleur: '#f59e0b', lien: '/patients' },
    { icone: '🔬', titre: 'Analyses Médicales', description: 'Saisir les résultats d\'analyses biomédicales', couleur: '#059669', lien: '/patients' },
    { icone: '🖼️', titre: 'Imagerie Médicale', description: 'Uploader radiographies, échographies, scanner', couleur: '#7c3aed', lien: '/patients' },
    { icone: '📋', titre: 'Enquête Sociale', description: 'Notes infirmières, prise en charge sociale', couleur: '#0891b2', lien: '/patients' },
  ];
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef3f2', fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar couleur="#e53935" user={user} />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
        <Bonjour user={user} sousTitre="Espace Infirmier — Soins & Constantes" couleur="#e53935" />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 16 }}>Mes actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {actions.map((a, i) => <CarteAction key={i} {...a} onClick={() => navigate(a.lien)} />)}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD ACCUEIL
// ============================================================
function DashboardAccueil({ user }) {
  const navigate = useNavigate();
  const [numeroPiece, setNumeroPiece] = useState('');
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eff6ff', fontFamily: "'Segoe UI', sans-serif" }}>
      <Navbar couleur="#0891b2" user={user} />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <Bonjour user={user} sousTitre="Agent d'Accueil — Gestion des arrivées" couleur="#0891b2" />
        <div style={{ backgroundColor: 'white', borderRadius: 16, padding: 28,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e8ecf0', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#333' }}>
            🔍 Recherche rapide patient
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="text"
              placeholder="Numéro de pièce d'identité (CNI, Passeport, RAVEC...)"
              value={numeroPiece}
              onChange={e => setNumeroPiece(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: 10,
                border: '2px solid #e0e0e0', fontSize: 15, outline: 'none' }}
            />
            <button
              onClick={() => { if (numeroPiece.trim()) navigate('/accueil'); }}
              style={{ padding: '12px 24px', backgroundColor: '#0891b2', color: 'white',
                border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Rechercher
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <CarteAction icone="➕" titre="Nouveau Patient" description="Enregistrer un nouveau patient" couleur="#0891b2" onClick={() => navigate('/accueil')} />
          <CarteAction icone="👥" titre="Liste des Patients" description="Voir tous les patients et leur statut" couleur="#1a73e8" onClick={() => navigate('/patients')} />
          <CarteAction icone="⏳" titre="Patients en Attente" description="Voir les patients en salle d'attente" couleur="#f59e0b" onClick={() => navigate('/patients')} />
          <CarteAction icone="🏥" titre="Patients Hospitalisés" description="Voir les patients hospitalisés" couleur="#e53935" onClick={() => navigate('/patients')} />
        </div>
      </div>
    </div>
  );
}