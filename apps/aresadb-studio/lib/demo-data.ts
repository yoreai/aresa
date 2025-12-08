// Healthcare ML Demo Datasets
// These are sample data structures representing the datasets loaded in AresaDB

export interface DrugReview {
  id: string
  drug_name: string
  condition: string
  review: string
  rating: number
  date: string
  useful_count: number
  side_effects?: string
}

export interface MedicalTranscription {
  id: string
  transcription_id: string
  medical_specialty: string
  description: string
  transcription: string
  keywords: string[]
}

export interface HeartDiseaseRecord {
  id: string
  age: number
  sex: number
  cp: number  // chest pain type
  trestbps: number  // resting blood pressure
  chol: number  // serum cholesterol
  fbs: number  // fasting blood sugar > 120
  restecg: number  // resting ECG results
  thalach: number  // max heart rate
  exang: number  // exercise induced angina
  oldpeak: number  // ST depression
  slope: number  // slope of peak exercise ST
  ca: number  // number of major vessels
  thal: number  // thalassemia
  target: number  // heart disease (1) or not (0)
}

export interface PubMedAbstract {
  id: string
  pmid: string
  title: string
  abstract: string
  authors: string[]
  journal: string
  pub_date: string
  mesh_terms?: string[]
}

// Sample data for demo purposes
export const sampleDrugReviews: DrugReview[] = [
  {
    id: 'dr_001',
    drug_name: 'Metformin',
    condition: 'Type 2 Diabetes',
    review: 'Been taking this medication for 6 months. Blood sugar levels have stabilized significantly. Mild GI side effects initially but improved over time.',
    rating: 4,
    date: '2024-01-15',
    useful_count: 234,
    side_effects: 'Mild nausea, GI discomfort',
  },
  {
    id: 'dr_002',
    drug_name: 'Lisinopril',
    condition: 'Hypertension',
    review: 'Excellent blood pressure control. No significant side effects. Been on it for 2 years.',
    rating: 5,
    date: '2024-02-20',
    useful_count: 189,
  },
  {
    id: 'dr_003',
    drug_name: 'Atorvastatin',
    condition: 'High Cholesterol',
    review: 'Cholesterol dropped 40 points in 3 months. Some muscle aches but manageable.',
    rating: 4,
    date: '2024-03-10',
    useful_count: 156,
    side_effects: 'Muscle aches',
  },
]

export const sampleMedicalTranscriptions: MedicalTranscription[] = [
  {
    id: 'mt_001',
    transcription_id: 'TRX-2024-001',
    medical_specialty: 'Cardiology',
    description: 'Follow-up visit for atrial fibrillation management',
    transcription: 'Patient is a 67-year-old male with history of paroxysmal atrial fibrillation on anticoagulation therapy. Current medications include apixaban 5mg BID and metoprolol 50mg daily. Patient reports improved exercise tolerance and no palpitations in the past month. EKG today shows normal sinus rhythm...',
    keywords: ['atrial fibrillation', 'anticoagulation', 'cardiology', 'metoprolol'],
  },
  {
    id: 'mt_002',
    transcription_id: 'TRX-2024-002',
    medical_specialty: 'Endocrinology',
    description: 'Diabetes management consultation',
    transcription: 'Patient is a 54-year-old female with poorly controlled type 2 diabetes, HbA1c 8.9%. Currently on metformin 1000mg BID. Discussed adding GLP-1 agonist therapy. Patient agrees to start semaglutide weekly injection. Reviewed dietary modifications and importance of regular exercise...',
    keywords: ['diabetes', 'endocrinology', 'semaglutide', 'HbA1c'],
  },
]

