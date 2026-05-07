import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUtilisateurs, ajouterUtilisateur, modifierUtilisateur, supprimerUtilisateur } from '../services/api';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showModifier, setShowModifier] = useState(false);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'medecin', telephone: '' });
  const [formModifier, setFormModifier] = useState({ nom: '', prenom: '', mot_de_passe: '' });
  const navigate = useNavigate();

  useEffect(() => { chargerUtilisateurs(); }, []);

  const chargerUtilisateurs = async () => {
    const res = await getUtilisateurs();
    setUtilisateurs(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ajouterUtilisateur(form);
      setMessage('✅ Utilisateur créé avec succès !');
      setShowForm(false);
      setForm({ nom: '', prenom: '', email: '', mot_de_passe: '', role: 'medecin', telephone: '' });
      chargerUtilisateurs();
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Erreur lors de la création'}`);
    }
  };

  const handleModifier = async (e) => {
    e.preventDefault();
    try {
      await modifierUtilisateur(utilisateurSelectionne.id, formModifier);
      setMessage('✅ Utilisateur modifié avec succès !');
      setShowModifier(false);
      setUtilisateurSelectionne(null);
      chargerUtilisateurs();
    } catch (err) {
      setMessage('❌ Erreur lors de la modification');
    }
  };

  const ouvrirModifier = (u) => {
    setUtilisateurSelectionne(u);
    setFormModifier({ nom: u.nom, prenom: u.prenom, mot_de_passe: '' });
    setShowModifier(true);
    setShowForm(false);
  };

  const handleSupprimer = async (id) => {
    if (window.confirm('Confirmer la suppression ?')) {
      try {
        await supprimerUtilisateur(id);
        setMessage('✅ Utilisateur supprimé !');
        chargerUtilisateurs();
      } catch (err) {
        setMessage('❌ Erreur lors de la suppression');
      }
    }
  };

  const roleConfig = {
    admin: { couleur: '#e53935', bg: '#fff3f3', label: 'Administrateur' },
    medecin: { couleur: '#1a73e8', bg: '#e8f0fe', label: 'Médecin' },
    infirmier: { couleur: '#43a047', bg: '#e8f5e9', label: 'Infirmier' },
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
            <h1 style={styles.titre}>👤 Utilisateurs</h1>
            <p style={styles.sousTitre}>{utilisateurs.length} utilisateur(s) enregistré(s)</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setShowModifier(false); }} style={styles.boutonAjouter}>
            + Nouvel Utilisateur
          </button>
        </div>

        {message && <div style={styles.message}>{message}</div>}

        {showForm && (
          <div style={styles.card}>
            <h3 style={styles.cardTitre}>Ajouter un utilisateur</h3>
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
                <label style={styles.label}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Mot de passe</label>
                <input type="password" value={form.mot_de_passe} onChange={e => setForm({...form, mot_de_passe: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Téléphone</label>
                <input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} style={styles.input} />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Rôle</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={styles.input}>
                  <option value="medecin">Médecin</option>
                  <option value="infirmier">Infirmier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" style={styles.boutonSoumettre}>Créer l'utilisateur</button>
            </form>
          </div>
        )}

        {showModifier && utilisateurSelectionne && (
          <div style={{...styles.card, borderLeft: '4px solid #fb8c00'}}>
            <h3 style={styles.cardTitre}>✏️ Modifier — {utilisateurSelectionne.prenom} {utilisateurSelectionne.nom}</h3>
            <form onSubmit={handleModifier} style={styles.form}>
              <div style={styles.champ}>
                <label style={styles.label}>Nom</label>
                <input value={formModifier.nom} onChange={e => setFormModifier({...formModifier, nom: e.target.value})} style={styles.input} required />
              </div>
              <div style={styles.champ}>
                <label style={styles.label}>Prénom</label>
                <input value={formModifier.prenom} onChange={e => setFormModifier({...formModifier, prenom: e.target.value})} style={styles.input} required />
              </div>
              <div style={{...styles.champ, gridColumn: 'span 2'}}>
                <label style={styles.label}>Nouveau mot de passe <span style={{color: '#aaa', fontWeight: '400'}}>(laisser vide pour ne pas changer)</span></label>
                <input type="password" placeholder="Nouveau mot de passe..." value={formModifier.mot_de_passe} onChange={e => setFormModifier({...formModifier, mot_de_passe: e.target.value})} style={styles.input} />
              </div>
              <button type="submit" style={{...styles.boutonSoumettre, backgroundColor: '#fb8c00'}}>Enregistrer les modifications</button>
              <button type="button" onClick={() => { setShowModifier(false); setUtilisateurSelectionne(null); }} style={{...styles.boutonSoumettre, backgroundColor: '#666'}}>Annuler</button>
            </form>
          </div>
        )}

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Nom complet</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map(u => {
                const config = roleConfig[u.role] || { couleur: '#666', bg: '#f5f5f5', label: u.role };
                return (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={{...styles.avatar, backgroundColor: config.bg, color: config.couleur}}>
                          {u.prenom?.[0]}{u.nom?.[0]}
                        </div>
                        <strong>{u.prenom} {u.nom}</strong>
                      </div>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.telephone}</td>
                    <td style={styles.td}>
                      <span style={{ backgroundColor: config.bg, color: config.couleur, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {config.label}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button onClick={() => ouvrirModifier(u)} style={styles.btnOrange}>✏️ Modifier</button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleSupprimer(u.id)} style={styles.btnRed}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
  contenu: { maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' },
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
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: '#fafafa' },
  boutonSoumettre: { padding: '12px', backgroundColor: '#43a047', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  tableCard: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#1a73e8' },
  th: { padding: '14px 16px', textAlign: 'left', color: 'white', fontSize: '13px', fontWeight: '600' },
  tr: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: '14px', color: '#333' },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600' },
  actions: { display: 'flex', gap: '8px' },
  btnOrange: { padding: '6px 12px', backgroundColor: '#fff3e0', color: '#fb8c00', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  btnRed: { padding: '6px 10px', backgroundColor: '#fff3f3', color: '#e53935', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
};