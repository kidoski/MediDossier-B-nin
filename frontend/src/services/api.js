import axios from 'axios';

const BASE_URL = 'https://medidossier-backend.onrender.com/api';

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => API.post('/auth/login', data);

// Patients
export const getPatients = () => API.get('/patients');
export const ajouterPatient = (data) => API.post('/patients', data);
export const rechercherPatient = (q) => API.get(`/patients/recherche?q=${q}`);
export const getPatient = (id) => API.get(`/patients/${id}`);

// Consultations
export const creerConsultation = (data) => API.post('/consultations', data);
export const getConsultationsPatient = (patient_id) => API.get(`/consultations/patient/${patient_id}`);
export const getConsultation = (id) => API.get(`/consultations/${id}`);
export const ajouterOrdonnance = (data) => API.post('/consultations/ordonnance', data);

// Utilisateurs
export const getUtilisateurs = () => API.get('/utilisateurs');
export const ajouterUtilisateur = (data) => API.post('/utilisateurs', data);
export const modifierUtilisateur = (id, data) => API.put(`/utilisateurs/${id}`, data);
export const supprimerUtilisateur = (id) => API.delete(`/utilisateurs/${id}`);

// Constantes vitales
export const ajouterConstantes = (data) => API.post('/constantes', data);
export const getConstantesPatient = (patient_id) => API.get(`/constantes/patient/${patient_id}`);

// Antécédents
export const ajouterAntecedent = (data) => API.post('/antecedents', data);
export const getAntecedentsPatient = (patient_id) => API.get(`/antecedents/patient/${patient_id}`);
export const supprimerAntecedent = (id) => API.delete(`/antecedents/${id}`);

// Hôpitaux
export const getHopitaux = () => API.get('/hopitaux');
export const ajouterHopital = (data) => API.post('/hopitaux', data);
export const supprimerHopital = (id) => API.delete(`/hopitaux/${id}`);