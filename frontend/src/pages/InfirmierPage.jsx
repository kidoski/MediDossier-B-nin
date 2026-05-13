import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { saveVitaux, saveEnqueteSociale, savePansement, saveAnalyse, saveImagerie } from '../services/api';
import { toast } from 'react-toastify';

export default function InfirmierPage() {
  const { patientId, dossierId } = useParams();
  const [activeTab, setActiveTab] = useState('vitaux');

  // Vitaux
  const [vitaux, setVitaux] = useState({
    dossier_id: dossierId,
    tension_systolique: '', tension_diastolique: '', pouls: '',
    frequence_respiratoire: '', sao2: '', temperature: '',
    douleur_score: '0', poids: '', taille: ''
  });

  // Enquête sociale
  const [enquete, setEnquete] = useState({
    dossier_id: dossierId,
    prise_en_charge: 'Aucune', nom_assurance: '', numero_assurance: '',
    alcool: false, tabagisme: false, autres_addictions: '', notes: ''
  });

  // Pansement
  const [pansement, setPansement] = useState({
    dossier_id: dossierId,
    type_plaie: '', localisation: '', description: '',
    materiel_utilise: '', technique: '', observation: '',
    ordonnance: '', prochain_rdv: ''
  });

  // Analyse
  const [analyse, setAnalyse] = useState({
    dossier_id: dossierId,
    type_analyse: '', description: '', resultat: '',
    interpretation: '', laboratoire: '', technicien: ''
  });
  const [analyseFile, setAnalyseFile] = useState(null);

  // Imagerie
  const [imagerie, setImagerie] = useState({
    dossier_id: dossierId,
    type_image: 'Radiographie', region_anatomique: '',
    description: '', compte_rendu: '', radiologue: ''
  });
  const [imagerieFile, setImagerieFile] = useState(null);

  const handleSaveVitaux = async (e) => {
    e.preventDefault();
    try {
      await saveVitaux(vitaux);
      toast.success('Paramètres vitaux enregistrés.');
    } catch { toast.error('Erreur lors de l\'enregistrement.'); }
  };

  const handleSaveEnquete = async (e) => {
    e.preventDefault();
    try {
      await saveEnqueteSociale(enquete);
      toast.success('Enquête sociale enregistrée.');
    } catch { toast.error('Erreur lors de l\'enregistrement.'); }
  };

  const handleSavePansement = async (e) => {
    e.preventDefault();
    try {
      await savePansement(pansement);
      toast.success('Pansement enregistré.');
    } catch { toast.error('Erreur lors de l\'enregistrement.'); }
  };

  const handleSaveAnalyse = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(analyse).forEach(([k, v]) => fd.append(k, v));
    if (analyseFile) fd.append('fichier', analyseFile);
    try {
      await saveAnalyse(fd);
      toast.success('Analyse enregistrée.');
    } catch { toast.error('Erreur lors de l\'enregistrement.'); }
  };

  const handleSaveImagerie = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(imagerie).forEach(([k, v]) => fd.append(k, v));
    if (imagerieFile) fd.append('fichier', imagerieFile);
    try {
      await saveImagerie(fd);
      toast.success('Image médicale enregistrée.');
    } catch { toast.error('Erreur lors de l\'enregistrement.'); }
  };

  const tabs = [
    { key: 'vitaux', label: 'Paramètres vitaux', icon: 'activity' },
    { key: 'enquete', label: 'Enquête sociale', icon: 'people' },
    { key: 'pansement', label: 'Pansement', icon: 'bandaid' },
    { key: 'analyse', label: 'Analyse', icon: 'flask' },
    { key: 'imagerie', label: 'Imagerie', icon: 'image' },
  ];

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-success rounded-circle d-flex align-items-center justify-content-center"
             style={{ width: 48, height: 48 }}>
          <i className="bi bi-heart-pulse text-white fs-5"></i>
        </div>
        <div>
          <h4 className="mb-0 fw-bold">Module Infirmier</h4>
          <small className="text-muted">Dossier #{dossierId}</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            {tabs.map(t => (
              <li key={t.key} className="nav-item">
                <button className={`nav-link ${activeTab === t.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(t.key)}>
                  <i className={`bi bi-${t.icon} me-1`}></i>{t.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body p-4">

          {/* VITAUX */}
          {activeTab === 'vitaux' && (
            <form onSubmit={handleSaveVitaux}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Tension systolique (mmHg)</label>
                  <input type="number" className="form-control" value={vitaux.tension_systolique}
                         onChange={e => setVitaux({...vitaux, tension_systolique: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tension diastolique (mmHg)</label>
                  <input type="number" className="form-control" value={vitaux.tension_diastolique}
                         onChange={e => setVitaux({...vitaux, tension_diastolique: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Pouls (bpm)</label>
                  <input type="number" className="form-control" value={vitaux.pouls}
                         onChange={e => setVitaux({...vitaux, pouls: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Fréquence respiratoire</label>
                  <input type="number" className="form-control" value={vitaux.frequence_respiratoire}
                         onChange={e => setVitaux({...vitaux, frequence_respiratoire: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">SaO2 (%)</label>
                  <input type="number" step="0.1" className="form-control" value={vitaux.sao2}
                         onChange={e => setVitaux({...vitaux, sao2: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Température (°C)</label>
                  <input type="number" step="0.1" className="form-control" value={vitaux.temperature}
                         onChange={e => setVitaux({...vitaux, temperature: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Score douleur (0-10)</label>
                  <input type="range" className="form-range" min="0" max="10" value={vitaux.douleur_score}
                         onChange={e => setVitaux({...vitaux, douleur_score: e.target.value})} />
                  <div className="text-center fw-bold">{vitaux.douleur_score}/10</div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Poids (kg)</label>
                  <input type="number" step="0.1" className="form-control" value={vitaux.poids}
                         onChange={e => setVitaux({...vitaux, poids: e.target.value})} />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Taille (cm)</label>
                  <input type="number" className="form-control" value={vitaux.taille}
                         onChange={e => setVitaux({...vitaux, taille: e.target.value})} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-save me-2"></i>Enregistrer les vitaux
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ENQUÊTE SOCIALE */}
          {activeTab === 'enquete' && (
            <form onSubmit={handleSaveEnquete}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Prise en charge</label>
                  <select className="form-select" value={enquete.prise_en_charge}
                          onChange={e => setEnquete({...enquete, prise_en_charge: e.target.value})}>
                    <option>Aucune</option>
                    <option>Assurance</option>
                    <option>Administrative</option>
                  </select>
                </div>
                {enquete.prise_en_charge === 'Assurance' && <>
                  <div className="col-md-4">
                    <label className="form-label">Nom assurance</label>
                    <input type="text" className="form-control" value={enquete.nom_assurance}
                           onChange={e => setEnquete({...enquete, nom_assurance: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">N° assurance</label>
                    <input type="text" className="form-control" value={enquete.numero_assurance}
                           onChange={e => setEnquete({...enquete, numero_assurance: e.target.value})} />
                  </div>
                </>}
                <div className="col-12">
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="alcool"
                           checked={enquete.alcool} onChange={e => setEnquete({...enquete, alcool: e.target.checked})} />
                    <label className="form-check-label" htmlFor="alcool">Alcool</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input className="form-check-input" type="checkbox" id="tabac"
                           checked={enquete.tabagisme} onChange={e => setEnquete({...enquete, tabagisme: e.target.checked})} />
                    <label className="form-check-label" htmlFor="tabac">Tabagisme</label>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label">Notes infirmières</label>
                  <textarea className="form-control" rows={4} value={enquete.notes}
                             onChange={e => setEnquete({...enquete, notes: e.target.value})} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-save me-2"></i>Enregistrer l'enquête
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PANSEMENT */}
          {activeTab === 'pansement' && (
            <form onSubmit={handleSavePansement}>
              <div className="row g-3">
                {[
                  ['type_plaie', 'Type de plaie', 'text'],
                  ['localisation', 'Localisation', 'text'],
                ].map(([field, label, type]) => (
                  <div key={field} className="col-md-6">
                    <label className="form-label">{label}</label>
                    <input type={type} className="form-control" value={pansement[field]}
                           onChange={e => setPansement({...pansement, [field]: e.target.value})} />
                  </div>
                ))}
                {[
                  ['description', 'Description de la plaie'],
                  ['materiel_utilise', 'Matériel utilisé'],
                  ['technique', 'Technique de soin'],
                  ['observation', 'Observation'],
                  ['ordonnance', 'Ordonnance simple'],
                ].map(([field, label]) => (
                  <div key={field} className="col-12">
                    <label className="form-label">{label}</label>
                    <textarea className="form-control" rows={2} value={pansement[field]}
                              onChange={e => setPansement({...pansement, [field]: e.target.value})} />
                  </div>
                ))}
                <div className="col-md-4">
                  <label className="form-label">Prochain rendez-vous</label>
                  <input type="date" className="form-control" value={pansement.prochain_rdv}
                         onChange={e => setPansement({...pansement, prochain_rdv: e.target.value})} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-save me-2"></i>Enregistrer le pansement
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ANALYSE */}
          {activeTab === 'analyse' && (
            <form onSubmit={handleSaveAnalyse}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Type d'analyse *</label>
                  <input type="text" className="form-control" required value={analyse.type_analyse}
                         onChange={e => setAnalyse({...analyse, type_analyse: e.target.value})}
                         placeholder="NFS, Glycémie, Bilan rénal..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Laboratoire</label>
                  <input type="text" className="form-control" value={analyse.laboratoire}
                         onChange={e => setAnalyse({...analyse, laboratoire: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label">Résultat</label>
                  <textarea className="form-control" rows={3} value={analyse.resultat}
                             onChange={e => setAnalyse({...analyse, resultat: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label">Interprétation</label>
                  <textarea className="form-control" rows={2} value={analyse.interpretation}
                             onChange={e => setAnalyse({...analyse, interpretation: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fichier (PDF ou image)</label>
                  <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png"
                         onChange={e => setAnalyseFile(e.target.files[0])} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-save me-2"></i>Enregistrer l'analyse
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* IMAGERIE */}
          {activeTab === 'imagerie' && (
            <form onSubmit={handleSaveImagerie}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Type d'imagerie *</label>
                  <select className="form-select" value={imagerie.type_image}
                          onChange={e => setImagerie({...imagerie, type_image: e.target.value})}>
                    <option>Radiographie</option>
                    <option>Échographie</option>
                    <option>Scanner TDM</option>
                    <option>IRM</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Région anatomique</label>
                  <input type="text" className="form-control" value={imagerie.region_anatomique}
                         onChange={e => setImagerie({...imagerie, region_anatomique: e.target.value})} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Radiologue</label>
                  <input type="text" className="form-control" value={imagerie.radiologue}
                         onChange={e => setImagerie({...imagerie, radiologue: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label">Compte rendu</label>
                  <textarea className="form-control" rows={4} value={imagerie.compte_rendu}
                             onChange={e => setImagerie({...imagerie, compte_rendu: e.target.value})} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Fichier image ou PDF</label>
                  <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.pdf"
                         onChange={e => setImagerieFile(e.target.files[0])} />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-save me-2"></i>Enregistrer l'imagerie
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}