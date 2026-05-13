import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAntecedentsPatient, ajouterAntecedent, supprimerAntecedent, getPatient } from '../services/api';

export default function Antecedents() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [antecedents, setAntecedents] = useState([]);
  const [patient, setPatient] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ type: 'medical', description: '', date_signalement: '' });

  useEffect(() => {
    chargerDonnees();
  }, [patient_id]);

  const chargerDonnees = async () => {
    setChargement(true);
    try {
      const [resPatient, resAntecedents] = await Promise.all([
        getPatient(patient_id),
        getAntecedentsPatient(patient_id)
      ]);
      setPatient(resPatient.data);
      setAntecedents(resAntecedents.data);
    } catch (err) {
      setMessage('Erreur de chargement des antécédents.');
    } finally {
      setChargement(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await ajouterAntecedent({ patient_id, ...form });
      setForm({ type: 'medical', description: '', date_signalement: '' });
      chargerDonnees();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de l’ajout.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await supprimerAntecedent(id);
      chargerDonnees();
    } catch (err) {
      setMessage('Impossible de supprimer l’antécédent.');
    }
  };

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(`/patients/${patient_id}/dossier`)} style={styles.backButton}>← Retour au dossier</button>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📝 Antécédents</h1>
          <p style={styles.subtitle}>{patient ? `${patient.prenom} ${patient.nom}` : `Patient ${patient_id}`}</p>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Ajouter un antécédent</h2>
          {message && <div style={styles.message}>{message}</div>}
          <form onSubmit={handleSubmit} style={styles.form}>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={styles.input}>
              <option value="medical">Médical</option>
              <option value="chirurgical">Chirurgical</option>
              <option value="familial">Familial</option>
              <option value="allergie">Allergie</option>
              <option value="autre">Autre</option>
            </select>
            <input
              type="date"
              value={form.date_signalement}
              onChange={(e) => setForm({ ...form, date_signalement: e.target.value })}
              style={styles.input}
            />
            <textarea
              rows={4}
              placeholder="Description de l'antécédent"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={styles.textarea}
              required
            />
            <button type="submit" style={styles.button}>Ajouter</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Historique des antécédents</h2>
          {chargement ? (
            <p>Chargement…</p>
          ) : antecedents.length === 0 ? (
            <p>Aucun antécédent enregistré.</p>
          ) : (
            antecedents.map((item) => (
              <div key={item.id} style={styles.item}>
                <div style={styles.row}>
                  <span style={styles.typeBadge}>{item.type}</span>
                  <button onClick={() => handleDelete(item.id)} style={styles.deleteButton}>Supprimer</button>
                </div>
                <p style={styles.description}>{item.description}</p>
                {item.date_signalement && <p style={styles.smallText}>Date signalement : {item.date_signalement}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '28px', fontFamily: "'Segoe UI', sans-serif" },
  backButton: { border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', marginBottom: '18px' },
  header: { marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0, color: '#111827' },
  subtitle: { margin: '8px 0 0', color: '#4b5563' },
  content: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  card: { backgroundColor: 'white', padding: '24px', borderRadius: '18px', boxShadow: '0 12px 30px rgba(15,23,42,0.08)' },
  cardTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '18px' },
  form: { display: 'grid', gap: '14px' },
  input: { padding: '14px 16px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  textarea: { padding: '14px 16px', borderRadius: '12px', border: '1px solid #d1d5db', resize: 'vertical', minHeight: '120px' },
  button: { padding: '12px 18px', borderRadius: '12px', border: 'none', backgroundColor: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: '700' },
  item: { borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
  typeBadge: { padding: '6px 12px', borderRadius: '999px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '700', textTransform: 'capitalize' },
  deleteButton: { color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer' },
  description: { margin: '10px 0 4px', color: '#111827' },
  smallText: { margin: 0, color: '#6b7280', fontSize: '13px' },
  message: { marginBottom: '12px', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#065f46' }
};
