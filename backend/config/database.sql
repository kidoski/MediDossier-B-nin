-- Création de la base de données
CREATE DATABASE IF NOT EXISTS bjvksgvipkn0yi3szxtl;
USE bjvksgvipkn0yi3szxtl;

-- Table utilisateurs (médecins, infirmiers, admin)
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin', 'medecin', 'infirmier') NOT NULL,
  telephone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table patients
CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  NUD VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  date_naissance DATE NOT NULL,
  sexe ENUM('M', 'F') NOT NULL,
  telephone VARCHAR(20),
  adresse TEXT,
  groupe_sanguin ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table consultations
CREATE TABLE IF NOT EXISTS consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  medecin_id INT NOT NULL,
  date_consultation DATETIME DEFAULT CURRENT_TIMESTAMP,
  motif TEXT,
  diagnostic TEXT,
  traitement TEXT,
  observations TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id)
);

-- Table antecedents
CREATE TABLE IF NOT EXISTS antecedents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  type ENUM('medical', 'chirurgical', 'familial', 'allergie') NOT NULL,
  description TEXT NOT NULL,
  date_signalement DATE,
  FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Table ordonnances
CREATE TABLE IF NOT EXISTS ordonnances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consultation_id INT NOT NULL,
  medicament VARCHAR(200) NOT NULL,
  dosage VARCHAR(100),
  duree VARCHAR(100),
  instructions TEXT,
  FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);

-- Table constantes vitales
CREATE TABLE IF NOT EXISTS constantes_vitales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  infirmier_id INT NOT NULL,
  tension VARCHAR(20),
  temperature DECIMAL(4,1),
  poids DECIMAL(5,2),
  pouls INT,
  saturation INT,
  date_mesure DATETIME DEFAULT CURRENT_TIMESTAMP,
  observations TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (infirmier_id) REFERENCES utilisateurs(id)
);

-- Compte admin par défaut
INSERT IGNORE INTO utilisateurs (nom, prenom, email, mot_de_passe, role)
VALUES ('Admin', 'System', 'admin@hopital.bj', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');