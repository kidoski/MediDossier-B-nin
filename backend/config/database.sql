-- Création de la base de données
CREATE DATABASE IF NOT EXISTS bjvksgvipkn0yi3szxtl;
USE bjvksgvipkn0yi3szxtl;

-- Table utilisateurs (Admin, Médecin, Infirmier, Accueil)
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  login VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Medecin', 'Infirmier', 'Accueil') NOT NULL,
  service VARCHAR(100),
  actif TINYINT(1) DEFAULT 1,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_piece ENUM('CNI', 'Biométrique', 'CIP', 'Passeport') NOT NULL,
  numero_piece VARCHAR(100) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  lieu_naissance VARCHAR(150),
  sexe ENUM('M', 'F', 'Autre') NOT NULL,
  profession VARCHAR(100),
  situation_matrimoniale VARCHAR(100),
  religion VARCHAR(100),
  ville VARCHAR(100),
  arrondissement VARCHAR(100),
  quartier VARCHAR(100),
  carre VARCHAR(100),
  telephone VARCHAR(20),
  contact_urgence_nom VARCHAR(150),
  contact_urgence_telephone VARCHAR(20),
  statut ENUM('En attente', 'En consultation', 'Hospitalisé', 'Libre') DEFAULT 'En attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES utilisateurs(id)
);

-- Table antecedents
CREATE TABLE IF NOT EXISTS antecedents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type ENUM('medical', 'chirurgical', 'familial', 'allergie', 'autre') NOT NULL,
  description TEXT NOT NULL,
  date_signalement DATE,
  cree_par INT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (cree_par) REFERENCES utilisateurs(id)
);

-- Table dossiers_medicaux (table centrale)
CREATE TABLE IF NOT EXISTS dossiers_medicaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type_passage ENUM('Consultation', 'Urgence', 'Admission', 'Pansement', 'Acte paramédical') NOT NULL,
  motif_admission TEXT,
  statut ENUM('Ouvert', 'Clôturé', 'En attente', 'En consultation', 'Hospitalisé') DEFAULT 'Ouvert',
  date_ouverture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_cloture DATETIME NULL,
  ouvert_par INT,
  clos_par INT,
  archive TINYINT(1) DEFAULT 0,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (ouvert_par) REFERENCES utilisateurs(id),
  FOREIGN KEY (clos_par) REFERENCES utilisateurs(id)
);

-- Table parametres_vitaux
CREATE TABLE IF NOT EXISTS parametres_vitaux (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  tension_systolique INT,
  tension_diastolique INT,
  pouls INT,
  frequence_respiratoire INT,
  sao2 INT,
  temperature DECIMAL(4,1),
  douleur_score INT,
  poids DECIMAL(5,2),
  taille DECIMAL(5,2),
  observations TEXT,
  date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  saisi_par INT,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id),
  FOREIGN KEY (saisi_par) REFERENCES utilisateurs(id)
);

-- Table enquete_sociale
CREATE TABLE IF NOT EXISTS enquete_sociale (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL UNIQUE,
  prise_en_charge VARCHAR(100),
  nom_assurance VARCHAR(150),
  numero_assurance VARCHAR(100),
  alcool ENUM('Oui', 'Non', 'Occasionnel') DEFAULT 'Non',
  tabagisme ENUM('Oui', 'Non', 'Occasionnel') DEFAULT 'Non',
  autres_addictions TEXT,
  notes TEXT,
  date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  saisi_par INT,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id),
  FOREIGN KEY (saisi_par) REFERENCES utilisateurs(id)
);

-- Table consultations
CREATE TABLE IF NOT EXISTS consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL UNIQUE,
  motif TEXT,
  symptomes TEXT,
  dialogue_patient TEXT,
  ressenti_patient TEXT,
  medicaments_deja_pris TEXT,
  antecedents_medicaux TEXT,
  antecedents_chirurgicaux TEXT,
  antecedents_familiaux TEXT,
  histoire_maladie TEXT,
  etat_general TEXT,
  examen_neurologique TEXT,
  glasgow_score INT,
  pupilles VARCHAR(100),
  motricite TEXT,
  examen_locomoteur TEXT,
  examen_thorax TEXT,
  examen_abdomen TEXT,
  examen_urologique TEXT,
  autres_examens TEXT,
  resume_syndromique TEXT,
  hypotheses_diagnostiques TEXT,
  diagnostic_retenu TEXT,
  code_cim10 VARCHAR(20),
  traitement_preventif TEXT,
  traitement_curatif TEXT,
  traitement_chirurgical TEXT,
  surveillance TEXT,
  evolution TEXT,
  conclusion TEXT,
  medecin_id INT,
  date_consultation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id),
  FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id)
);

