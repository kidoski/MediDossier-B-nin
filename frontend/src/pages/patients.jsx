import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, searchPatient, createPatient } from '../services/api';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    type_piece: 'CNI',
    numero_piece: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    lieu_naissance: '',
    sexe: 'M',
    profession: '',
    situation_matrimoniale: '',
    religion: '',
    ville: '',
    arrondissement: '',
    quartier: '',
    carre: '',
    telephone: '',
    contact_urgence_nom: '',
    contact_urgence_telephone: ''
  });

  useEffect(() => {
    chargerPatients();
  }, []);

  const chargerPatients = async () => {
    setLoading(true);
    try {
      const res = await getPatients();
      setPatients(res.data.patients || []);
    } catch (err) {
      setMessage('Erreur de chargement des patients.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      chargerPatients();
      return;
    }

    setLoading(true);
    try {
      const res = await searchPatient(search.trim());
      if (res.data.found) {
        setPatients([res.data.patient]);
      } else {
        setPatients([]);
      }
    } catch (err) {
      setPatients([]);
      setMessage('Patient non trouvé. Vous pouvez créer un nouveau dossier.');
    } finally {
      setLoading(false);
    }
  };

  const submitPatient = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await createPatient(form);
      setMessage(res.data.message);
      setForm({
        type_piece: 'CNI',
        numero_piece: '',
        nom: '',
        prenom: '',
        date_naissance: '',
        lieu_naissance: '',
        sexe: 'M',
        profession: '',
        situation_matrimoniale: '',
        religion: '',
        ville: '',
        arrondissement: '',
        quartier: '',
        carre: '',
        telephone: '',
        contact_urgence_nom: '',
        contact_urgence_telephone: ''
      });
      chargerPatients();
      if (res.data.patient) {
        navigate(`/patients/${res.data.patient.id}/dossier`);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la création du patient.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Patients</h1>
          <p style={styles.subtitle}>Recherche, création et accès rapide aux dossiers patients.</p>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Recherche patient</h2>
          <div style={styles.searchRow}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par numéro de pièce"
              style={styles.searchInput}
            />
            <button onClick={handleSearch} style={styles.button}>Rechercher</button>
          </div>
          <button onClick={() => setSearch('') || chargerPatients()} style={styles.linkButton}>Réinitialiser</button>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Nouveau patient</h2>
          {message && <div style={styles.message}>{message}</div>}
          <form onSubmit={submitPatient} style={styles.formGrid}>
            <select value={form.type_piece} onChange={(e) => setForm({ ...form, type_piece: e.target.value })} style={styles.input}>
              <option value="CNI">CNI</option>
              <option value="Biométrique">Biométrique</option>
              <option value="CIP">CIP</option>
              <option value="Passeport">Passeport</option>
            </select>
            <input value={form.numero_piece} onChange={(e) => setForm({ ...form, numero_piece: e.target.value })} placeholder="Numéro de pièce" style={styles.input} required />
            <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom" style={styles.input} required />
            <input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} placeholder="Prénom" style={styles.input} required />
            <input type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} style={styles.input} required />
            <input value={form.lieu_naissance} onChange={(e) => setForm({ ...form, lieu_naissance: e.target.value })} placeholder="Lieu de naissance" style={styles.input} />
            <select value={form.sexe} onChange={(e) => setForm({ ...form, sexe: e.target.value })} style={styles.input}>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
              <option value="Autre">Autre</option>
            </select>
            <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="Téléphone" style={styles.input} />
            <input value={form.contact_urgence_nom} onChange={(e) => setForm({ ...form, contact_urgence_nom: e.target.value })} placeholder="Contact d'urgence" style={styles.input} />
            <input value={form.contact_urgence_telephone} onChange={(e) => setForm({ ...form, contact_urgence_telephone: e.target.value })} placeholder="Téléphone d'urgence" style={styles.input} />
            <input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="Profession" style={styles.input} />
            <input value={form.situation_matrimoniale} onChange={(e) => setForm({ ...form, situation_matrimoniale: e.target.value })} placeholder="Situation matrimoniale" style={styles.input} />
            <input value={form.religion} onChange={(e) => setForm({ ...form, religion: e.target.value })} placeholder="Religion" style={styles.input} />
            <input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} placeholder="Ville" style={styles.input} />
            <input value={form.arrondissement} onChange={(e) => setForm({ ...form, arrondissement: e.target.value })} placeholder="Arrondissement" style={styles.input} />
            <input value={form.quartier} onChange={(e) => setForm({ ...form, quartier: e.target.value })} placeholder="Quartier" style={styles.input} />
            <input value={form.carre} onChange={(e) => setForm({ ...form, carre: e.target.value })} placeholder="Carré" style={styles.input} />
            <button type="submit" style={{ ...styles.button, gridColumn: '1 / -1' }}>Créer le patient</button>
          </form>
        </div>
      </div>

      <div style={styles.cardList}>
        <h2 style={styles.cardTitle}>Liste des patients</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : patients.length === 0 ? (
          <p>Aucun patient trouvé.</p>
        ) : (
          patients.map((patient) => (
            <div key={patient.id} style={styles.patientCard}>
              <div>
                <div style={styles.patientName}>{patient.prenom} {patient.nom}</div>
                <div style={styles.patientMeta}>N° pièce : {patient.numero_piece}</div>
                <div style={styles.patientMeta}>Statut : {patient.statut || 'N/A'}</div>
              </div>
              <button onClick={() => navigate(`/patients/${patient.id}/dossier`)} style={styles.viewButton}>Voir dossier</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f4f6fb', padding: '30px', fontFamily: "'Segoe UI', sans-serif" },
  header: { marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0, color: '#1f2937' },
  subtitle: { marginTop: '8px', color: '#4b5563' },
  panel: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '30px' },
  card: { backgroundColor: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 16px 36px rgba(15,23,42,0.08)' },
  cardTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '18px', color: '#111827' },
  searchRow: { display: 'flex', gap: '12px', marginBottom: '14px' },
  searchInput: { flex: 1, padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' },
  button: { padding: '12px 18px', borderRadius: '12px', border: 'none', backgroundColor: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: '700' },
  linkButton: { marginTop: '8px', background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { padding: '12px 14px', borderRadius: '12px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', width: '100%' },
  message: { padding: '14px 16px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '12px', marginBottom: '14px' },
  cardList: { backgroundColor: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 16px 36px rgba(15,23,42,0.08)' },
  patientCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', borderBottom: '1px solid #e5e7eb' },
  patientName: { fontSize: '16px', fontWeight: '700', color: '#111827' },
  patientMeta: { fontSize: '14px', color: '#6b7280' },
  viewButton: { padding: '10px 18px', borderRadius: '12px', border: 'none', backgroundColor: '#10b981', color: 'white', cursor: 'pointer', fontWeight: '700' }
};
