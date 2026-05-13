import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { saveConsultation, savePrescription, getDiagnostics } from '../services/api';
import { toast } from 'react-toastify';

function DiagnosticSearch({ value, codeValue, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const search = async (q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    try {
      const { data } = await getDiagnostics(q);
      setResults(data);
      setShow(true);
    } catch {}
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (diag) => {
    setQuery(diag.libelle);
    setShow(false);
    onSelect(diag);
  };

  return (
    <div className="position-relative">
      <input type="text" className="form-control" value={query} onChange={handleChange}
             onFocus={() => query.length > 1 && setShow(true)}
             placeholder="Rechercher un diagnostic (CIM-10)..." />
      {codeValue && (
        <span className="badge bg-danger position-absolute top-50 end-0 translate-middle-y me-2">
          {codeValue}
        </span>
      )}
      {show && results.length > 0 && (
        <div className="dropdown-menu show w-100 shadow" style={{ maxHeight: 200, overflowY: 'auto' }}>
          {results.map(d => (
            <button key={d.id} className="dropdown-item py-2" type="button" onClick={() => handleSelect(d)}>
              <span className="badge bg-secondary me-2">{d.code}</span>
              <small>{d.libelle}</small>
              {d.frequence_utilisation > 20 && (
                <span className="badge bg-warning text-dark ms-1 float-end">Fréquent</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MedecinPage() {
  const { patientId, dossierId } = useParams();
  const [activeTab, setActiveTab] = useState('anamnese');

  const [form, setForm] = useState({
    dossier_id: dossierId,
    // Anamnèse
    symptomes: '', dialogue_patient: '', ressenti_patient: '', medicaments_deja_pris: '',
    antecedents_medicaux: '', antecedents_chirurgicaux: '', antecedents_familiaux: '', histoire_maladie: '',
    // Examen
    etat_general: '', examen_neurologique: '', glasgow_score: '', pupilles: '', motricite: '',
    examen_locomoteur: '', examen_thorax: '', examen_abdomen: '', examen_urologique: '', autres_examens: '',
    // Diagnostic
    resume_syndromique: '', hypotheses_diagnostiques: '', diagnostic_retenu: '', code_cim10: '',
    // Traitement
    traitement_preventif: '', traitement_curatif: '', traitement_chirurgical: '',
    // Suivi
    surveillance: '', evolution: '', conclusion: ''
  });

  // Prescription séparée
  const [prescription, setPrescription] = useState({
    dossier_id: dossierId,
    medicaments: [{ nom: '', posologie: '', duree: '' }],
    posologie: '', duree_traitement: '', instructions_speciales: '', renouvellement: false
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await saveConsultation(form);
      toast.success('Consultation enregistrée.');
    } catch { toast.error('Erreur lors de l\'enregistrement.'); }
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    try {
      await savePrescription(prescription);
      toast.success('Prescription enregistrée.');
    } catch { toast.error('Erreur.'); }
  };

  const addMedicament = () => setPrescription(p => ({
    ...p,
    medicaments: [...p.medicaments, { nom: '', posologie: '', duree: '' }]
  }));

  const updateMed = (i, field, val) => setPrescription(p => {
    const meds = [...p.medicaments];
    meds[i] = { ...meds[i], [field]: val };
    return { ...p, medicaments: meds };
  });

  const tabs = [
    { key: 'anamnese', label: 'Anamnèse', icon: 'chat-left-text' },
    { key: 'examen', label: 'Examen Physique', icon: 'search' },
    { key: 'diagnostic', label: 'Diagnostic', icon: 'clipboard2-check' },
    { key: 'traitement', label: 'Traitement', icon: 'capsule' },
    { key: 'suivi', label: 'Suivi & Évolution', icon: 'graph-up' },
    { key: 'prescription', label: 'Ordonnance', icon: 'file-medical' },
  ];

  const TextArea = ({ field, label, rows = 3, placeholder = '' }) => (
    <div className="col-12">
      <label className="form-label fw-semibold">{label}</label>
      <textarea className="form-control" rows={rows} value={form[field]} placeholder={placeholder}
                onChange={e => set(field, e.target.value)} />
    </div>
  );

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
             style={{ width: 48, height: 48 }}>
          <i className="bi bi-clipboard2-pulse text-white fs-5"></i>
        </div>
        <div>
          <h4 className="mb-0 fw-bold">Consultation Médicale</h4>
          <small className="text-muted">Dossier #{dossierId} — Plan d'Observation Médicale</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs flex-nowrap overflow-auto">
            {tabs.map(t => (
              <li key={t.key} className="nav-item">
                <button className={`nav-link ${activeTab === t.key ? 'active fw-semibold' : ''}`}
                        onClick={() => setActiveTab(t.key)}>
                  <i className={`bi bi-${t.icon} me-1`}></i>
                  <span className="d-none d-sm-inline">{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSave}>
            {/* ANAMNÈSE */}
            {activeTab === 'anamnese' && (
              <div className="row g-3">
                <TextArea field="symptomes" label="🤒 Symptômes du patient" rows={4}
                          placeholder="Décrivez les symptômes rapportés par le patient..." />
                <TextArea field="dialogue_patient" label="💬 Dialogue avec le patient" rows={4}
                          placeholder="Ce que le patient dit, ses plaintes principales..." />
                <TextArea field="ressenti_patient" label="😟 Ressenti du patient" rows={3}
                          placeholder="Comment le patient se sent, son état psychologique..." />
                <TextArea field="medicaments_deja_pris" label="💊 Médicaments déjà pris" rows={2}
                          placeholder="Automédication ou traitements antérieurs..." />
                <hr className="my-2" />
                <h6 className="text-primary fw-bold">Antécédents</h6>
                <TextArea field="antecedents_medicaux" label="Antécédents médicaux" rows={2} />
                <TextArea field="antecedents_chirurgicaux" label="Antécédents chirurgicaux" rows={2} />
                <TextArea field="antecedents_familiaux" label="Antécédents familiaux" rows={2} />
                <TextArea field="histoire_maladie" label="Histoire de la maladie" rows={4} />
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* EXAMEN PHYSIQUE */}
            {activeTab === 'examen' && (
              <div className="row g-3">
                <TextArea field="etat_general" label="État Général" rows={2} />
                <div className="col-12"><h6 className="text-primary fw-bold">Examen Neurologique</h6></div>
                <TextArea field="examen_neurologique" label="Examen neurologique" rows={2} />
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Score de Glasgow (3-15)</label>
                  <input type="number" min="3" max="15" className="form-control" value={form.glasgow_score}
                         onChange={e => set('glasgow_score', e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Pupilles</label>
                  <input type="text" className="form-control" value={form.pupilles}
                         onChange={e => set('pupilles', e.target.value)}
                         placeholder="Isocorie, réactives..." />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Motricité</label>
                  <input type="text" className="form-control" value={form.motricite}
                         onChange={e => set('motricite', e.target.value)} />
                </div>
                <TextArea field="examen_locomoteur" label="Examen Locomoteur" rows={2} />
                <TextArea field="examen_thorax" label="Examen Thorax / Cardiovasculaire" rows={2} />
                <TextArea field="examen_abdomen" label="Examen Abdomen" rows={2} />
                <TextArea field="examen_urologique" label="Examen Urologique" rows={2} />
                <TextArea field="autres_examens" label="Autres examens" rows={2} />
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* DIAGNOSTIC */}
            {activeTab === 'diagnostic' && (
              <div className="row g-3">
                <TextArea field="resume_syndromique" label="Résumé Syndromique" rows={3} />
                <TextArea field="hypotheses_diagnostiques" label="Hypothèses Diagnostiques" rows={3} />
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-search me-1 text-danger"></i>
                    Diagnostic Retenu (CIM-10)
                  </label>
                  <DiagnosticSearch
                    value={form.diagnostic_retenu}
                    codeValue={form.code_cim10}
                    onSelect={(d) => {
                      set('diagnostic_retenu', d.libelle);
                      set('code_cim10', d.code);
                    }}
                  />
                  <small className="text-muted">Tapez pour rechercher dans la liste CIM-10</small>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* TRAITEMENT */}
            {activeTab === 'traitement' && (
              <div className="row g-3">
                <TextArea field="traitement_preventif" label="Traitement Préventif" rows={3} />
                <TextArea field="traitement_curatif" label="Traitement Curatif (médicamenteux)" rows={4} />
                <TextArea field="traitement_chirurgical" label="Traitement Chirurgical / Physique" rows={3} />
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* SUIVI & ÉVOLUTION */}
            {activeTab === 'suivi' && (
              <div className="row g-3">
                <TextArea field="surveillance" label="Surveillance" rows={3}
                          placeholder="Paramètres à surveiller, fréquence..." />
                <TextArea field="evolution" label="Évolution" rows={4}
                          placeholder="Évolution clinique du patient..." />
                <TextArea field="conclusion" label="Conclusion" rows={4}
                          placeholder="Conclusion générale de la consultation..." />
                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-save me-2"></i>Sauvegarder la consultation
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* ORDONNANCE */}
          {activeTab === 'prescription' && (
            <form onSubmit={handleSavePrescription}>
              <div className="row g-3">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold mb-0">Médicaments prescrits</h6>
                    <button type="button" className="btn btn-outline-primary btn-sm" onClick={addMedicament}>
                      <i className="bi bi-plus me-1"></i>Ajouter
                    </button>
                  </div>
                  {prescription.medicaments.map((med, i) => (
                    <div key={i} className="card bg-light border-0 mb-2 p-3">
                      <div className="row g-2">
                        <div className="col-md-4">
                          <input type="text" className="form-control form-control-sm" placeholder="Médicament"
                                 value={med.nom} onChange={e => updateMed(i, 'nom', e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <input type="text" className="form-control form-control-sm" placeholder="Posologie"
                                 value={med.posologie} onChange={e => updateMed(i, 'posologie', e.target.value)} />
                        </div>
                        <div className="col-md-4">
                          <input type="text" className="form-control form-control-sm" placeholder="Durée"
                                 value={med.duree} onChange={e => updateMed(i, 'duree', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Durée totale du traitement</label>
                  <input type="text" className="form-control" value={prescription.duree_traitement}
                         onChange={e => setPrescription({...prescription, duree_traitement: e.target.value})} />
                </div>
                <div className="col-12">
                  <label className="form-label">Instructions spéciales</label>
                  <textarea className="form-control" rows={2} value={prescription.instructions_speciales}
                             onChange={e => setPrescription({...prescription, instructions_speciales: e.target.value})} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="renouvellement"
                           checked={prescription.renouvellement}
                           onChange={e => setPrescription({...prescription, renouvellement: e.target.checked})} />
                    <label className="form-check-label" htmlFor="renouvellement">
                      Ordonnance renouvelable
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-file-medical me-2"></i>Enregistrer l'ordonnance
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