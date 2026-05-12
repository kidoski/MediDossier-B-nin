import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [mot_de_passe, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    setErreur('');
    try {
      const res = await login({ email, mot_de_passe });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      navigate('/dashboard');
    } catch (err) {
      setErreur('Email ou mot de passe incorrect');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.top}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>+</div>
          <span style={styles.logoText}>MediDossier Bénin</span>
        </div>
        <h1 style={styles.topTitre}>Système de Gestion des Dossiers Médicaux</h1>
        <p style={styles.description}>
          Plateforme numérique de gestion des dossiers médicaux des patients au Bénin.
          Conçue pour les médecins, infirmiers et administrateurs des établissements de santé.
        </p>
        <div style={styles.features}>
          <div style={styles.feature}><span style={styles.featureIcon}></span><span style={styles.featureText}>Patients</span></div>
          <div style={styles.feature}><span style={styles.featureIcon}></span><span style={styles.featureText}>Consultations</span></div>
          <div style={styles.feature}><span style={styles.featureIcon}></span><span style={styles.featureText}>Constantes</span></div>
          <div style={styles.feature}><span style={styles.featureIcon}></span><span style={styles.featureText}>Antécédents</span></div>
        </div>
      </div>

      <div style={styles.bottom}>
        <div style={styles.card}>
          <h2 style={styles.cardTitre}>Connexion</h2>
          <p style={styles.cardSousTitre}>Entrez vos identifiants pour accéder à la plateforme</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.champ}>
              <label style={styles.label}>Adresse Email</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@hopital.bj"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.champ}>
              <label style={styles.label}>Mot de passe</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}></span>
                <input
                  type="password"
                  value={mot_de_passe}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {erreur && (
              <div style={styles.erreurBox}>
                <span> {erreur}</span>
              </div>
            )}

            <button type="submit" style={styles.bouton} disabled={chargement}>
              {chargement ? 'Connexion en cours...' : 'Se connecter →'}
            </button>
          </form>

          <p style={styles.footerText}>🏥 Réservé au personnel médical autorisé</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", backgroundColor: '#f8fafc' },
  top: { backgroundColor: '#1a73e8', padding: '14px 30px', textAlign: 'center', color: 'white' },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' },
  logoIcon: { width: '30px', height: '30px', backgroundColor: 'white', color: '#1a73e8', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' },
  logoText: { fontSize: '18px', fontWeight: 'bold', color: 'white' },
  topTitre: { fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '6px', lineHeight: '1.3' },
  description: { fontSize: '11px', color: 'rgba(255,255,255,0.85)', marginBottom: '10px', lineHeight: '1.5', maxWidth: '600px', margin: '0 auto 10px' },
  features: { display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' },
  feature: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', backgroundColor: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '8px', minWidth: '65px' },
  featureIcon: { fontSize: '18px' },
  featureText: { fontSize: '10px', color: 'white', fontWeight: '500' },
  bottom: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' },
  card: { backgroundColor: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e8ecf0' },
  cardTitre: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 8px', textAlign: 'center' },
  cardSousTitre: { fontSize: '14px', color: '#666', margin: '0 0 28px', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  champ: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: '#333' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', fontSize: '16px', zIndex: 1 },
  input: { width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '15px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', color: '#333' },
  erreurBox: { backgroundColor: '#fff3f3', border: '1px solid #ffcdd2', borderRadius: '8px', padding: '12px 16px', color: '#c62828', fontSize: '14px' },
  bouton: { padding: '14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' },
  footerText: { fontSize: '13px', color: '#888', textAlign: 'center', marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '16px' },
};