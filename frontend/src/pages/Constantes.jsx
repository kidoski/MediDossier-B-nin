import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getConstantesPatient, ajouterConstantes, getPatient } from '../services/api';

export default function Constantes() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [constantes, setConstantes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
  const isInfirmier = utilisateur?.role === 'infirmier';
  const [form, setForm] = useState({ tension: '', temperature: '', poids: '', pouls: '', saturation: '', observations: '' });

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    const resPatient = await getPatient(patient_id);
    setPatient(resPatient.data);
    const resConstantes = await getConstantesPatient(patient_id);
    setConstantes(resConstantes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ajouterConstantes({ ...form, patient_id });
      setMessage('✅ Constantes vitales enregistrées !');
      setShowForm(false);
      setForm({ tension: '', temperature: '', poids: '', pouls: '', saturation: '', observations: '' });
      chargerDonnees();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'enregistrement');
    }
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
            <h1 style={styles.titre}>🩺 Constantes Vitales</h1>
            {patient && (
              <div style={styles.patientInfo}>
                <span style={styles.nudBadge}>{patient.NUD}</span>
                <span style={styles.patientNom}>{patient.prenom} {patient.nom}</span>
                <span style={styles.groupeBadge}>{patient.groupe_sanguin}</span>
              </div>
            )}
          </div>
          {isInfirmier && (
            <button onClick={() => setShowForm(!showForm)} style={styles.boutonAjouter}>+ Enregistrer</button>
          )}
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {showForm && isInfirmier && (
          <div style={styles.card}>
            <h3 style={styles.cardTitre}>Enregistrer les constantes vitales</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.champ}>
                <label style={styles.label}>💉 Tension artérielle</label>
                <input placeholder="120/80" value={form.tension} onChange={e => setForm({...form, tension: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>🌡️ Température (°C)</label>
                <input type="number" step="0.1" placeholder="37.5" value={form.temperature} onChange={e => setForm({...form, temperature: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>⚖️ Poids (kg)</label>
                <input type="number" step="0.1" placeholder="70" value={form.poids} onChange={e => setForm({...form, poids: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>❤️ Pouls (bpm)</label>
                <input type="number" placeholder="80" value={form.pouls} onChange={e => setForm({...form, pouls: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>🫁 Saturation O2 (%)</label>
                <input type="number" placeholder="98" value={form.saturation} onChange={e => setForm({...form, saturation: e.target.value})} style={styles.input} />
              </div>
              <div style={{...styles.champ, gridColumn: 'span 2'}}>
                <label style={styles.label}>Observations</label>
                <textarea placeholder="Observations..." value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} style={styles.textarea} rows={3} />
              </div>
              <button type="submit" style={{...styles.boutonSoumettre, gridColumn: 'span 2'}}>Enregistrer</button>
            </form>
          </div>
        )}

        <h2 style={styles.sectionTitre}>Historique — {constantes.length} mesure(s)</h2>

        {constantes.length === 0 ? (
          <div style={styles.vide}><p style={styles.videTexte}>🩺 Aucune constante enregistrée.</p></div>
        ) : (
          constantes.map(c => (
            <div key={c.id} style={styles.constanteCard}>
              <div style={styles.constanteHeader}>
                <span style={styles.dateLabel}>📅 {new Date(c.date_mesure).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                <span style={styles.infirmierLabel}>👩‍⚕️ {c.infirmier_prenom} {c.infirmier_nom}</span>
              </div>
              <div style={styles.constanteBody}>
                <div style={styles.grille}>
                  {c.tension && <div style={styles.mesure}><span style={styles.mesureLabel}>💉 Tension</span><span style={styles.mesureValeur}>{c.tension}</span></div>}
                  {c.temperature && <div style={styles.mesure}><span style={styles.mesureLabel}>🌡️ Température</span><span style={styles.mesureValeur}>{c.temperature}°C</span></div>}
                  {c.poids && <div style={styles.mesure}><span style={styles.mesureLabel}>⚖️ Poids</span><span style={styles.mesureValeur}>{c.poids} kg</span></div>}
                  {c.pouls && <div style={styles.mesure}><span style={styles.mesureLabel}>❤️ Pouls</span><span style={styles.mesureValeur}>{c.pouls} bpm</span></div>}
                  {c.saturation && <div style={styles.mesure}><span style={styles.mesureLabel}>🫁 Saturation</span><span style={styles.mesureValeur}>{c.saturation}%</span></div>}
                </div>
                {c.observations && <p style={styles.observations}><strong>Observations :</strong> {c.observations}</p>}
              </div>
            </div>
          ))
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
  boutonAjouter: { padding: '10px 20px', backgroundColor: '#43a047', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  message: { padding: '12px 16px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginBottom: '16px', color: '#2e7d32', fontSize: '14px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  cardTitre: { fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 20px' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  champ: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#333' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: 'white', resize: 'vertical', color: '#333' },
  boutonSoumettre: { padding: '12px', backgroundColor: '#43a047', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  sectionTitre: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' },
  vide: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' },
  videTexte: { color: '#888', fontSize: '15px' },
  constanteCard: { backgroundColor: 'white', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  constanteHeader: { backgroundColor: '#43a047', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { color: 'white', fontSize: '14px', fontWeight: '600' },
  infirmierLabel: { color: 'rgba(255,255,255,0.9)', fontSize: '13px' },
  constanteBody: { padding: '20px' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' },
  mesure: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1px solid #e8ecf0' },
  mesureLabel: { fontSize: '11px', color: '#888', textAlign: 'center' },
  mesureValeur: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  observations: { fontSize: '14px', color: '#555', margin: '12px 0 0', lineHeight: '1.5' },
};