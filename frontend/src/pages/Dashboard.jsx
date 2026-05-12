import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, getUtilisateurs } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
  const isAdmin = utilisateur?.role === 'admin';
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalUtilisateurs, setTotalUtilisateurs] = useState(0);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const resPatients = await getPatients();
      setTotalPatients(resPatients.data.length);
      if (isAdmin) {
        const resUtilisateurs = await getUtilisateurs();
        setTotalUtilisateurs(resUtilisateurs.data.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const config = {
      admin: { couleur: '#e53935', bg: '#fff3f3', label: 'Administrateur' },
      medecin: { couleur: '#1a73e8', bg: '#e8f0fe', label: 'Médecin' },
      infirmier: { couleur: '#43a047', bg: '#e8f5e9', label: 'Infirmier' },
    };
    const c = config[role] || { couleur: '#666', bg: '#f5f5f5', label: role };
    return (
      <span style={{
        backgroundColor: c.bg,
        color: c.couleur,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        border: `1px solid ${c.couleur}22`,
      }}>
        {c.label}
      </span>
    );
  };

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navLogo}>+</div>
          <span style={styles.navTitre}>MediDossier Bénin</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {utilisateur?.prenom?.[0]}{utilisateur?.nom?.[0]}
            </div>
            <div>
              <p style={styles.userName}>{utilisateur?.prenom} {utilisateur?.nom}</p>
              <div>{getRoleBadge(utilisateur?.role)}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.boutonLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={styles.contenu}>

        {/* Bienvenue */}
        <div style={styles.bienvenue}>
          <div>
            <h1 style={styles.bienveneTitre}>
              Bonjour, {utilisateur?.prenom} 
            </h1>
            <p style={styles.bienveneSousTitre}>
              Bienvenue sur votre tableau de bord — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statIconBlue}>👥</div>
            <div>
              <p style={styles.statNombre}>{totalPatients}</p>
              <p style={styles.statLabel}>Patients enregistrés</p>
            </div>
          </div>
          {isAdmin && (
            <div style={styles.statCard}>
              <div style={styles.statIconGreen}>👤</div>
              <div>
                <p style={styles.statNombre}>{totalUtilisateurs}</p>
                <p style={styles.statLabel}>Utilisateurs actifs</p>
              </div>
            </div>
          )}
          <div style={styles.statCard}>
            <div style={styles.statIconOrange}>📅</div>
            <div>
              <p style={styles.statNombre}>{new Date().toLocaleDateString('fr-FR')}</p>
              <p style={styles.statLabel}>Date du jour</p>
            </div>
          </div>
        </div>

        {/* Modules */}
        <h2 style={styles.sectionTitre}>Modules disponibles</h2>
        <div style={styles.modules}>

          <div style={styles.module} onClick={() => navigate('/patients')}>
            <div style={{...styles.moduleIcon, backgroundColor: '#e8f0fe'}}>
              👥
            </div>
            <div style={styles.moduleInfo}>
              <h3 style={styles.moduleTitre}>Patients</h3>
              <p style={styles.moduleDesc}>Gérer les dossiers patients, ajouter et rechercher des patients</p>
            </div>
            <span style={styles.moduleArrow}>→</span>
          </div>

          {(utilisateur?.role === 'medecin' || isAdmin) && (
            <div style={styles.module} onClick={() => navigate('/patients')}>
              <div style={{...styles.moduleIcon, backgroundColor: '#e8f5e9'}}>
                📋
              </div>
              <div style={styles.moduleInfo}>
                <h3 style={styles.moduleTitre}>Consultations</h3>
                <p style={styles.moduleDesc}>Créer et consulter l'historique des consultations médicales</p>
              </div>
              <span style={styles.moduleArrow}>→</span>
            </div>
          )}

          <div style={styles.module} onClick={() => navigate('/patients')}>
            <div style={{...styles.moduleIcon, backgroundColor: '#fff3e0'}}>
              🩺
            </div>
            <div style={styles.moduleInfo}>
              <h3 style={styles.moduleTitre}>Constantes Vitales</h3>
              <p style={styles.moduleDesc}>Enregistrer et suivre les constantes vitales des patients</p>
            </div>
            <span style={styles.moduleArrow}>→</span>
          </div>

          {(utilisateur?.role === 'medecin' || isAdmin) && (
            <div style={styles.module} onClick={() => navigate('/patients')}>
              <div style={{...styles.moduleIcon, backgroundColor: '#f3e5f5'}}>
                📁
              </div>
              <div style={styles.moduleInfo}>
                <h3 style={styles.moduleTitre}>Antécédents Médicaux</h3>
                <p style={styles.moduleDesc}>Consulter et enregistrer les antécédents médicaux des patients</p>
              </div>
              <span style={styles.moduleArrow}>→</span>
            </div>
          )}

          {isAdmin && (
            <div style={styles.module} onClick={() => navigate('/utilisateurs')}>
              <div style={{...styles.moduleIcon, backgroundColor: '#fce4ec'}}>
                ⚙️
              </div>
              <div style={styles.moduleInfo}>
                <h3 style={styles.moduleTitre}>Gestion des Utilisateurs</h3>
                <p style={styles.moduleDesc}>Ajouter, modifier et gérer les comptes du personnel médical</p>
              </div>
              <span style={styles.moduleArrow}>→</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', sans-serif",
  },
  navbar: {
    backgroundColor: 'white',
    padding: '14px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e8ecf0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  navLogo: {
    width: '34px',
    height: '34px',
    backgroundColor: '#1a73e8',
    color: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  navTitre: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    backgroundColor: '#1a73e8',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    margin: '0 0 4px',
  },
  boutonLogout: {
    padding: '8px 18px',
    backgroundColor: 'white',
    color: '#e53935',
    border: '1.5px solid #e53935',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  contenu: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  bienvenue: {
    backgroundColor: '#1a73e8',
    borderRadius: '16px',
    padding: '24px 30px',
    marginBottom: '24px',
    color: 'white',
  },
  bienveneTitre: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    margin: '0 0 6px',
  },
  bienveneSousTitre: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    textTransform: 'capitalize',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8ecf0',
  },
  statIconBlue: {
    fontSize: '28px',
    backgroundColor: '#e8f0fe',
    padding: '12px',
    borderRadius: '12px',
  },
  statIconGreen: {
    fontSize: '28px',
    backgroundColor: '#e8f5e9',
    padding: '12px',
    borderRadius: '12px',
  },
  statIconOrange: {
    fontSize: '28px',
    backgroundColor: '#fff3e0',
    padding: '12px',
    borderRadius: '12px',
  },
  statNombre: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: '0 0 4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  sectionTitre: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  modules: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  module: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8ecf0',
    cursor: 'pointer',
    transition: 'transform 0.1s',
  },
  moduleIcon: {
    fontSize: '26px',
    padding: '12px',
    borderRadius: '12px',
    minWidth: '50px',
    textAlign: 'center',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitre: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a2e',
    margin: '0 0 4px',
  },
  moduleDesc: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  moduleArrow: {
    fontSize: '20px',
    color: '#1a73e8',
    fontWeight: 'bold',
  },
};