import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getConsultationsPatient, creerConsultation, getPatient } from '../services/api';

// ============================================================
// DIAGNOSTICS CIM-10 FRÉQUENTS AU BÉNIN
// ============================================================
const DIAGNOSTICS_CIM10 = [
  { code: 'B50', libelle: 'Paludisme à Plasmodium falciparum' },
  { code: 'B54', libelle: 'Paludisme non précisé' },
  { code: 'A01', libelle: 'Fièvre typhoïde' },
  { code: 'A09', libelle: 'Gastroentérite infectieuse' },
  { code: 'A15', libelle: 'Tuberculose pulmonaire' },
  { code: 'A91', libelle: 'Fièvre dengue' },
  { code: 'B20', libelle: 'Maladie par VIH' },
  { code: 'E11', libelle: 'Diabète de type 2' },
  { code: 'E10', libelle: 'Diabète de type 1' },
  { code: 'I10', libelle: 'Hypertension artérielle essentielle' },
  { code: 'I50', libelle: 'Insuffisance cardiaque' },
  { code: 'I63', libelle: 'Infarctus cérébral' },
  { code: 'J00', libelle: 'Rhinopharyngite aiguë' },
  { code: 'J18', libelle: 'Pneumonie non précisée' },
  { code: 'J45', libelle: 'Asthme' },
  { code: 'K29', libelle: 'Gastrite et duodénite' },
  { code: 'N39', libelle: 'Infections voies urinaires' },
  { code: 'O14', libelle: 'Prééclampsie' },
  { code: 'O80', libelle: 'Accouchement normal' },
  { code: 'S06', libelle: 'Traumatisme intracrânien' },
  { code: 'T14', libelle: 'Traumatisme non précisé' },
  { code: 'Z00', libelle: 'Examen médical général' },
  { code: 'E46', libelle: 'Malnutrition protéino-énergétique' },
  { code: 'A00', libelle: 'Choléra' },
];

const TYPE_PASSAGE = {
  consultation: { label: 'Consultation', couleur: '#1a73e8', icone: '🩺' },
  urgence:      { label: 'Urgence',      couleur: '#e53935', icone: '🚨' },
  reference:    { label: 'Référence',    couleur: '#f57c00', icone: '📋' },
};