export const sampleHeartDisease: HeartDiseaseRecord[] = [
  { id: 'hd_001', age: 63, sex: 1, cp: 3, trestbps: 145, chol: 233, fbs: 1, restecg: 0, thalach: 150, exang: 0, oldpeak: 2.3, slope: 0, ca: 0, thal: 1, target: 1 },
  { id: 'hd_002', age: 37, sex: 1, cp: 2, trestbps: 130, chol: 250, fbs: 0, restecg: 1, thalach: 187, exang: 0, oldpeak: 3.5, slope: 0, ca: 0, thal: 2, target: 1 },
  { id: 'hd_003', age: 41, sex: 0, cp: 1, trestbps: 130, chol: 204, fbs: 0, restecg: 0, thalach: 172, exang: 0, oldpeak: 1.4, slope: 2, ca: 0, thal: 2, target: 0 },
  { id: 'hd_004', age: 56, sex: 1, cp: 1, trestbps: 120, chol: 236, fbs: 0, restecg: 1, thalach: 178, exang: 0, oldpeak: 0.8, slope: 2, ca: 0, thal: 2, target: 0 },
  { id: 'hd_005', age: 57, sex: 0, cp: 0, trestbps: 120, chol: 354, fbs: 0, restecg: 1, thalach: 163, exang: 1, oldpeak: 0.6, slope: 2, ca: 0, thal: 2, target: 0 },
]

export const samplePubMedAbstracts: PubMedAbstract[] = [
  {
    id: 'pm_001',
    pmid: '38912345',
    title: 'SGLT2 Inhibitors in Heart Failure with Preserved Ejection Fraction: A Meta-Analysis',
    abstract: 'Background: Heart failure with preserved ejection fraction (HFpEF) represents approximately half of all heart failure cases with limited treatment options. SGLT2 inhibitors have shown promise in this population. Methods: We conducted a systematic review and meta-analysis of randomized controlled trials evaluating SGLT2 inhibitors in HFpEF. Results: Five trials with 12,345 patients were included. SGLT2 inhibitors reduced the composite endpoint of cardiovascular death and HF hospitalization by 23% (HR 0.77, 95% CI 0.69-0.86)...',
    authors: ['Smith J', 'Johnson M', 'Williams K'],
    journal: 'JAMA Cardiology',
    pub_date: '2024-03-15',
    mesh_terms: ['Heart Failure', 'SGLT2 Inhibitors', 'Meta-Analysis'],
  },
  {
    id: 'pm_002',
    pmid: '38845678',
    title: 'Machine Learning for Early Detection of Diabetic Retinopathy: Validation Study',
    abstract: 'Purpose: To develop and validate a deep learning algorithm for detecting diabetic retinopathy from fundus photographs. Methods: We trained a convolutional neural network on 128,175 fundus images from 45 clinical sites. The algorithm was validated on an independent test set of 12,000 images. Results: The algorithm achieved sensitivity of 96.7% and specificity of 93.4% for detecting referable diabetic retinopathy...',
    authors: ['Chen L', 'Park H', 'Kumar R'],
    journal: 'Ophthalmology',
    pub_date: '2024-02-28',
    mesh_terms: ['Diabetic Retinopathy', 'Deep Learning', 'Screening'],
  },
]

// Dataset statistics for UI display
export const datasetStats = {
  drug_reviews: {
    name: 'Drug Reviews',
    description: 'Patient reviews of medications from multiple conditions',
    nodes: 215063,
    edges: 892341,
    source: 'UCI ML Repository',
    fields: ['drug_name', 'condition', 'review', 'rating', 'date', 'useful_count', 'side_effects'],
  },
  medical_transcriptions: {
    name: 'Medical Transcriptions',
    description: 'Clinical notes and medical reports across specialties',
    nodes: 4999,
    edges: 12847,
    source: 'MTSamples',
    fields: ['transcription_id', 'medical_specialty', 'description', 'transcription', 'keywords'],
  },
  heart_disease: {
    name: 'Heart Disease UCI',
    description: 'Classic ML dataset for cardiovascular disease prediction',
    nodes: 303,
    edges: 1515,
    source: 'UCI ML Repository',
    fields: ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'target'],
  },
  pubmed_abstracts: {
    name: 'PubMed Abstracts',
    description: 'Research paper abstracts for semantic search',
    nodes: 67238,
    edges: 234891,
    source: 'NCBI PubMed',
    fields: ['pmid', 'title', 'abstract', 'authors', 'journal', 'pub_date'],
  },
}

