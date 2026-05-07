import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAntecedentsPatient, ajouterAntecedent, supprimerAntecedent, getPatient } from '../services/api';

export default function Antecedents() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [antecedents, setAntecedents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
  const isMedecin = utilisateur?.role === 'medecin';
  const isAdmin = utilisateur?.role === 'admin';
  const [form, setForm] = useState({ type: 'medical', description: '', date_signalement: '' });

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    const resPatient = await getPatient(patient_id);
    setPatient(resPatient.data);
    const resAntecedents = await getAntecedentsPatient(patient_id);
    setAntecedents(resAntecedents.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ajouterAntecedent({ ...form, patient_id });
      setMessage('✅ Antécédent ajouté avec succès !');
      setShowForm(false);
      setForm({ type: 'medical', description: '', date_signalement: '' });
      chargerDonnees();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout');
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await supprimerAntecedent(id);
        setMessage('✅ Antécédent supprimé !');
        chargerDonnees();
      } catch (err) {
        setMessage('❌ Erreur lors de la suppression');
      }
    }
  };

  const typeConfig = {
    medical: { couleur: '#1a73e8', bg: '#e8f0fe', emoji: '🏥', label: 'Médical' },
    chirurgical: { couleur: '#e53935', bg: '#fff3f3', emoji: '🔪', label: 'Chirurgical' },
    familial: { couleur: '#fb8c00', bg: '#fff3e0', emoji: '👨‍👩‍👧', label: 'Familial' },
    allergie: { couleur: '#8e24aa', bg: '#f3e5f5', emoji: '⚠️', label: 'Allergie' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navLogo}>+</div>
          <span style={styles.navTitre}>MediDossier Bénin</span>
        </div>
        <button onClick={() => navigate('/patients')} style={styles.retour}>← Patients</button>
      </div>

      <div style={styles.contenu}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titre}>📁 Antécédents Médicaux</h1>
            {patient && (
              <div style={styles.patientInfo}>
                <span style={styles.nudBadge}>{patient.NUD}</span>
                <span style={styles.patientNom}>{patient.prenom} {patient.nom}</span>
                <span style={styles.groupeBadge}>{patient.groupe_sanguin}</span>
              </div>
            )}
          </div>
          {(isMedecin || isAdmin) && (
            <button onClick={() => setShowForm(!showForm)} style={styles.boutonAjouter}>
              + Ajouter
            </button>
          )}
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {showForm && (isMedecin || isAdmin) && (
          <div style={styles.card}>
            <h3 style={styles.cardTitre}>Ajouter un antécédent</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.champ}>
                <label style={styles.label}>Type d'antécédent</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={styles.input}>
                  <option value="medical">🏥 Médical</option>
                  <option value="chirurgical">🔪 Chirurgical</option>
                  <option value="familial">👨‍👩‍👧 Familial</option>
                  <option value="allergie">⚠️ Allergie</option>
                </select>
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Date de signalement</label>
                <input type="date" value={form.date_signalement} onChange={e => setForm({...form, date_signalement: e.target.value})} style={styles.input} />
              </div>
              <div style={{...styles.champ, gridColumn: 'span 2'}}>
                <label style={styles.label}>Description</label>
                <textarea placeholder="Décrivez l'antécédent en détail..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={styles.textarea} rows={4} required />
              </div>
              <button type="submit" style={{...styles.boutonSoumettre, gridColumn: 'span 2'}}>Enregistrer l'antécédent</button>
            </form>
          </div>
        )}

        <h2 style={styles.sectionTitre}>Antécédents — {antecedents.length} enregistré(s)</h2>

        {antecedents.length === 0 ? (
          <div style={styles.vide}>
            <p style={styles.videTexte}>📁 Aucun antécédent enregistré pour ce patient.</p>
          </div>
        ) : (
          <div style={styles.grille}>
            {antecedents.map(a => {
              const config = typeConfig[a.type] || typeConfig.medical;
              return (
                <div key={a.id} style={styles.antecedentCard}>
                  <div style={styles.antecedentHeader}>
                    <span style={{ backgroundColor: config.bg, color: config.couleur, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {config.emoji} {config.label}
                    </span>
                    {(isMedecin || isAdmin) && (
                      <button onClick={() => handleSupprimer(a.id)} style={styles.boutonSupprimer}>🗑️</button>
                    )}
                  </div>
                  <p style={styles.antecedentDesc}>{a.description}</p>
                  {a.date_signalement && (
                    <p style={styles.antecedentDate}>📅 {new Date(a.date_signalement).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" },
  navbar: { backgroundColor: 'white', padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogo: { width: '34px', height: '34px', backgroundColor: '#1a73e8', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' },
  navTitre: { fontSize: '18px', fontWeight: 'bold', color: '#1a73e8' },
  retour: { padding: '8px 18px', backgroundColor: 'white', color: '#1a73e8', border: '1.5px solid #1a73e8', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  contenu: { maxWidth: '900px', margin: '0 auto', padding: '30px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titre: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 10px' },
  patientInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  nudBadge: { backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  patientNom: { fontSize: '15px', fontWeight: '600', color: '#333' },
  groupeBadge: { backgroundColor: '#fce4ec', color: '#c2185b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  boutonAjouter: { padding: '10px 20px', backgroundColor: '#8e24aa', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  message: { padding: '12px 16px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginBottom: '16px', color: '#2e7d32', fontSize: '14px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  cardTitre: { fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 20px' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  champ: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa', resize: 'vertical' },
  boutonSoumettre: { padding: '12px', backgroundColor: '#8e24aa', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  sectionTitre: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' },
  vide: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' },
  videTexte: { color: '#888', fontSize: '15px' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  antecedentCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  antecedentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  antecedentDesc: { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '0 0 10px' },
  antecedentDate: { fontSize: '12px', color: '#888', margin: 0 },
  boutonSupprimer: { padding: '4px 10px', backgroundColor: '#fff3f3', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
};