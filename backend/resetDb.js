// resetDB.js — Supprime et recrée toutes les tables SGDP
// Usage : node resetDB.js

const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetDatabase() {
  let connection;

  try {
    console.log('🔌 Connexion à MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connecté à la base de données:', process.env.DB_NAME);
    console.log('⚠️  Suppression des anciennes tables...\n');

    // Désactiver les contraintes de clés étrangères
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Supprimer toutes les tables dans l'ordre
    const tablesToDrop = [
      'prescriptions',
      'imagerie_medicale',
      'analyses_biomedicales',
      'pansements',
      'admissions',
      'urgences',
      'consultations',
      'enquete_sociale',
      'parametres_vitaux',
      'dossiers_medicaux',
      'patients',
      'diagnostics_references',
      'utilisateurs'
    ];

    for (const table of tablesToDrop) {
      await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`   🗑️  Table "${table}" supprimée`);
    }

    // Réactiver les contraintes
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Anciennes tables supprimées.\n');

    // ============================================================
    // CRÉATION DES NOUVELLES TABLES
    // ============================================================
    console.log('🔨 Création des nouvelles tables...\n');

    // TABLE : utilisateurs
    await connection.execute(`
      CREATE TABLE utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        login VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150),
        mot_de_passe VARCHAR(255) NOT NULL,
        role ENUM('Admin','Médecin','Infirmier','Accueil') NOT NULL,
        service VARCHAR(100),
        actif BOOLEAN DEFAULT TRUE,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "utilisateurs" créée');

    // TABLE : patients
    await connection.execute(`
      CREATE TABLE patients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_piece ENUM('CNI','Biométrique','CIP','Passeport') NOT NULL,
        numero_piece VARCHAR(50) UNIQUE NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        date_naissance DATE NOT NULL,
        lieu_naissance VARCHAR(100),
        sexe ENUM('M','F') NOT NULL,
        profession VARCHAR(100),
        situation_matrimoniale ENUM('Célibataire','Marié(e)','Divorcé(e)','Veuf/Veuve'),
        religion VARCHAR(50),
        ville VARCHAR(100),
        arrondissement VARCHAR(100),
        quartier VARCHAR(100),
        carre VARCHAR(100),
        telephone VARCHAR(20),
        contact_urgence_nom VARCHAR(100),
        contact_urgence_telephone VARCHAR(20),
        statut ENUM('En attente','En consultation','Hospitalisé','Libre') DEFAULT 'En attente',
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "patients" créée');

    // TABLE : dossiers_medicaux
    await connection.execute(`
      CREATE TABLE dossiers_medicaux (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        type_passage ENUM('Consultation','Urgence','Admission','Pansement','Acte paramédical') NOT NULL,
        statut ENUM('Ouvert','Clôturé','Archivé') DEFAULT 'Ouvert',
        motif_admission TEXT,
        date_ouverture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_cloture TIMESTAMP NULL,
        ouvert_par INT,
        clos_par INT,
        archive BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
        FOREIGN KEY (ouvert_par) REFERENCES utilisateurs(id) ON DELETE SET NULL,
        FOREIGN KEY (clos_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "dossiers_medicaux" créée');

    // TABLE : parametres_vitaux
    await connection.execute(`
      CREATE TABLE parametres_vitaux (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL,
        tension_systolique INT,
        tension_diastolique INT,
        pouls INT,
        frequence_respiratoire INT,
        sao2 DECIMAL(5,2),
        temperature DECIMAL(4,1),
        douleur_score INT,
        poids DECIMAL(5,2),
        taille DECIMAL(5,2),
        saisi_par INT,
        date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (saisi_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "parametres_vitaux" créée');

    // TABLE : enquete_sociale
    await connection.execute(`
      CREATE TABLE enquete_sociale (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL UNIQUE,
        prise_en_charge ENUM('Assurance','Administrative','Aucune') DEFAULT 'Aucune',
        nom_assurance VARCHAR(100),
        numero_assurance VARCHAR(100),
        alcool BOOLEAN DEFAULT FALSE,
        tabagisme BOOLEAN DEFAULT FALSE,
        autres_addictions TEXT,
        notes TEXT,
        saisi_par INT,
        date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (saisi_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "enquete_sociale" créée');

    // TABLE : consultations
    await connection.execute(`
      CREATE TABLE consultations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL UNIQUE,
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
        pupilles TEXT,
        motricite TEXT,
        examen_locomoteur TEXT,
        examen_thorax TEXT,
        examen_abdomen TEXT,
        examen_urologique TEXT,
        autres_examens TEXT,
        resume_syndromique TEXT,
        hypotheses_diagnostiques TEXT,
        diagnostic_retenu VARCHAR(500),
        code_cim10 VARCHAR(20),
        traitement_preventif TEXT,
        traitement_curatif TEXT,
        traitement_chirurgical TEXT,
        surveillance TEXT,
        evolution TEXT,
        conclusion TEXT,
        medecin_id INT,
        date_consultation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "consultations" créée');

    // TABLE : urgences
    await connection.execute(`
      CREATE TABLE urgences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL UNIQUE,
        motif_reference TEXT,
        provenance VARCHAR(100),
        glasgow_score INT,
        pupilles TEXT,
        etat_hemodynamique TEXT,
        diagnostic_urgence TEXT,
        orientation ENUM('Hospitalisation','Domicile','Référence','Décès','Autre'),
        structure_reference VARCHAR(200),
        notes TEXT,
        medecin_id INT,
        date_admission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "urgences" créée');

    // TABLE : admissions
    await connection.execute(`
      CREATE TABLE admissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL UNIQUE,
        motif_hospitalisation TEXT,
        service VARCHAR(100),
        numero_lit VARCHAR(20),
        bilan_entree TEXT,
        diagnostic_principal TEXT,
        diagnostics_associes TEXT,
        traitement_initial TEXT,
        evolution_quotidienne TEXT,
        complications TEXT,
        bilan_sortie TEXT,
        traitement_sortie TEXT,
        instructions_sortie TEXT,
        mode_sortie ENUM('Guérison','Amélioration','Référence','Décès','Contre avis médical','Autre'),
        date_sortie DATE,
        medecin_id INT,
        date_admission TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "admissions" créée');

    // TABLE : pansements
    await connection.execute(`
      CREATE TABLE pansements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL,
        type_plaie VARCHAR(100),
        localisation VARCHAR(100),
        description TEXT,
        materiel_utilise TEXT,
        technique TEXT,
        observation TEXT,
        ordonnance TEXT,
        prochain_rdv DATE,
        infirmier_id INT,
        date_soin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (infirmier_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "pansements" créée');

    // TABLE : analyses_biomedicales
    await connection.execute(`
      CREATE TABLE analyses_biomedicales (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL,
        type_analyse VARCHAR(200) NOT NULL,
        description TEXT,
        resultat TEXT,
        interpretation TEXT,
        fichier_path VARCHAR(500),
        fichier_nom VARCHAR(255),
        laboratoire VARCHAR(200),
        technicien VARCHAR(100),
        valide_par INT,
        date_prelevement TIMESTAMP NULL,
        date_resultat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (valide_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "analyses_biomedicales" créée');

    // TABLE : imagerie_medicale
    await connection.execute(`
      CREATE TABLE imagerie_medicale (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL,
        type_image ENUM('Radiographie','Échographie','Scanner TDM','IRM','Autre') NOT NULL,
        region_anatomique VARCHAR(100),
        description TEXT,
        compte_rendu TEXT,
        fichier_path VARCHAR(500),
        fichier_nom VARCHAR(255),
        radiologue VARCHAR(100),
        saisi_par INT,
        date_examen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (saisi_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "imagerie_medicale" créée');

    // TABLE : prescriptions
    await connection.execute(`
      CREATE TABLE prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dossier_id INT NOT NULL,
        medicaments JSON NOT NULL,
        posologie TEXT,
        duree_traitement VARCHAR(100),
        instructions_speciales TEXT,
        renouvellement BOOLEAN DEFAULT FALSE,
        prescripteur_id INT,
        date_prescription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
        FOREIGN KEY (prescripteur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "prescriptions" créée');

    // TABLE : diagnostics_references (CIM-10)
    await connection.execute(`
      CREATE TABLE diagnostics_references (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(20) NOT NULL,
        libelle VARCHAR(500) NOT NULL,
        categorie VARCHAR(200),
        frequence_utilisation INT DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('   ✅ Table "diagnostics_references" créée');

    console.log('\n🌱 Insertion des données initiales...\n');

    // ADMIN PAR DÉFAUT
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('Admin@2024', 10);
    await connection.execute(
      `INSERT INTO utilisateurs (nom, prenom, login, email, mot_de_passe, role) VALUES (?, ?, ?, ?, ?, ?)`,
      ['Administrateur', 'Système', 'admin', 'admin@hopital.bj', hash, 'Admin']
    );
    console.log('   ✅ Admin créé  →  login: admin  |  mot de passe: Admin@2024');

    // DIAGNOSTICS CIM-10 FRÉQUENTS AU BÉNIN
    const diagnostics = [
      ['A01', 'Fièvre typhoïde', 'Maladies infectieuses', 45],
      ['A09', 'Gastroentérite infectieuse', 'Maladies infectieuses', 80],
      ['A15', 'Tuberculose pulmonaire', 'Maladies infectieuses', 30],
      ['A91', 'Fièvre dengue', 'Maladies infectieuses', 40],
      ['B50', 'Paludisme à Plasmodium falciparum', 'Maladies parasitaires', 150],
      ['B54', 'Paludisme non précisé', 'Maladies parasitaires', 120],
      ['B20', 'Maladie par VIH', 'Maladies infectieuses', 25],
      ['E10', 'Diabète de type 1', 'Maladies endocriniennes', 35],
      ['E11', 'Diabète de type 2', 'Maladies endocriniennes', 90],
      ['E46', 'Malnutrition protéino-énergétique', 'Maladies endocriniennes', 20],
      ['I10', 'Hypertension artérielle essentielle', 'Maladies cardiovasculaires', 100],
      ['I50', 'Insuffisance cardiaque', 'Maladies cardiovasculaires', 45],
      ['I63', 'Infarctus cérébral', 'Maladies cardiovasculaires', 20],
      ['J00', 'Rhinopharyngite aiguë', 'Maladies respiratoires', 200],
      ['J06', 'Infections aiguës voies respiratoires supérieures', 'Maladies respiratoires', 180],
      ['J18', 'Pneumonie non précisée', 'Maladies respiratoires', 70],
      ['J45', 'Asthme', 'Maladies respiratoires', 60],
      ['K29', 'Gastrite et duodénite', 'Maladies digestives', 50],
      ['K80', 'Lithiase biliaire', 'Maladies digestives', 25],
      ['N30', 'Cystite', 'Maladies urinaires', 40],
      ['N39', 'Autres affections de l\'appareil urinaire', 'Maladies urinaires', 70],
      ['O00', 'Grossesse extra-utérine', 'Grossesse', 15],
      ['O14', 'Hypertension gravidique avec protéinurie', 'Grossesse', 20],
      ['O80', 'Accouchement normal', 'Grossesse', 50],
      ['S00', 'Traumatisme superficiel de la tête', 'Traumatismes', 35],
      ['S06', 'Traumatisme intracrânien', 'Traumatismes', 20],
      ['T14', 'Traumatisme non précisé', 'Traumatismes', 40],
      ['Z00', 'Examen médical général', 'Soins préventifs', 30],
      ['A00', 'Choléra', 'Maladies infectieuses', 10],
      ['A36', 'Diphtérie', 'Maladies infectieuses', 5],
    ];

    for (const [code, libelle, categorie, freq] of diagnostics) {
      await connection.execute(
        'INSERT INTO diagnostics_references (code, libelle, categorie, frequence_utilisation) VALUES (?,?,?,?)',
        [code, libelle, categorie, freq]
      );
    }
    console.log(`   ✅ ${diagnostics.length} diagnostics CIM-10 insérés`);

    console.log('\n🎉 Base de données réinitialisée avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Récapitulatif :');
    console.log('   • 13 tables créées');
    console.log('   • 1 utilisateur Admin créé');
    console.log('   • 30 diagnostics CIM-10 insérés');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Connexion Admin :');
    console.log('   Login    : admin');
    console.log('   Password : Admin@2024');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ ERREUR :', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

resetDatabase();