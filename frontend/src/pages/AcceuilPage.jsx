import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPatient, createPatient } from '../services/api';
import { toast } from 'react-toastify';

const STATUT_COLORS = {
  'En attente': 'warning',
  'En consultation': 'primary',
  'Hospitalisé': 'danger',
  'Libre': 'success'
};

export default function AccueilPage() {
  const [numeroPiece, setNumeroPiece] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(null); // patient trouvé
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type_piece: 'CNI', numero_piece: '',
    nom: '', prenom: '', date_naissance: '', lieu_naissance: '',
    sexe: 'M', profession: '', situation_matrimoniale: '', religion: '',
    ville: '', arrondissement: '', quartier: '', carre: '',
    telephone: '', contact_urgence_nom: '', contact_urgence_telephone: ''
  });
  const navigate = useNavigate();
  const inputRef = useRef();

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!numeroPiece.trim()) return;
    setSearching(true);
    setFound(null);
    setShowForm(false);

    try {
      const { data } = await searchPatient(numeroPiece.trim());
      if (data.found) {
        setFound(data.patient);
        toast.success('Patient trouvé !');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setShowForm(true);
        setForm(f => ({ ...f, numero_piece: numeroPiece.trim() }));
        toast.info('Patient non trouvé. Créez un nouveau dossier.');
      } else {
        toast.error('Erreur lors de la recherche.');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createPatient(form);
      toast.success('Dossier patient créé !');
      navigate(`/patients/${data.patient.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création.');
    }
  };

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* En-tête */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                 style={{ width: 48, height: 48 }}>
              <i className="bi bi-person-plus text-white fs-5"></i>
            </div>
            <div>
              <h4 className="mb-0 fw-bold">Accueil Patient</h4>
              <small className="text-muted">Recherche par numéro de pièce d'identité</small>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSearch} className="d-flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Entrez le numéro de pièce d'identité..."
                  value={numeroPiece}
                  onChange={e => setNumeroPiece(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary btn-lg px-4" disabled={searching}>
                  {searching ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search"></i>}
                </button>
              </form>
              <small className="text-muted mt-2 d-block">
                <i className="bi bi-info-circle me-1"></i>
                Appuyez sur Entrée pour lancer la recherche
              </small>
            </div>
          </div>

          {/* Patient trouvé */}
          {found && (
            <div className="card border-0 shadow-sm border-start border-success border-4 mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-check-circle-fill text-success fs-5"></i>
                      <h5 className="mb-0 fw-bold">{found.prenom} {found.nom}</h5>
                      <span className={`badge bg-${STATUT_COLORS[found.statut]}`}>{found.statut}</span>
                    </div>
                    <div className="row g-2 text-muted small">
                      <div className="col-md-6">
                        <i className="bi bi-calendar3 me-1"></i>
                        Né(e) le {new Date(found.date_naissance).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="col-md-6">
                        <i className="bi bi-telephone me-1"></i>{found.telephone || 'Non renseigné'}
                      </div>
                      <div className="col-md-6">
                        <i className="bi bi-card-text me-1"></i>{found.type_piece}: {found.numero_piece}
                      </div>
                      <div className="col-md-6">
                        <i className="bi bi-geo-alt me-1"></i>{found.ville || 'Non renseigné'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/patients/${found.id}/dossier`)}
                  >
                    <i className="bi bi-folder2-open me-2"></i>Voir Dossier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de création */}
          {showForm && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-warning text-dark border-0 py-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-plus fs-5"></i>
                  <h5 className="mb-0 fw-bold">Nouveau Dossier Patient</h5>
                </div>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleCreate}>
                  {/* Identification */}
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                    <i className="bi bi-card-text me-2"></i>Pièce d'Identité
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Type de pièce *</label>
                      <select className="form-select" value={form.type_piece} onChange={e => set('type_piece', e.target.value)} required>
                        <option value="CNI">CNI</option>
                        <option value="Biométrique">Biométrique (RAVEC)</option>
                        <option value="CIP">CIP</option>
                        <option value="Passeport">Passeport</option>
                      </select>
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Numéro de pièce *</label>
                      <input type="text" className="form-control" value={form.numero_piece}
                             onChange={e => set('numero_piece', e.target.value)} required />
                    </div>
                  </div>

                  {/* État civil */}
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                    <i className="bi bi-person me-2"></i>État Civil
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label">Nom *</label>
                      <input type="text" className="form-control" value={form.nom}
                             onChange={e => set('nom', e.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Prénom(s) *</label>
                      <input type="text" className="form-control" value={form.prenom}
                             onChange={e => set('prenom', e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Date de naissance *</label>
                      <input type="date" className="form-control" value={form.date_naissance}
                             onChange={e => set('date_naissance', e.target.value)} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Lieu de naissance</label>
                      <input type="text" className="form-control" value={form.lieu_naissance}
                             onChange={e => set('lieu_naissance', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Sexe *</label>
                      <select className="form-select" value={form.sexe} onChange={e => set('sexe', e.target.value)} required>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Profession</label>
                      <input type="text" className="form-control" value={form.profession}
                             onChange={e => set('profession', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Situation matrimoniale</label>
                      <select className="form-select" value={form.situation_matrimoniale}
                              onChange={e => set('situation_matrimoniale', e.target.value)}>
                        <option value="">-- Choisir --</option>
                        <option>Célibataire</option>
                        <option>Marié(e)</option>
                        <option>Divorcé(e)</option>
                        <option>Veuf/Veuve</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Religion</label>
                      <input type="text" className="form-control" value={form.religion}
                             onChange={e => set('religion', e.target.value)} />
                    </div>
                  </div>

                  {/* Adresse */}
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                    <i className="bi bi-geo-alt me-2"></i>Adresse
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-3">
                      <label className="form-label">Ville</label>
                      <input type="text" className="form-control" value={form.ville}
                             onChange={e => set('ville', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Arrondissement</label>
                      <input type="text" className="form-control" value={form.arrondissement}
                             onChange={e => set('arrondissement', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Quartier</label>
                      <input type="text" className="form-control" value={form.quartier}
                             onChange={e => set('quartier', e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Carré</label>
                      <input type="text" className="form-control" value={form.carre}
                             onChange={e => set('carre', e.target.value)} />
                    </div>
                  </div>

                  {/* Contacts */}
                  <h6 className="text-primary fw-bold mb-3 border-bottom pb-2">
                    <i className="bi bi-telephone me-2"></i>Contacts
                  </h6>
                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <label className="form-label">Téléphone patient</label>
                      <input type="tel" className="form-control" value={form.telephone}
                             onChange={e => set('telephone', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Personne à contacter</label>
                      <input type="text" className="form-control" value={form.contact_urgence_nom}
                             onChange={e => set('contact_urgence_nom', e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Tél. personne à contacter</label>
                      <input type="tel" className="form-control" value={form.contact_urgence_telephone}
                             onChange={e => set('contact_urgence_telephone', e.target.value)} />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success px-4 fw-semibold">
                      <i className="bi bi-save me-2"></i>Créer le Dossier
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}