-- Table urgences
CREATE TABLE IF NOT EXISTS urgences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL UNIQUE,
  motif_reference TEXT,
  glasgow_score INT,
  diagnostic TEXT,
  orientation TEXT,
  date_urgence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id)
);

-- Table admissions
CREATE TABLE IF NOT EXISTS admissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL UNIQUE,
  motif TEXT,
  bilan TEXT,
  diagnostic TEXT,
  traitement TEXT,
  evolution TEXT,
  date_entree TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_sortie DATETIME NULL,
  suivi TEXT,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id)
);

-- Table pansements
CREATE TABLE IF NOT EXISTS pansements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  type_plaie VARCHAR(150),
  localisation VARCHAR(150),
  description TEXT,
  materiel_utilise TEXT,
  technique TEXT,
  observation TEXT,
  ordonnance TEXT,
  prochain_rdv DATE,
  infirmier_id INT,
  date_soin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id),
  FOREIGN KEY (infirmier_id) REFERENCES utilisateurs(id)
);

-- Table analyses_biomedicales
CREATE TABLE IF NOT EXISTS analyses_biomedicales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  type_analyse VARCHAR(150),
  description TEXT,
  resultat TEXT,
  interpretation TEXT,
  laboratoire VARCHAR(150),
  technicien VARCHAR(150),
  fichier_path VARCHAR(255),
  fichier_nom VARCHAR(255),
  date_resultat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id)
);

-- Table imagerie_medicale
CREATE TABLE IF NOT EXISTS imagerie_medicale (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  type_image VARCHAR(150),
  region_anatomique VARCHAR(150),
  description TEXT,
  compte_rendu TEXT,
  radiologue VARCHAR(150),
  fichier_path VARCHAR(255),
  fichier_nom VARCHAR(255),
  date_examen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id)
);

-- Table prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dossier_id INT NOT NULL,
  medicaments JSON,
  posologie TEXT,
  duree_traitement VARCHAR(100),
  instructions_speciales TEXT,
  renouvellement VARCHAR(100),
  prescripteur_id INT,
  date_prescription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id),
  FOREIGN KEY (prescripteur_id) REFERENCES utilisateurs(id)
);

-- Table de références diagnostiques (liste récente / CIM-10)
CREATE TABLE IF NOT EXISTS diagnostics_references (
  code VARCHAR(20) PRIMARY KEY,
  libelle VARCHAR(255) NOT NULL,
  frequence_utilisation INT DEFAULT 0
);

-- Table services externes pour flux d'imagerie / chirurgie / données médicales
CREATE TABLE IF NOT EXISTS services_externes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  type ENUM('Imagerie', 'Chirurgie', 'DonneesMedicales', 'Autre') NOT NULL,
  url VARCHAR(255),
  actif TINYINT(1) DEFAULT 1,
  description TEXT,
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services_externes_resultats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  dossier_id INT NULL,
  service_id INT NOT NULL,
  type_resultat VARCHAR(150) NOT NULL,
  titre VARCHAR(255),
  description TEXT,
  fichier_path VARCHAR(255),
  fichier_nom VARCHAR(255),
  data JSON,
  envoye_par INT,
  date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id),
  FOREIGN KEY (service_id) REFERENCES services_externes(id),
  FOREIGN KEY (envoye_par) REFERENCES utilisateurs(id)
);

-- Compte admin par défaut
INSERT IGNORE INTO utilisateurs (nom, prenom, login, email, mot_de_passe, role, actif)
VALUES ('Admin', 'System', 'admin', 'admin@hopital.bj', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 1);
