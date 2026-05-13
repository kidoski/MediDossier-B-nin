import { useState, useEffect } from 'react';
import {
  getUtilisateurs,
  ajouterUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  getHopitaux,
} from '../services/api';

const ROLES = ['admin', 'medecin', 'infirmier', 'accueil'];

const FORM_VIDE = {
  nom: '',
  prenom: '',
  login: '',
  email: '',
  mot_de_passe: '',
  role: 'infirmier',
  service: '',
  hopital_id: '',
  actif: true,
};

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [hopitaux, setHopitaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ texte: '', type: '' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [editId, setEditId] = useState(null); // null = création, sinon id = modification
  const [confirmSupprId, setConfirmSupprId] = useState(null);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const [resU, resH] = await Promise.all([getUtilisateurs(), getHopitaux()]);
      setUtilisateurs(resU.data);
      setHopitaux(resH.data || []);
    } catch {
      afficherMessage('Erreur lors du chargement.', 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const afficherMessage = (texte, type = 'succes') => {
    setMessage({ texte, type });
    setTimeout(() => setMessage({ texte: '', type: '' }), 4000);
  };

  const set = (champ, val) => setForm(f => ({ ...f, [champ]: val }));

  const ouvrirCreation = () => {
    setForm(FORM_VIDE);
    setEditId(null);
    setShowForm(true);
  };

  const ouvrirModification = (u) => {
    setForm({
      nom: u.nom || '',
      prenom: u.prenom || '',
      login: u.login || '',
      email: u.email || '',
      mot_de_passe: '', // ne pas pré-remplir le mot de passe
      role: u.role || 'infirmier',
      service: u.service || '',
      hopital_id: u.hopital_id || '',
      actif: u.actif ?? true,
    });
    setEditId(u.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // En modification, ne pas envoyer le mot de passe si vide
      if (editId && !payload.mot_de_passe) delete payload.mot_de_passe;

      if (editId) {
        await modifierUtilisateur(editId, payload);
        afficherMessage('Utilisateur modifié avec succès.');
      } else {
        await ajouterUtilisateur(payload);
        afficherMessage('Utilisateur créé avec succès.');
      }
      setShowForm(false);
      setEditId(null);
      charger();
    } catch (err) {
      afficherMessage(
        err.response?.data?.message || 'Erreur lors de l\'enregistrement.',
        'erreur'
      );
    }
  };

  const handleSupprimer = async (id) => {
    try {
      await supprimerUtilisateur(id);
      afficherMessage('Utilisateur supprimé.');
      setConfirmSupprId(null);
      charger();
    } catch {
      afficherMessage('Impossible de supprimer cet utilisateur.', 'erreur');
    }
  };

  const utilisateursFiltres = utilisateurs.filter(u =>
    `${u.prenom} ${u.nom} ${u.login} ${u.role} ${u.service || ''}`
      .toLowerCase()
      .includes(recherche.toLowerCase())
  );

  const couleurRole = (role) => {
    const c = { admin: '#7c3aed', medecin: '#059669', infirmier: '#e53935', accueil: '#0891b2' };
    return c[role] || '#6b7280';
  };

  return (
    <div style={s.page}>

      {/* EN-TÊTE */}
      <div style={s.header}>
        <div>
          <h1 style={s.titre}>👥 Gestion des utilisateurs</h1>
          <p style={s.sousTitre}>Créer et gérer les comptes du personnel médical.</p>
        </div>
        <button onClick={ouvrirCreation} style={s.boutonAjouter}>
          + Nouvel utilisateur
        </button>
      </div>

      {/* MESSAGE */}
      {message.texte && (
        <div style={{
          ...s.message,
          backgroundColor: message.type === 'erreur' ? '#fee2e2' : '#ecfdf5',
          color: message.type === 'erreur' ? '#b91c1c' : '#065f46',
        }}>
          {message.texte}
        </div>
      )}

      {/* FORMULAIRE CRÉATION / MODIFICATION */}
      {showForm && (
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitre}>
              {editId ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}
            </h2>
            <button onClick={() => setShowForm(false)} style={s.boutonFermer}>✕</button>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Identité */}
            <div style={s.sectionTitre}>Identité</div>
            <div style={s.grille2}>
              <div style={s.champ}>
                <label style={s.label}>Nom *</label>
                <input style={s.input} value={form.nom}
                       onChange={e => set('nom', e.target.value)} required />
              </div>
              <div style={s.champ}>
                <label style={s.label}>Prénom *</label>
                <input style={s.input} value={form.prenom}
                       onChange={e => set('prenom', e.target.value)} required />
              </div>
            </div>

            {/* Accès */}
            <div style={s.sectionTitre}>Accès</div>
            <div style={s.grille2}>
              <div style={s.champ}>
                <label style={s.label}>Login *</label>
                <input style={s.input} value={form.login}
                       onChange={e => set('login', e.target.value)} required />
              </div>
              <div style={s.champ}>
                <label style={s.label}>Email</label>
                <input type="email" style={s.input} value={form.email}
                       onChange={e => set('email', e.target.value)} />
              </div>
              <div style={s.champ}>
                <label style={s.label}>
                  {editId ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}
                </label>
                <input type="password" style={s.input} value={form.mot_de_passe}
                       onChange={e => set('mot_de_passe', e.target.value)}
                       required={!editId} />
              </div>
              <div style={s.champ}>
                <label style={s.label}>Rôle *</label>
                <select style={s.input} value={form.role}
                        onChange={e => set('role', e.target.value)} required>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Affectation */}
            <div style={s.sectionTitre}>Affectation</div>
            <div style={s.grille2}>
              <div style={s.champ}>
                <label style={s.label}>Service</label>
                <input style={s.input} placeholder="Ex: Pédiatrie, Urgences..."
                       value={form.service}
                       onChange={e => set('service', e.target.value)} />
              </div>
              {hopitaux.length > 0 && (
                <div style={s.champ}>
                  <label style={s.label}>Établissement</label>
                  <select style={s.input} value={form.hopital_id}
                          onChange={e => set('hopital_id', e.target.value)}>
                    <option value="">-- Choisir --</option>
                    {hopitaux.map(h => (
                      <option key={h.id} value={h.id}>{h.nom}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={s.champ}>
                <label style={s.label}>Compte actif</label>
                <select style={s.input} value={form.actif ? 'oui' : 'non'}
                        onChange={e => set('actif', e.target.value === 'oui')}>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </select>
              </div>
            </div>

            {/* Boutons */}
            <div style={s.boutons}>
              <button type="submit" style={s.boutonSauvegarder}>
                {editId ? '💾 Sauvegarder les modifications' : '✅ Créer l\'utilisateur'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={s.boutonAnnuler}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* BARRE DE RECHERCHE */}
      <div style={s.card}>
        <input
          style={{ ...s.input, marginBottom: 0 }}
          placeholder="🔍 Rechercher par nom, login, rôle, service..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
      </div>

      {/* LISTE */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={s.cardTitre}>Liste du personnel ({utilisateursFiltres.length})</h2>
        </div>

        {loading ? (
          <p style={{ color: '#888' }}>Chargement...</p>
        ) : utilisateursFiltres.length === 0 ? (
          <p style={{ color: '#888' }}>Aucun utilisateur trouvé.</p>
        ) : (
          utilisateursFiltres.map(u => (
            <div key={u.id} style={s.ligne}>
              {/* Avatar */}
              <div style={{ ...s.avatar, backgroundColor: couleurRole(u.role) + '20' }}>
                <span style={{ fontSize: 20 }}>
                  {u.role === 'admin' ? '⚙️' : u.role === 'medecin' ? '🩺' : u.role === 'infirmier' ? '💉' : '🏥'}
                </span>
              </div>

              {/* Infos */}
              <div style={{ flex: 1 }}>
                <div style={s.nom}>{u.prenom} {u.nom}</div>
                <div style={s.meta}>
                  <span>@{u.login}</span>
                  {u.email && <span> · {u.email}</span>}
                  {u.service && <span> · {u.service}</span>}
                </div>
              </div>

              {/* Badge rôle */}
              <span style={{ ...s.badge, backgroundColor: couleurRole(u.role) + '15', color: couleurRole(u.role) }}>
                {u.role}
              </span>

              {/* Badge actif */}
              <span style={{
                ...s.badge,
                backgroundColor: u.actif ? '#ecfdf5' : '#fee2e2',
                color: u.actif ? '#065f46' : '#b91c1c',
              }}>
                {u.actif ? 'Actif' : 'Inactif'}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => ouvrirModification(u)} style={s.boutonEdit}>
                  ✏️ Modifier
                </button>
                {confirmSupprId === u.id ? (
                  <>
                    <button onClick={() => handleSupprimer(u.id)} style={s.boutonConfirmer}>
                      ✓ Confirmer
                    </button>
                    <button onClick={() => setConfirmSupprId(null)} style={s.boutonAnnuler}>
                      ✕
                    </button>
                  </>
                ) : (
                  <button onClick={() => setConfirmSupprId(u.id)} style={s.boutonSupprimer}>
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '30px', fontFamily: "'Segoe UI', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titre: { fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 6px' },
  sousTitre: { margin: 0, color: '#4b5563' },
  boutonAjouter: { padding: '12px 22px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  message: { padding: '14px 18px', borderRadius: 12, marginBottom: 20, fontSize: 14 },
  card: { backgroundColor: 'white', borderRadius: 18, padding: 24, marginBottom: 20, boxShadow: '0 4px 16px rgba(15,23,42,0.07)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitre: { fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 },
  boutonFermer: { background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionTitre: { fontSize: 13, fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', paddingBottom: 6 },
  grille2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 },
  champ: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #d1d5db', fontSize: 14, outline: 'none', color: '#111827', backgroundColor: 'white' },
  boutons: { display: 'flex', gap: 12, paddingTop: 8 },
  boutonSauvegarder: { padding: '12px 24px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  boutonAnnuler: { padding: '12px 18px', backgroundColor: 'white', color: '#6b7280', border: '1.5px solid #d1d5db', borderRadius: 10, fontSize: 14, cursor: 'pointer' },
  ligne: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap' },
  avatar: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  nom: { fontSize: 15, fontWeight: 700, color: '#111827' },
  meta: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  boutonEdit: { padding: '7px 14px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 },
  boutonSupprimer: { padding: '7px 12px', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  boutonConfirmer: { padding: '7px 14px', backgroundColor: '#b91c1c', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 700 },
};
