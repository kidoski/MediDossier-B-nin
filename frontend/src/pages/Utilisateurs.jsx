import { useState, useEffect } from 'react';
import { getUtilisateurs } from '../services/api';

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    setLoading(true);
    try {
      const res = await getUtilisateurs();
      setUtilisateurs(res.data);
    } catch (err) {
      setMessage('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>👥 Gestion des utilisateurs</h1>
      <p style={styles.subtitle}>Liste des comptes du personnel autorisé.</p>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <span>Nom</span>
          <span>Login</span>
          <span>Rôle</span>
          <span>Service</span>
          <span>Actif</span>
        </div>
        {loading ? (
          <p>Chargement...</p>
        ) : utilisateurs.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          utilisateurs.map((user) => (
            <div key={user.id} style={styles.tableRow}>
              <span>{user.prenom} {user.nom}</span>
              <span>{user.login}</span>
              <span>{user.role}</span>
              <span>{user.service || '—'}</span>
              <span>{user.actif ? 'Oui' : 'Non'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '30px', fontFamily: "'Segoe UI', sans-serif" },
  title: { fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '10px' },
  subtitle: { margin: '0 0 22px', color: '#4b5563' },
  message: { marginBottom: '16px', padding: '14px 16px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '14px' },
  tableCard: { backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 16px 36px rgba(15,23,42,0.08)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 0.8fr', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: '700', color: '#374151' },
  tableRow: { display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1.2fr 0.8fr', gap: '16px', padding: '14px 0', borderBottom: '1px solid #f3f4f6', color: '#111827' }
};
