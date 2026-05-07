import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getConsultationsPatient, creerConsultation, getPatient } from '../services/api';

export default function Consultations() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ motif: '', diagnostic: '', traitement: '', observations: '' });
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    const resPatient = await getPatient(patient_id);
    setPatient(resPatient.data);
    const resConsultations = await getConsultationsPatient(patient_id);
    setConsultations(resConsultations.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creerConsultation({ ...form, patient_id });
      setMessage('✅ Consultation enregistrée avec succès !');
      setShowForm(false);
      setForm({ motif: '', diagnostic: '', traitement: '', observations: '' });
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
            <h1 style={styles.titre}>📋 Consultations</h1>
            {patient && (
              <div style={styles.patientInfo}>
                <span style={styles.nudBadge}>{patient.NUD}</span>
                <span style={styles.patientNom}>{patient.prenom} {patient.nom}</span>
                <span style={styles.groupeBadge}>{patient.groupe_sanguin}</span>
              </div>
            )}
          </div>
          <button onClick={() => setShowForm(!showForm)} style={styles.boutonAjouter}>
            + Nouvelle Consultation
          </button>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {showForm && (
          <div style={styles.card}>
            <h3 style={styles.cardTitre}>Nouvelle consultation</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.champ}>
                <label style={styles.label}>Motif de consultation</label>
                <input placeholder="Ex: Fièvre, douleurs..." value={form.motif} onChange={e => setForm({...form, motif: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Diagnostic</label>
                <textarea placeholder="Diagnostic du médecin..." value={form.diagnostic} onChange={e => setForm({...form, diagnostic: e.target.value})} style={styles.textarea} rows={3} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Traitement prescrit</label>
                <textarea placeholder="Traitement recommandé..." value={form.traitement} onChange={e => setForm({...form, traitement: e.target.value})} style={styles.textarea} rows={3} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Observations</label>
                <textarea placeholder="Observations supplémentaires..." value={form.observations} onChange={e => setForm({...form, observations: e.target.value})} style={styles.textarea} rows={2} />
              </div>
              <button type="submit" style={styles.boutonSoumettre}>Enregistrer la consultation</button>
            </form>
          </div>
        )}

        <h2 style={styles.sectionTitre}>Historique — {consultations.length} consultation(s)</h2>

        {consultations.length === 0 ? (
          <div style={styles.vide}>
            <p style={styles.videTexte}>📋 Aucune consultation enregistrée pour ce patient.</p>
          </div>
        ) : (
          consultations.map(c => (
            <div key={c.id} style={styles.consultationCard}>
              <div style={styles.consultationHeader}>
                <div>
                  <span style={styles.dateLabel}>
                    📅 {new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <span style={styles.medecinLabel}>👨‍⚕️ Dr. {c.medecin_prenom} {c.medecin_nom}</span>
              </div>
              <div style={styles.consultationBody}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Motif</span>
                  <span style={styles.infoValue}>{c.motif}</span>
                </div>
                {c.diagnostic && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Diagnostic</span>
                    <span style={styles.infoValue}>{c.diagnostic}</span>
                  </div>
                )}
                {c.traitement && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Traitement</span>
                    <span style={styles.infoValue}>{c.traitement}</span>
                  </div>
                )}
                {c.observations && (
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Observations</span>
                    <span style={styles.infoValue}>{c.observations}</span>
                  </div>
                )}
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
  boutonAjouter: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  message: { padding: '12px 16px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginBottom: '16px', color: '#2e7d32', fontSize: '14px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  cardTitre: { fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  champ: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa', resize: 'vertical' },
  boutonSoumettre: { padding: '12px', backgroundColor: '#43a047', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  sectionTitre: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px' },
  vide: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' },
  videTexte: { color: '#888', fontSize: '15px' },
  consultationCard: { backgroundColor: 'white', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  consultationHeader: { backgroundColor: '#1a73e8', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { color: 'white', fontSize: '14px', fontWeight: '600' },
  medecinLabel: { color: 'rgba(255,255,255,0.9)', fontSize: '13px' },
  consultationBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  infoRow: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  infoLabel: { fontSize: '12px', fontWeight: '600', color: '#888', minWidth: '100px', textTransform: 'uppercase', paddingTop: '2px' },
  infoValue: { fontSize: '14px', color: '#333', flex: 1, lineHeight: '1.5' },
};