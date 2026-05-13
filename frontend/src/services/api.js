import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://medidossier-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================
// AUTHENTICATION
// ============================================================
export const login = (credentials) => api.post('/auth/login', credentials);
export const getMe = () => api.get('/auth/me');
export const register = (userData) => api.post('/auth/register', userData);

// ============================================================
// PATIENTS
// ============================================================
export const getPatients = () => api.get('/patients');
export const getPatient = (id) => api.get(`/patients/${id}`);
export const createPatient = (data) => api.post('/patients', data);
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const searchPatient = (query) => api.get(`/patients/search?q=${query}`);
export const getDossierComplet = (id) => api.get(`/patients/${id}/complet`);

// ============================================================
// CONSULTATIONS
// ============================================================
export const getConsultationsPatient = (patientId) =>
  api.get(`/consultations/patient/${patientId}`);
export const creerConsultation = (data) => api.post('/consultations', data);

// ============================================================
// CONSTANTES VITALES
// ============================================================
export const getConstantesPatient = (patientId) =>
  api.get(`/constantes/patient/${patientId}`);
export const ajouterConstantes = (data) => api.post('/vitaux', data);

// ============================================================
// ANTECEDENTS
// ============================================================
export const getAntecedentsPatient = (patientId) =>
  api.get(`/antecedents/patient/${patientId}`);
export const ajouterAntecedent = (data) => api.post('/antecedents', data);
export const supprimerAntecedent = (id) => api.delete(`/antecedents/${id}`);

// ============================================================
// UTILISATEURS
// ============================================================
export const getUtilisateurs = () => api.get('/utilisateurs');
export const ajouterUtilisateur = (data) => api.post('/utilisateurs', data);
export const modifierUtilisateur = (id, data) => api.put(`/utilisateurs/${id}`, data);
export const supprimerUtilisateur = (id) => api.delete(`/utilisateurs/${id}`);
export const getHopitaux = () => api.get('/hopitaux');

// ============================================================
// DOSSIER MEDICAL / MÉDECIN / INFIRMIER
// ============================================================
export const saveVitaux = (data) => api.post('/vitaux', data);
export const saveEnqueteSociale = (data) => api.post('/enquete-sociale', data);
export const saveConsultation = (data) => api.post('/consultations', data);
export const savePansement = (data) => api.post('/pansements', data);
export const savePrescription = (data) => api.post('/prescriptions', data);
export const getDiagnostics = (query) => api.get(`/diagnostics?q=${query}`);
export const saveImagerie = (formData) => api.post('/imagerie', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const saveAnalyse = (formData) => api.post('/analyses', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// ============================================================
// UPLOADS
// ============================================================
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default api;