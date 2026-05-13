import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDossierComplet } from '../services/api';

export default function Dossierpatientpage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    chargerDossier();
  }, [id]);

  const chargerDossier = async () => {
    setLoading(true);
    try {
      const res = await getDossierComplet(id);
      setPatientData(res.data);
      setError('');
    } catch (err) {
      setError('Impossible de charger le dossier du patient.');
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (!patientData) return null;
    const { patient, dossiers, service_results } = patientData;

    if (activeTab === 'infos') {
      return (
        <div style={styles.tabCard}>
          <h3>Informations administratives</h3>
          <div style={styles.infoGrid}>
            <div><strong>Nom complet</strong><p>{patient.prenom} {patient.nom}</p></div>
            <div><strong>Type de pièce</strong><p>{patient.type_piece}</p></div>
            <div><strong>Numéro de pièce</strong><p>{patient.numero_piece}</p></div>
            <div><strong>Date de naissance</strong><p>{patient.date_naissance}</p></div>
            <div><strong>Lieu de naissance</strong><p>{patient.lieu_naissance}</p></div>
            <div><strong>Sexe</strong><p>{patient.sexe}</p></div>
            <div><strong>Adresse</strong><p>{patient.ville} / {patient.arrondissement} / {patient.quartier} / {patient.carre}</p></div>
            <div><strong>Téléphone</strong><p>{patient.telephone}</p></div>
            <div><strong>Contact urgence</strong><p>{patient.contact_urgence_nom} — {patient.contact_urgence_telephone}</p></div>
            <div><strong>Profession</strong><p>{patient.profession}</p></div>
            <div><strong>Situation</strong><p>{patient.situation_matrimoniale}</p></div>
            <div><strong>Religion</strong><p>{patient.religion}</p></div>
            <div><strong>Statut</strong><p>{patient.statut}</p></div>
          </div>
        </div>
      );
    }

    if (activeTab === 'vitaux') {
      return (
        <div style={styles.tabCard}>
          <h3>Paramètres vitaux récents</h3>
          {dossiers.length === 0 ? (
            <p>Aucun dossier médical disponible.</p>
          ) : dossiers.map((dossier) => (
            <div key={dossier.id} style={styles.itemCard}>
              <div style={styles.itemHeader}>
                <span>{dossier.type_passage} — {new Date(dossier.date_ouverture).toLocaleDateString()}</span>
                <span style={styles.statusBadge}>{dossier.statut}</span>
              </div>
              {dossier.vitaux ? (
                <div style={styles.gridCols}>
                  <div><strong>Tension</strong><p>{dossier.vitaux.tension_systolique}/{dossier.vitaux.tension_diastolique}</p></div>
                  <div><strong>Pouls</strong><p>{dossier.vitaux.pouls}</p></div>
                  <div><strong>FR</strong><p>{dossier.vitaux.frequence_respiratoire}</p></div>
                  <div><strong>SaO2</strong><p>{dossier.vitaux.sao2}%</p></div>
                  <div><strong>Température</strong><p>{dossier.vitaux.temperature}°C</p></div>
                  <div><strong>Douleur</strong><p>{dossier.vitaux.douleur_score}/10</p></div>
                  <div><strong>Poids</strong><p>{dossier.vitaux.poids || 'N/A'} kg</p></div>
                  <div><strong>Taille</strong><p>{dossier.vitaux.taille || 'N/A'} m</p></div>
                </div>
              ) : (
                <p>Aucun paramètre vital enregistré pour ce dossier.</p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'consultations') {
      const consultations = dossiers.filter((d) => d.consultation);
      return (
        <div style={styles.tabCard}>
          <h3>Consultations</h3>
          {consultations.length === 0 ? (
            <p>Aucune consultation enregistrée.</p>
          ) : consultations.map((dossier) => (
            <div key={dossier.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(dossier.date_ouverture).toLocaleDateString()}</span></div>
              <div style={styles.gridCols}>
                <div><strong>Motif</strong><p>{dossier.consultation.motif}</p></div>
                <div><strong>Diagnostic</strong><p>{dossier.consultation.diagnostic_retenu || dossier.consultation.diagnostic}</p></div>
                <div><strong>Traitement</strong><p>{dossier.consultation.traitement_curatif || dossier.consultation.traitement}</p></div>
                <div><strong>Conclusion</strong><p>{dossier.consultation.conclusion}</p></div>
                {dossier.consultation.symptomes && <div><strong>Symptômes</strong><p>{dossier.consultation.symptomes}</p></div>}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'urgences') {
      const urgences = dossiers.filter((d) => d.urgence);
      return (
        <div style={styles.tabCard}>
          <h3>Passages aux urgences</h3>
          {urgences.length === 0 ? (
            <p>Aucun passage aux urgences.</p>
          ) : urgences.map((dossier) => (
            <div key={dossier.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(dossier.date_ouverture).toLocaleDateString()}</span></div>
              <div><strong>Motif/Référence</strong><p>{dossier.urgence.motif_reference}</p></div>
              <div><strong>Diagnostic</strong><p>{dossier.urgence.diagnostic}</p></div>
              <div><strong>Orientation</strong><p>{dossier.urgence.orientation}</p></div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'admissions') {
      const admissions = dossiers.filter((d) => d.admission);
      return (
        <div style={styles.tabCard}>
          <h3>Admissions</h3>
          {admissions.length === 0 ? (
            <p>Aucune admission enregistrée.</p>
          ) : admissions.map((dossier) => (
            <div key={dossier.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(dossier.date_entree || dossier.date_ouverture).toLocaleDateString()}</span></div>
              <div><strong>Bilan</strong><p>{dossier.admission.bilan}</p></div>
              <div><strong>Traitement</strong><p>{dossier.admission.traitement}</p></div>
              <div><strong>Évolution</strong><p>{dossier.admission.evolution}</p></div>
              <div><strong>Date sortie</strong><p>{dossier.admission.date_sortie || 'En cours'}</p></div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'pansements') {
      const pansements = dossiers.flatMap((dossier) => dossier.pansements || []);
      return (
        <div style={styles.tabCard}>
          <h3>Pansements</h3>
          {pansements.length === 0 ? (
            <p>Aucun pansement enregistré.</p>
          ) : pansements.map((soin) => (
            <div key={soin.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(soin.date_soin).toLocaleDateString()}</span></div>
              <div><strong>Type</strong><p>{soin.type_plaie}</p></div>
              <div><strong>Localisation</strong><p>{soin.localisation}</p></div>
              <div><strong>Ordonnance</strong><p>{soin.ordonnance}</p></div>
              <div><strong>Observations</strong><p>{soin.observation}</p></div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'analyses') {
      const analyses = dossiers.flatMap((dossier) => dossier.analyses || []);
      return (
        <div style={styles.tabCard}>
          <h3>Analyses biomédicales</h3>
          {analyses.length === 0 ? (
            <p>Aucune analyse enregistrée.</p>
          ) : analyses.map((analyse) => (
            <div key={analyse.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(analyse.date_resultat).toLocaleDateString()}</span></div>
              <div><strong>Type</strong><p>{analyse.type_analyse}</p></div>
              <div><strong>Résultat</strong><p>{analyse.resultat}</p></div>
              <div><strong>Interprétation</strong><p>{analyse.interpretation}</p></div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'imagerie') {
      const images = dossiers.flatMap((dossier) => dossier.imagerie || []);
      return (
        <div style={styles.tabCard}>
          <h3>Imagerie médicale</h3>
          {images.length === 0 ? (
            <p>Aucune image ou rapport.</p>
          ) : images.map((image) => (
            <div key={image.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(image.date_examen).toLocaleDateString()}</span></div>
              <div><strong>Type</strong><p>{image.type_image}</p></div>
              <div><strong>Région</strong><p>{image.region_anatomique}</p></div>
              <div><strong>Compte-rendu</strong><p>{image.compte_rendu}</p></div>
              {image.fichier_nom && <div><strong>Fichier</strong><p>{image.fichier_nom}</p></div>}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'prescriptions') {
      const prescriptions = dossiers.flatMap((dossier) => dossier.prescriptions || []);
      return (
        <div style={styles.tabCard}>
          <h3>Prescriptions</h3>
          {prescriptions.length === 0 ? (
            <p>Aucune prescription enregistrée.</p>
          ) : prescriptions.map((ordonnance) => (
            <div key={ordonnance.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{new Date(ordonnance.date_prescription).toLocaleDateString()}</span></div>
              <div><strong>Posologie</strong><p>{ordonnance.posologie}</p></div>
              <div><strong>Durée</strong><p>{ordonnance.duree_traitement}</p></div>
              <div><strong>Instructions</strong><p>{ordonnance.instructions_speciales}</p></div>
              {ordonnance.medicaments && <div><strong>Médicaments</strong><p>{JSON.stringify(ordonnance.medicaments)}</p></div>}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'services') {
      return (
        <div style={styles.tabCard}>
          <h3>Résultats services externes</h3>
          {service_results.length === 0 ? (
            <p>Aucun résultat de service externe.</p>
          ) : service_results.map((item) => (
            <div key={item.id} style={styles.itemCard}>
              <div style={styles.itemHeader}><span>{item.service_nom} ({item.service_type})</span></div>
              <div><strong>Type</strong><p>{item.type_resultat}</p></div>
              <div><strong>Titre</strong><p>{item.titre}</p></div>
              <div><strong>Description</strong><p>{item.description}</p></div>
              {item.fichier_nom && <div><strong>Fichier</strong><p>{item.fichier_nom}</p></div>}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <button onClick={() => navigate('/patients')} style={styles.backButton}>← Retour aux patients</button>
          <h1 style={styles.title}>Dossier patient</h1>
          <p style={styles.subtitle}>Fiche unifiée en temps réel pour le patient sélectionné.</p>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loader}>Chargement des données...</div>
      ) : (
        patientData && (
          <>
            <div style={styles.summaryCard}>
              <div>
                <h2>{patientData.patient.prenom} {patientData.patient.nom}</h2>
                <p><strong>Statut :</strong> {patientData.patient.statut}</p>
              </div>
              <div style={styles.summaryMeta}>
                <span>{patientData.dossiers.length} dossier(s) ouvert(s)</span>
                <span>Dernier passage : {patientData.dossiers[0] ? new Date(patientData.dossiers[0].date_ouverture).toLocaleDateString() : '—'}</span>
              </div>
            </div>

            <div style={styles.tabNav}>
              {['infos', 'vitaux', 'consultations', 'urgences', 'admissions', 'pansements', 'analyses', 'imagerie', 'prescriptions', 'services'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={activeTab === tab ? styles.activeTabButton : styles.tabButton}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {renderTabContent()}
          </>
        )
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '28px', fontFamily: "'Segoe UI', sans-serif" },
  topbar: { marginBottom: '20px' },
  backButton: { marginBottom: '14px', border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', fontSize: '14px' },
  title: { fontSize: '28px', fontWeight: '700', margin: '0 0 6px', color: '#111827' },
  subtitle: { margin: '0', color: '#4b5563' },
  summaryCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', padding: '22px', borderRadius: '20px', backgroundColor: 'white', boxShadow: '0 14px 32px rgba(15,23,42,0.05)', marginBottom: '24px' },
  summaryMeta: { display: 'flex', gap: '18px', color: '#4b5563', fontSize: '14px' },
  tabNav: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' },
  tabButton: { padding: '12px 16px', borderRadius: '14px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', color: '#374151' },
  activeTabButton: { padding: '12px 16px', borderRadius: '14px', border: '1px solid #2563eb', backgroundColor: '#eff6ff', cursor: 'pointer', color: '#1d4ed8' },
  tabCard: { backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 14px 32px rgba(15,23,42,0.05)' },
  itemCard: { backgroundColor: '#f8fafc', borderRadius: '16px', padding: '18px', marginBottom: '16px', border: '1px solid #e5e7eb' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#1f2937', fontWeight: '700' },
  gridCols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' },
  error: { padding: '14px 18px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '14px', marginBottom: '18px' },
  loader: { padding: '28px', backgroundColor: 'white', borderRadius: '18px', boxShadow: '0 14px 32px rgba(15,23,42,0.05)' },
  statusBadge: { padding: '4px 12px', borderRadius: '999px', backgroundColor: '#e0f2fe', color: '#0369a1', fontWeight: '700' }
};