export default function Consultations() {
  const { patient_id } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'consultation';
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [activeType, setActiveType] = useState(typeParam);
  const [rechercheDiag, setRechercheDiag] = useState('');
  const [showDiagList, setShowDiagList] = useState(false);

  const [form, setForm] = useState({
    type_passage: typeParam,
    // Anamnèse
    motif: '',
    symptomes: '',
    dialogue_patient: '',
    ressenti_patient: '',
    medicaments_deja_pris: '',
    antecedents: '',
    histoire_maladie: '',
    // Examen
    etat_general: '',
    examen_physique: '',
    glasgow_score: '',
    // Diagnostic
    hypotheses: '',
    diagnostic: '',
    code_cim10: '',
    // Traitement
    traitement: '',
    // Suivi
    surveillance: '',
    evolution: '',
    observations: '',
    // Urgence spécifique
    orientation: '',
    structure_reference: '',
    // Référence spécifique
    motif_reference: '',
    structure_envoi: '',
  });

  useEffect(() => { chargerDonnees(); }, [patient_id]);

  const chargerDonnees = async () => {
    try {
      const resPatient = await getPatient(patient_id);
      setPatient(resPatient.data);
      const resConsultations = await getConsultationsPatient(patient_id);
      setConsultations(resConsultations.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await creerConsultation({ ...form, patient_id, type_passage: activeType });
      setMessage('✅ Enregistré avec succès !');
      setShowForm(false);
      setForm({ ...form, motif: '', symptomes: '', dialogue_patient: '', ressenti_patient: '',
        medicaments_deja_pris: '', diagnostic: '', code_cim10: '', traitement: '',
        surveillance: '', evolution: '', observations: '' });
      chargerDonnees();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de l\'enregistrement');
    }
  };

  const selectionnerDiag = (diag) => {
    setForm({ ...form, diagnostic: diag.libelle, code_cim10: diag.code });
    setRechercheDiag(`${diag.code} — ${diag.libelle}`);
    setShowDiagList(false);
  };

  const diagsFiltres = DIAGNOSTICS_CIM10.filter(d =>
    d.libelle.toLowerCase().includes(rechercheDiag.toLowerCase()) ||
    d.code.toLowerCase().includes(rechercheDiag.toLowerCase())
  );

  const couleur = TYPE_PASSAGE[activeType]?.couleur || '#1a73e8';

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <div style={s.navbar}>
        <div style={s.navLeft}>
          <div style={{ ...s.navLogo, backgroundColor: couleur }}>+</div>
          <span style={{ ...s.navTitre, color: couleur }}>MediDossier Bénin</span>
        </div>
        <div style={s.navRight}>
          {patient && (
            <span style={s.patientBadge}>
              👤 {patient.prenom} {patient.nom}
            </span>
          )}
          <button onClick={() => navigate('/patients')} style={s.retour}>← Retour</button>
        </div>
      </div>

      <div style={s.contenu}>

        {/* SÉLECTEUR DE TYPE DE PASSAGE */}
        <div style={s.typeSelector}>
          {Object.entries(TYPE_PASSAGE).map(([key, val]) => (
            <button
              key={key}
              onClick={() => { setActiveType(key); setForm({ ...form, type_passage: key }); }}
              style={{
                ...s.typeBtn,
                backgroundColor: activeType === key ? val.couleur : 'white',
                color: activeType === key ? 'white' : val.couleur,
                border: `2px solid ${val.couleur}`,
              }}
            >
              {val.icone} {val.label}
            </button>
          ))}
        </div>

        {/* EN-TÊTE */}
        <div style={s.header}>
          <div>
            <h1 style={{ ...s.titre, color: couleur }}>
              {TYPE_PASSAGE[activeType]?.icone} {TYPE_PASSAGE[activeType]?.label}
            </h1>
            {patient && (
              <div style={s.patientInfo}>
                <span style={{ ...s.badge, backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                  {patient.NUD}
                </span>
                <span style={s.patientNom}>{patient.prenom} {patient.nom}</span>
                {patient.groupe_sanguin && (
                  <span style={{ ...s.badge, backgroundColor: '#fce4ec', color: '#c2185b' }}>
                    {patient.groupe_sanguin}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ ...s.boutonAjouter, backgroundColor: couleur }}
          >
            + Nouveau {TYPE_PASSAGE[activeType]?.label}
          </button>
        </div>

        {message && (
          <div style={{
            ...s.message,
            backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
            color: message.includes('✅') ? '#2e7d32' : '#c62828'
          }}>
            {message}
          </div>
        )}

        {/* FORMULAIRE */}
        {showForm && (
          <div style={{ ...s.card, borderTop: `4px solid ${couleur}` }}>
            <h3 style={{ ...s.cardTitre, color: couleur }}>
              {TYPE_PASSAGE[activeType]?.icone} Nouveau {TYPE_PASSAGE[activeType]?.label}
            </h3>
            <form onSubmit={handleSubmit} style={s.form}>

              {/* MOTIF — commun à tous */}
              <div style={s.section}>
                <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                  Motif
                </div>
                <Champ label="Motif *" required>
                  <input
                    style={s.input}
                    placeholder="Motif principal..."
                    value={form.motif}
                    onChange={e => setForm({ ...form, motif: e.target.value })}
                    required
                  />
                </Champ>
              </div>

              {/* ============================================ */}
              {/* CONSULTATION NORMALE */}
              {/* ============================================ */}
              {activeType === 'consultation' && (
                <>
                  {/* ANAMNÈSE */}
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                       Anamnèse — Ce que dit le patient
                    </div>
                    <div style={s.grid2}>
                      <Champ label="Symptômes du patient">
                        <textarea style={s.textarea} rows={3}
                          placeholder="Décrivez les symptômes rapportés..."
                          value={form.symptomes}
                          onChange={e => setForm({ ...form, symptomes: e.target.value })} />
                      </Champ>
                      <Champ label="Dialogue avec le patient">
                        <textarea style={s.textarea} rows={3}
                          placeholder="Ce que le patient dit, ses plaintes..."
                          value={form.dialogue_patient}
                          onChange={e => setForm({ ...form, dialogue_patient: e.target.value })} />
                      </Champ>
                      <Champ label="Ressenti du patient">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Comment se sent-il ? Anxieux, fatigué..."
                          value={form.ressenti_patient}
                          onChange={e => setForm({ ...form, ressenti_patient: e.target.value })} />
                      </Champ>
                      <Champ label="Médicaments déjà pris">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Automédication, traitements en cours..."
                          value={form.medicaments_deja_pris}
                          onChange={e => setForm({ ...form, medicaments_deja_pris: e.target.value })} />
                      </Champ>
                      <Champ label="Antécédents médicaux">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Maladies chroniques, chirurgies, allergies..."
                          value={form.antecedents}
                          onChange={e => setForm({ ...form, antecedents: e.target.value })} />
                      </Champ>
                      <Champ label="Histoire de la maladie">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Début, évolution, facteurs déclenchants..."
                          value={form.histoire_maladie}
                          onChange={e => setForm({ ...form, histoire_maladie: e.target.value })} />
                      </Champ>
                    </div>
                  </div>

                  {/* EXAMEN PHYSIQUE */}
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                      🔬 Examen Physique
                    </div>
                    <div style={s.grid2}>
                      <Champ label="État général">
                        <input style={s.input}
                          placeholder="Bon état général, altéré..."
                          value={form.etat_general}
                          onChange={e => setForm({ ...form, etat_general: e.target.value })} />
                      </Champ>
                      <Champ label="Score de Glasgow (si nécessaire)">
                        <input style={s.input} type="number" min="3" max="15"
                          placeholder="3 à 15"
                          value={form.glasgow_score}
                          onChange={e => setForm({ ...form, glasgow_score: e.target.value })} />
                      </Champ>
                    </div>
                    <Champ label="Examen physique complet">
                      <textarea style={s.textarea} rows={4}
                        placeholder="Neurologique, cardiovasculaire, respiratoire, abdominal, urologique..."
                        value={form.examen_physique}
                        onChange={e => setForm({ ...form, examen_physique: e.target.value })} />
                    </Champ>
                  </div>

                  {/* DIAGNOSTIC */}
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                       Diagnostic
                    </div>
                    <Champ label="Hypothèses diagnostiques">
                      <textarea style={s.textarea} rows={2}
                        placeholder="Maladies possibles à envisager..."
                        value={form.hypotheses}
                        onChange={e => setForm({ ...form, hypotheses: e.target.value })} />
                    </Champ>

                    {/* RECHERCHE CIM-10 */}
                    <Champ label="Diagnostic retenu (CIM-10) *">
                      <div style={{ position: 'relative' }}>
                        <input
                          style={{ ...s.input, borderColor: couleur }}
                          placeholder="Rechercher un diagnostic... (ex: paludisme, fièvre...)"
                          value={rechercheDiag}
                          onChange={e => { setRechercheDiag(e.target.value); setShowDiagList(true); }}
                          onFocus={() => setShowDiagList(true)}
                        />
                        {showDiagList && rechercheDiag.length > 0 && (
                          <div style={s.diagDropdown}>
                            {diagsFiltres.length === 0 ? (
                              <div style={s.diagItem}>Aucun résultat</div>
                            ) : (
                              diagsFiltres.map(d => (
                                <div
                                  key={d.code}
                                  style={s.diagItem}
                                  onClick={() => selectionnerDiag(d)}
                                  onMouseEnter={e => e.target.style.backgroundColor = '#f0f4ff'}
                                  onMouseLeave={e => e.target.style.backgroundColor = 'white'}
                                >
                                  <span style={{ ...s.cimBadge, backgroundColor: couleur }}>
                                    {d.code}
                                  </span>
                                  {d.libelle}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {form.code_cim10 && (
                        <div style={{ ...s.diagSelectionne, borderColor: couleur }}>
                           Sélectionné : <strong>{form.code_cim10}</strong> — {form.diagnostic}
                        </div>
                      )}
                    </Champ>
                  </div>

                  {/* TRAITEMENT */}
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                       Traitement
                    </div>
                    <Champ label="Traitement prescrit">
                      <textarea style={s.textarea} rows={4}
                        placeholder="Médicaments, posologie, durée, traitement préventif ou curatif..."
                        value={form.traitement}
                        onChange={e => setForm({ ...form, traitement: e.target.value })} />
                    </Champ>
                  </div>

                  {/* SUIVI */}
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                       Suivi & Évolution
                    </div>
                    <div style={s.grid2}>
                      <Champ label="Surveillance">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Paramètres à surveiller..."
                          value={form.surveillance}
                          onChange={e => setForm({ ...form, surveillance: e.target.value })} />
                      </Champ>
                      <Champ label="Évolution">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Évolution clinique du patient..."
                          value={form.evolution}
                          onChange={e => setForm({ ...form, evolution: e.target.value })} />
                      </Champ>
                    </div>
                    <Champ label="Observations / Conclusion">
                      <textarea style={s.textarea} rows={3}
                        placeholder="Conclusion générale de la consultation..."
                        value={form.observations}
                        onChange={e => setForm({ ...form, observations: e.target.value })} />
                    </Champ>
                  </div>
                </>
              )}

              {/* ============================================ */}
              {/* URGENCE */}
              {/* ============================================ */}
              {activeType === 'urgence' && (
                <>
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                       Prise en charge Urgence
                    </div>
                    <div style={s.grid2}>
                      <Champ label="Symptômes à l'arrivée">
                        <textarea style={s.textarea} rows={3}
                          placeholder="État du patient à l'arrivée aux urgences..."
                          value={form.symptomes}
                          onChange={e => setForm({ ...form, symptomes: e.target.value })} />
                      </Champ>
                      <Champ label="État général">
                        <input style={s.input}
                          placeholder="Conscient, inconscient, agité..."
                          value={form.etat_general}
                          onChange={e => setForm({ ...form, etat_general: e.target.value })} />
                      </Champ>
                      <Champ label="Score de Glasgow">
                        <input style={s.input} type="number" min="3" max="15"
                          placeholder="3 à 15"
                          value={form.glasgow_score}
                          onChange={e => setForm({ ...form, glasgow_score: e.target.value })} />
                      </Champ>
                      <Champ label="Médicaments déjà pris">
                        <input style={s.input}
                          placeholder="Traitements pris avant l'arrivée..."
                          value={form.medicaments_deja_pris}
                          onChange={e => setForm({ ...form, medicaments_deja_pris: e.target.value })} />
                      </Champ>
                    </div>

                    {/* DIAGNOSTIC CIM-10 */}
                    <Champ label="Diagnostic d'urgence (CIM-10)">
                      <div style={{ position: 'relative' }}>
                        <input style={{ ...s.input, borderColor: couleur }}
                          placeholder="Rechercher un diagnostic..."
                          value={rechercheDiag}
                          onChange={e => { setRechercheDiag(e.target.value); setShowDiagList(true); }}
                          onFocus={() => setShowDiagList(true)} />
                        {showDiagList && rechercheDiag.length > 0 && (
                          <div style={s.diagDropdown}>
                            {diagsFiltres.map(d => (
                              <div key={d.code} style={s.diagItem} onClick={() => selectionnerDiag(d)}>
                                <span style={{ ...s.cimBadge, backgroundColor: couleur }}>{d.code}</span>
                                {d.libelle}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {form.code_cim10 && (
                        <div style={{ ...s.diagSelectionne, borderColor: couleur }}>
                           <strong>{form.code_cim10}</strong> — {form.diagnostic}
                        </div>
                      )}
                    </Champ>

                    <Champ label="Traitement d'urgence">
                      <textarea style={s.textarea} rows={3}
                        placeholder="Soins immédiats, médicaments administrés..."
                        value={form.traitement}
                        onChange={e => setForm({ ...form, traitement: e.target.value })} />
                    </Champ>

                    <div style={s.grid2}>
                      <Champ label="Orientation du patient *">
                        <select style={s.input} value={form.orientation}
                          onChange={e => setForm({ ...form, orientation: e.target.value })} required>
                          <option value="">-- Choisir --</option>
                          <option value="Hospitalisation">Hospitalisation</option>
                          <option value="Domicile">Retour à domicile</option>
                          <option value="Référence">Référence vers autre structure</option>
                          <option value="Décès">Décès</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </Champ>
                      {form.orientation === 'Référence' && (
                        <Champ label="Structure de référence">
                          <input style={s.input}
                            placeholder="Nom de la structure..."
                            value={form.structure_reference}
                            onChange={e => setForm({ ...form, structure_reference: e.target.value })} />
                        </Champ>
                      )}
                    </div>

                    <Champ label="Observations">
                      <textarea style={s.textarea} rows={2}
                        placeholder="Notes complémentaires..."
                        value={form.observations}
                        onChange={e => setForm({ ...form, observations: e.target.value })} />
                    </Champ>
                  </div>
                </>
              )}

              {/* ============================================ */}
              {/* RÉFÉRENCE */}
              {/* ============================================ */}
              {activeType === 'reference' && (
                <>
                  <div style={s.section}>
                    <div style={{ ...s.sectionTitre, borderLeft: `4px solid ${couleur}` }}>
                       Dossier de Référence
                    </div>
                    <div style={s.grid2}>
                      <Champ label="Motif de la référence *">
                        <textarea style={s.textarea} rows={3}
                          placeholder="Pourquoi le patient est référé..."
                          value={form.motif_reference}
                          onChange={e => setForm({ ...form, motif_reference: e.target.value })}
                          required />
                      </Champ>
                      <Champ label="Structure d'envoi *">
                        <input style={s.input}
                          placeholder="CNHU, CHD, Clinique privée..."
                          value={form.structure_envoi}
                          onChange={e => setForm({ ...form, structure_envoi: e.target.value })}
                          required />
                      </Champ>
                      <Champ label="Symptômes actuels">
                        <textarea style={s.textarea} rows={2}
                          placeholder="État actuel du patient..."
                          value={form.symptomes}
                          onChange={e => setForm({ ...form, symptomes: e.target.value })} />
                      </Champ>
                      <Champ label="Médicaments déjà administrés">
                        <textarea style={s.textarea} rows={2}
                          placeholder="Traitements déjà donnés..."
                          value={form.medicaments_deja_pris}
                          onChange={e => setForm({ ...form, medicaments_deja_pris: e.target.value })} />
                      </Champ>
                    </div>

                    {/* DIAGNOSTIC CIM-10 */}
                    <Champ label="Diagnostic (CIM-10)">
                      <div style={{ position: 'relative' }}>
                        <input style={{ ...s.input, borderColor: couleur }}
                          placeholder="Rechercher un diagnostic..."
                          value={rechercheDiag}
                          onChange={e => { setRechercheDiag(e.target.value); setShowDiagList(true); }}
                          onFocus={() => setShowDiagList(true)} />
                        {showDiagList && rechercheDiag.length > 0 && (
                          <div style={s.diagDropdown}>
                            {diagsFiltres.map(d => (
                              <div key={d.code} style={s.diagItem} onClick={() => selectionnerDiag(d)}>
                                <span style={{ ...s.cimBadge, backgroundColor: couleur }}>{d.code}</span>
                                {d.libelle}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {form.code_cim10 && (
                        <div style={{ ...s.diagSelectionne, borderColor: couleur }}>
                           <strong>{form.code_cim10}</strong> — {form.diagnostic}
                        </div>
                      )}
                    </Champ>

                    <Champ label="Traitement en cours">
                      <textarea style={s.textarea} rows={3}
                        placeholder="Traitement actuel du patient..."
                        value={form.traitement}
                        onChange={e => setForm({ ...form, traitement: e.target.value })} />
                    </Champ>

                    <Champ label="Instructions pour la structure d'accueil">
                      <textarea style={s.textarea} rows={3}
                        placeholder="Ce que la structure d'accueil doit savoir..."
                        value={form.observations}
                        onChange={e => setForm({ ...form, observations: e.target.value })} />
                    </Champ>
                  </div>
                </>
              )}

              {/* BOUTON SUBMIT */}
              <button type="submit"
                style={{ ...s.boutonSoumettre, backgroundColor: couleur }}>
                 Enregistrer {TYPE_PASSAGE[activeType]?.label}
              </button>

            </form>
          </div>
        )}

        {/* HISTORIQUE */}
        <h2 style={s.sectionTitreH2}>
          Historique — {consultations.length} entrée(s)
        </h2>

        {consultations.length === 0 ? (
          <div style={s.vide}>
            <p style={s.videTexte}>Aucune entrée enregistrée pour ce patient.</p>
          </div>
        ) : (
          consultations.map(c => {
            const tp = TYPE_PASSAGE[c.type_passage] || TYPE_PASSAGE.consultation;
            return (
              <div key={c.id} style={{ ...s.consultationCard, borderLeft: `5px solid ${tp.couleur}` }}>
                <div style={{ ...s.consultationHeader, backgroundColor: tp.couleur }}>
                  <span style={s.dateLabel}>
                    {tp.icone} {tp.label} — {new Date(c.date_consultation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span style={s.medecinLabel}>Dr. {c.medecin_prenom} {c.medecin_nom}</span>
                </div>
                <div style={s.consultationBody}>
                  {c.motif && <Ligne label="Motif" valeur={c.motif} />}
                  {c.symptomes && <Ligne label="Symptômes" valeur={c.symptomes} />}
                  {c.code_cim10 && <Ligne label="Diagnostic CIM-10" valeur={`${c.code_cim10} — ${c.diagnostic}`} />}
                  {c.traitement && <Ligne label="Traitement" valeur={c.traitement} />}
                  {c.orientation && <Ligne label="Orientation" valeur={c.orientation} />}
                  {c.structure_envoi && <Ligne label="Structure référée" valeur={c.structure_envoi} />}
                  {c.observations && <Ligne label="Observations" valeur={c.observations} />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Composants utilitaires
const Champ = ({ label, children, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
      {label}{required && <span style={{ color: 'red' }}> *</span>}
    </label>
    {children}
  </div>
);

const Ligne = ({ label, valeur }) => (
  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
    <span style={{ fontSize: '12px', fontWeight: '600', color: '#888', minWidth: '120px', textTransform: 'uppercase', paddingTop: '2px' }}>
      {label}
    </span>
    <span style={{ fontSize: '14px', color: '#333', flex: 1, lineHeight: '1.5' }}>{valeur}</span>
  </div>
);

const s = {
  page: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Segoe UI', sans-serif" },
  navbar: { backgroundColor: 'white', padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e8ecf0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogo: { width: '34px', height: '34px', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' },
  navTitre: { fontSize: '18px', fontWeight: 'bold' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  patientBadge: { backgroundColor: '#e8f0fe', color: '#1a73e8', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  retour: { padding: '8px 18px', backgroundColor: 'white', color: '#555', border: '1.5px solid #ddd', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  contenu: { maxWidth: '960px', margin: '0 auto', padding: '30px 20px' },
  typeSelector: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  typeBtn: { padding: '10px 22px', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  titre: { fontSize: '26px', fontWeight: 'bold', margin: '0 0 10px' },
  patientInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  badge: { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
  patientNom: { fontSize: '15px', fontWeight: '600', color: '#333' },
  boutonAjouter: { padding: '10px 22px', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  message: { padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e8ecf0' },
  cardTitre: { fontSize: '18px', fontWeight: '700', margin: '0 0 24px' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sectionTitre: { fontSize: '14px', fontWeight: '700', color: '#333', paddingLeft: '12px', paddingTop: '4px', paddingBottom: '4px', backgroundColor: '#f8fafc', borderRadius: '4px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: 'white', color: '#333', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none', backgroundColor: 'white', resize: 'vertical', color: '#333', width: '100%', boxSizing: 'border-box' },
  diagDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 999, maxHeight: '220px', overflowY: 'auto' },
  diagItem: { padding: '10px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #f0f0f0', color: '#333' },
  cimBadge: { color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },
  diagSelectionne: { marginTop: '8px', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid', backgroundColor: '#f0f9f0', fontSize: '13px', color: '#333' },
  boutonSoumettre: { padding: '14px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
  sectionTitreH2: { fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '16px', marginTop: '8px' },
  vide: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #e8ecf0' },
  videTexte: { color: '#888', fontSize: '15px' },
  consultationCard: { backgroundColor: 'white', borderRadius: '16px', marginBottom: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8ecf0' },
  consultationHeader: { padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dateLabel: { color: 'white', fontSize: '14px', fontWeight: '600' },
  medecinLabel: { color: 'rgba(255,255,255,0.9)', fontSize: '13px' },
  consultationBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
};