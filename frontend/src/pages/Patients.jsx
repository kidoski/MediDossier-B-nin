import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPatients, ajouterPatient, rechercherPatient } from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', date_naissance: '', sexe: 'M',
    telephone: '', adresse: '', groupe_sanguin: 'O+'
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
  const isMedecin = utilisateur?.role === 'medecin';
  const isInfirmier = utilisateur?.role === 'infirmier';
  const isAdmin = utilisateur?.role === 'admin';

  useEffect(() => { chargerPatients(); }, []);

  const chargerPatients = async () => {
    const res = await getPatients();
    setPatients(res.data);
  };

  const handleRecherche = async (e) => {
    const q = e.target.value;
    setRecherche(q);
    if (q.length > 1) {
      const res = await rechercherPatient(q);
      setPatients(res.data);
    } else chargerPatients();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await ajouterPatient(form);
      setMessage(`✅ Patient ajouté ! NUD : ${res.data.NUD}`);
      setShowForm(false);
      chargerPatients();
    } catch (err) {
      setMessage('❌ Erreur lors de l\'ajout');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.navLogo}>+</div>
          <span style={styles.navTitre}>MediDossier Bénin</span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={styles.retour}>← Tableau de bord</button>
      </div>

      <div style={styles.contenu}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.titre}>👥 Patients</h1>
            <p style={styles.sousTitre}>{patients.length} patient(s) enregistré(s)</p>
          </div>
          {(isMedecin || isAdmin) && (
            <button onClick={() => setShowForm(!showForm)} style={styles.boutonAjouter}>
              + Nouveau Patient
            </button>
          )}
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {showForm && (isMedecin || isAdmin) && (
          <div style={styles.card}>
            <h3 style={styles.cardTitre}>Ajouter un patient</h3>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.champ}>
                <label style={styles.label}>Nom</label>
                <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Prénom</label>
                <input value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Date de naissance</label>
                <input type="date" value={form.date_naissance} onChange={e => setForm({...form, date_naissance: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Sexe</label>
                <select value={form.sexe} onChange={e => setForm({...form, sexe: e.target.value})} style={styles.input}>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Téléphone</label>
                <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Adresse</label>
                <input value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Groupe sanguin</label>
                <select value={form.groupe_sanguin} onChange={e => setForm({...form, groupe_sanguin: e.target.value})} style={styles.input}>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <button type="submit" style={styles.boutonSoumettre}>Enregistrer</button>
            </form>
          </div>
        )}

        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            placeholder="Rechercher par nom ou NUD..."
            value={recherche}
            onChange={handleRecherche}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>NUD</th>
                <th style={styles.th}>Nom complet</th>
                <th style={styles.th}>Naissance</th>
                <th style={styles.th}>Sexe</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Groupe</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}><span style={styles.nudBadge}>{p.NUD}</span></td>
                  <td style={styles.td}><strong>{p.nom} {p.prenom}</strong></td>
                  <td style={styles.td}>{new Date(p.date_naissance).toLocaleDateString('fr-FR')}</td>
                  <td style={styles.td}>{p.sexe === 'M' ? '👨 M' : '👩 F'}</td>
                  <td style={styles.td}>{p.telephone}</td>
                  <td style={styles.td}><span style={styles.groupeBadge}>{p.groupe_sanguin}</span></td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      {(isMedecin || isAdmin) && (
                        <button onClick={() => navigate(`/consultations/${p.id}`)} style={styles.btnBlue}>📋</button>
                      )}
                      {(isInfirmier || isMedecin || isAdmin) && (
                        <button onClick={() => navigate(`/constantes/${p.id}`)} style={styles.btnGreen}>🩺</button>
                      )}
                      {(isMedecin || isAdmin) && (
                        <button onClick={() => navigate(`/antecedents/${p.id}`)} style={styles.btnPurple}>📁</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  contenu: { maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  titre: { fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 4px' },
  sousTitre: { fontSize: '14px', color: '#888', margin: 0 },
  boutonAjouter: { padding: '10px 20px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  message: { padding: '12px 16px', backgroundColor: '#e8f5e9', borderRadius: '10px', marginBottom: '16px', color: '#2e7d32', fontSize: '14px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  cardTitre: { fontSize: '16px', fontWeight: '600', color: '#333', margin: '0 0 20px' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  champ: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#333' },
  boutonSoumettre: { gridColumn: 'span 2', padding: '12px', backgroundColor: '#43a047', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  searchBox: { position: 'relative', marginBottom: '20px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' },
  searchInput: { width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: 'white', boxSizing: 'border-box', color: '#333' },
  tableCard: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#1a73e8' },
  th: { padding: '14px 16px', textAlign: 'left', color: 'white', fontSize: '13px', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  nudBadge: { backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  groupeBadge: { backgroundColor: '#fce4ec', color: '#c2185b', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  actions: { display: 'flex', gap: '6px' },
  btnBlue: { padding: '6px 10px', backgroundColor: '#e8f0fe', color: '#1a73e8', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
  btnGreen: { padding: '6px 10px', backgroundColor: '#e8f5e9', color: '#43a047', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
  btnPurple: { padding: '6px 10px', backgroundColor: '#f3e5f5', color: '#8e24aa', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' },
};