import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';


interface FamilyRequest {
  familyName: string;
  address: string;
  phone: string;
  email: string;
}

interface Family extends FamilyRequest {
  id: number;
  parents: Parent[];
  students?: Student[];
}

interface Parent {
  id: number;
  firstname: string;
  lastname: string;
  relationship: Relationship;
  profession?: string;
  phone: string;
  email?: string;
  familyId: number;
}

enum Relationship {
  Mother = 'Mother',
  Father = 'Father',
  GrandFather = 'GrandFather',
  GrandMother = 'GrandMother',
  Guardian = 'Guardian',
  Uncle = 'Uncle',
  Aunt = 'Aunt',
  StepFather = 'StepFather',
  StepMother = 'StepMother',
  Brother = 'Brother',
  Sister = 'Sister',
  Cousin = 'Cousin',
  OTHER = 'OTHER'
}

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  classId: string;
  familyId: number;
  parentId: number;
  studentId?: string;
  email?: string;
  registrationDate?: string;
  address?: string; 
}

interface Class {
  id: string;
  name: string;
  levelId: number;
}


const API_BASE_URL = import.meta.env.VITE_API_URL;

const Registration = () => {
  const [step, setStep] = useState<'familyCheck' | 'familySearch' | 'familyInfo' | 'parentInfo' | 'studentInfo'>('familyCheck');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Family[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    family: FamilyRequest | Family;
    parent: Omit<Parent, 'id' | 'familyId'>;
    student: Omit<Student, 'id' | 'familyId' | 'parentId' | 'studentId'>;
  }>({
    family: {
      familyName: '',
      address: '',
      phone: '',
      email: ''
    },
    parent: {
      firstname: '',
      lastname: '',
      relationship: Relationship.Father,
      profession: '',
      phone: '',
      email: ''
    },
    student: {
      firstname: '',
      lastname: '',
      dateOfBirth: '',
      gender: 'male',
      classId: '',
      email: '',
      address: ''
    }
  });

  const navigate = useNavigate();

  // Fonction utilitaire pour les labels de relation
  const getRelationshipLabel = (relationship: Relationship): string => {
    const labels: Record<Relationship, string> = {
      [Relationship.Mother]: 'Mère',
      [Relationship.Father]: 'Père',
      [Relationship.GrandFather]: 'Grand-père',
      [Relationship.GrandMother]: 'Grand-mère',
      [Relationship.Guardian]: 'Tuteur/Tutrice',
      [Relationship.Uncle]: 'Oncle',
      [Relationship.Aunt]: 'Tante',
      [Relationship.StepFather]: 'Beau-père',
      [Relationship.StepMother]: 'Belle-mère',
      [Relationship.Brother]: 'Frère',
      [Relationship.Sister]: 'Sœur',
      [Relationship.Cousin]: 'Cousin/Cousine',
      [Relationship.OTHER]: 'Autre'
    };
    return labels[relationship] || relationship;
  };

  // Validation helpers
  const validateName = (name: string): boolean => /^[\p{L}]+([''\s]?[\p{L}]+)*$/u.test(name);
  const validatePhone = (phone: string): boolean => /^(0[456]\d{7})$/.test(phone);
  const validateEmail = (email: string): boolean => 
    !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // API Calls
  const createFamily = async (familyData: FamilyRequest): Promise<Family> => {
    const response = await fetch(`${API_BASE_URL}/v1/families`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(familyData)
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    return await response.json();
  };

  const createParent = async (parentData: Omit<Parent, 'id'>): Promise<Parent> => {
    const response = await fetch(`${API_BASE_URL}/v1/parents/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(parentData)
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    return await response.json();
  };

const createStudent = async (studentData: {
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  classId: string;
  familyId: number;
  parentId: number;
  email?: string;
  address?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/v1/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({
      firstname: studentData.firstname,
      lastname: studentData.lastname,
      dateOfBirth: studentData.dateOfBirth, 
      gender: studentData.gender.toUpperCase(), 
      classId: studentData.classId,
      familyId: studentData.familyId,
      parentId: studentData.parentId,
      email: studentData.email,
      address: studentData.address
    })
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la création');
  }
  
  return await response.json();
};

  const searchFamilies = async (term: string): Promise<Family[]> => {
    const isPhone = /^0\d+$/.test(term.trim());
    const endpoint = isPhone 
      ? `${API_BASE_URL}/v1/families/by-phone?phone=${encodeURIComponent(term)}`
      : `${API_BASE_URL}/v1/families?name=${encodeURIComponent(term)}`;

    const response = await fetch(endpoint, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!response.ok) throw new Error('Erreur lors de la recherche');
    return isPhone ? [await response.json()] : await response.json();
  };

  const fetchClasses = async () => {
    const response = await fetch(`${API_BASE_URL}/v1/classes/all`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    });
    if (!response.ok) throw new Error('Erreur lors du chargement des classes');
    setClasses(await response.json());
  };

  useEffect(() => {
    fetchClasses().catch(error => {
      console.error("Erreur de chargement:", error);
      setError(error.message);
    });
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Veuillez saisir un terme de recherche');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await searchFamilies(searchTerm);
      setSearchResults(results);
      if (results.length === 0) {
        setError(/^0\d+$/.test(searchTerm.trim()) 
          ? 'Aucune famille trouvée avec ce numéro' 
          : 'Aucune famille trouvée avec ce nom');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    section: 'family' | 'parent' | 'student',
    field: string,
    value: string | number
  ) => {
     console.log(`Changement ${section}.${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

//   const handleClassChange = (classId: number) => {
//   console.log('ClassId avant:', formData.student.classId);
//   console.log('Nouveau classId:', classId);
  
//   setFormData(prev => {
//     const newData = {
//       ...prev,
//       student: {
//         ...prev.student,
//         classId: classId
//       }
//     };
//     console.log('FormData complet après:', newData);
//     return newData;
//   });
// };

  const validateFormData = (): boolean => {
    // Validation famille (si nouvelle)
    if (step === 'familyInfo') {
      if (!formData.family.familyName.trim() || !formData.family.phone.trim()) {
        setError('Veuillez remplir les champs obligatoires de la famille');
        return false;
      }
      if (!validatePhone(formData.family.phone)) {
        setError('Numéro de téléphone invalide (format: 04/05/06 + 7 chiffres)');
        return false;
      }
      if (formData.family.email && !validateEmail(formData.family.email)) {
        setError('Email de famille invalide');
        return false;
      }
    }

    // Validation parent (si nouveau)
    if (step === 'parentInfo') {
      if (!formData.parent.firstname.trim() || !formData.parent.lastname.trim() || !formData.parent.phone.trim()) {
        setError('Veuillez remplir les champs obligatoires du parent');
        return false;
      }
      if (!validateName(formData.parent.firstname) || !validateName(formData.parent.lastname)) {
        setError('Nom/prénom parent invalide (lettres et apostrophes seulement)');
        return false;
      }
      if (!validatePhone(formData.parent.phone)) {
        setError('Téléphone parent invalide (format: 04/05/06 + 7 chiffres)');
        return false;
      }
      if (formData.parent.email && !validateEmail(formData.parent.email)) {
        setError('Email parent invalide');
        return false;
      }
    }

    // Validation étudiant
    if (!formData.student.firstname.trim() || !formData.student.lastname.trim() || 
        !formData.student.dateOfBirth || !formData.student.classId) {
      setError('Veuillez remplir les champs obligatoires de l\'élève');
      return false;
    }
    if (!validateName(formData.student.firstname) || !validateName(formData.student.lastname)) {
      setError('Nom/prénom élève invalide (lettres et apostrophes seulement)');
      return false;
    }
    
     if (!formData.student.classId || formData.student.classId.trim() === '') {
    setError('Veuillez sélectionner une classe avant de continuer');
    return false;
  }

    return true;
  };

   const submitRegistration = async () => {
  if (!validateFormData()) return;

  try {
    setLoading(true);
    setError(null);

    // Déclaration des variables une seule fois
    let finalFamilyId: number;
    let finalParentId: number;

    // CAS 1: Famille existante
    if ('id' in formData.family && formData.family.id) {
      const family = formData.family as Family;
      finalFamilyId = family.id;
      const existingParent = family.parents?.[0];
      if (!existingParent) {
        throw new Error('Cette famille n\'a pas de parent associé');
      }
      finalParentId = existingParent.id;
    } 
    // CAS 2: Nouvelle famille
    else {
      const newFamily = await createFamily(formData.family);
      finalFamilyId = newFamily.id;
      const newParent = await createParent({
        ...formData.parent,
        familyId: newFamily.id
      });
      finalParentId = newParent.id;
    }

    // Validation de la classe
    if (!formData.student.classId) {
      throw new Error('Veuillez sélectionner une classe');
    }

    // Création de l'étudiant
    const newStudent = await createStudent({
      firstname: formData.student.firstname.trim(),
      lastname: formData.student.lastname.trim(),
      dateOfBirth: formData.student.dateOfBirth,
      gender: formData.student.gender,
      classId: formData.student.classId,
      familyId: finalFamilyId,
      parentId: finalParentId,
      email: formData.student.email?.trim(),
      address: formData.student.address?.trim()
    });
    
    console.log('🔍 Nouveau student créé:', newStudent);
    console.log('🔍 ID:', newStudent.id);
    console.log('🔍 StudentId:', newStudent.studentId);

    // Génération PDF
    generatePDF({
      family: {
        ...formData.family,
        id: finalFamilyId,
        parents: [{
          ...formData.parent,
          id: finalParentId,
          familyId: finalFamilyId
        }]
      } as Family,
      student: {
        ...formData.student,
        id: newStudent.id,
        studentId: newStudent.studentId || '',
        registrationDate: new Date().toISOString().split('T')[0],
        familyId: finalFamilyId,
        parentId: finalParentId
      }
    });

    setShowSuccessModal(true);
    setTimeout(() => navigate('/students'), 3000);
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Erreur inconnue');
    toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
     console.log('ClassId avant envoi:', formData.student.classId);
  } finally {
    setLoading(false);
  }
};



const generatePDF = ({ family, student }: { family: Family; student: Student }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const inscriptionNumber = generateSecureInscriptionNumber({
    firstname: student.firstname,
    lastname: student.lastname,
    dateOfBirth: student.dateOfBirth,
    registrationDate: student.registrationDate
  });

 // EN-TÊTE AVEC LOGO
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Complexe Scolaire Allegra', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Établissement d\'enseignement secondaire général', 105, 28, { align: 'center' });

  // TITRE DU DOCUMENT
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(16);
  doc.text('FICHE D\'INSCRIPTION', 105, 45, { align: 'center' });
  
  doc.setDrawColor(52, 152, 219);
  doc.setLineWidth(0.5);
  doc.line(20, 50, 190, 50);

  // INFORMATIONS DE BASE AVEC NUMÉRO SÉCURISÉ
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`N° d'inscription: ${inscriptionNumber}`, 20, 60);
  doc.setFont('helvetica', 'normal');
  const currentDate = student.registrationDate ? 
    new Date(student.registrationDate).toLocaleDateString('fr-FR') : 
    new Date().toLocaleDateString('fr-FR');
  doc.text(`Date: ${currentDate}`, 150, 60, { align: 'right' });

  // SECTION FAMILLE
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS FAMILIALES', 20, 75);
  
  doc.setFillColor(242, 242, 242);
  doc.rect(20, 80, 170, 8, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 51, 51);
  doc.text(`Nom de famille: ${safeText(family.familyName)}`, 25, 86);
  
  doc.setFontSize(10);
  doc.text(`Adresse: ${safeText(family.address)}`, 25, 95);
  doc.text(`Téléphone: ${safeText(family.phone)}`, 25, 100);
  doc.text(`Email: ${safeText(family.email)}`, 25, 105);

  // SECTION PARENT/TUTEUR
  let currentY = 120;
  if (family.parents && family.parents.length > 0) {
    const parent = family.parents[0];
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS DU PARENT/TUTEUR', 20, currentY);
    
    doc.setFillColor(242, 242, 242);
    doc.rect(20, currentY + 5, 170, 8, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Parent: ${safeText(parent.firstname)} ${safeText(parent.lastname)}`, 25, currentY + 11);
    
    doc.setFontSize(10);
    doc.text(`Relation: ${getRelationshipLabel(parent.relationship)}`, 25, currentY + 20);
    doc.text(`Profession: ${safeText(parent.profession)}`, 25, currentY + 25);
    doc.text(`Contact: ${safeText(parent.phone)}`, 25, currentY + 30);
    doc.text(`Email: ${safeText(parent.email)}`, 25, currentY + 35);
    
    currentY += 50;
  }

  // SECTION ÉLÈVE
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS DE L\'ÉLÈVE', 20, currentY);
  
  doc.setFillColor(242, 242, 242);
  doc.rect(20, currentY + 5, 170, 8, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Élève: ${safeText(student.firstname)} ${safeText(student.lastname)}`, 25, currentY + 11);
  
  doc.setFontSize(10);
  doc.text(`Date de naissance: ${new Date(student.dateOfBirth).toLocaleDateString('fr-FR')}`, 25, currentY + 20);
  doc.text(`Sexe: ${student.gender === 'male' ? 'Masculin' : 'Féminin'}`, 25, currentY + 25);
  doc.text(`Adresse personnelle: ${safeText(student.address)}`, 25, currentY + 30);
  doc.text(`Email: ${safeText(student.email)}`, 25, currentY + 35);
  doc.text(`Classe: ${classes.find(c => c.id === student.classId)?.name || 'Non assignée'}`, 25, currentY + 40);
  doc.text(`Date d'inscription: ${currentDate}`, 25, currentY + 45);

  currentY += 60;

  // INFORMATIONS GÉOGRAPHIQUES
  // doc.setFontSize(12);
  // doc.setFont('helvetica', 'bold');
  // doc.text('INFORMATIONS GÉOGRAPHIQUES', 20, currentY);
  
  // doc.setFillColor(242, 242, 242);
  // doc.rect(20, currentY + 5, 170, 8, 'F');
  
  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(10);
  // doc.text(`Quartier: Centre-ville`, 25, currentY + 11);
  // doc.text(`Arrondissement: 3e Arrondissement`, 25, currentY + 16);
  // doc.text(`Ville: Brazzaville`, 25, currentY + 21);
  // doc.text(`Pays: République du Congo`, 25, currentY + 26);
  // doc.text(`Code postal: 0000`, 25, currentY + 31);

  // // SECTION ADMINISTRATIVE
  // doc.setFontSize(12);
  // doc.setFont('helvetica', 'bold');
  // doc.text('INFORMATIONS ADMINISTRATIVES', 20, currentY + 45);
  
  // doc.setFillColor(242, 242, 242);
  // doc.rect(20, currentY + 50, 170, 8, 'F');
  
  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(10);
  // doc.text(`Numéro d'inscription: ${inscriptionNumber}`, 25, currentY + 56);
  // doc.text(`Année scolaire: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 25, currentY + 61);
  // doc.text(`Statut: Inscrit`, 25, currentY + 66);
  // doc.text(`Date de création du dossier: ${currentDate}`, 25, currentY + 71);

  // SIGNATURE ET PIED DE PAGE
  doc.setFontSize(10);
  doc.setTextColor(51, 51, 51);
  doc.text('Le Responsable des inscriptions', 150, 240, { align: 'right' });
  doc.line(130, 245, 190, 245);
  doc.setFontSize(8);
  doc.text('Signature et cachet', 150, 250, { align: 'right' });

  // PIED DE PAGE
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Document officiel de Complexe Scolaire Allegra - Toute reproduction est interdite', 105, 275, { align: 'center' });
  doc.text('Brazzaville, République du Congo | Tél: +242 06 123 456 | Email: contact@canadianschool.cg', 105, 280, { align: 'center' });
  doc.text(`Numéro de référence: ${inscriptionNumber} - ${currentDate}`, 105, 285, { align: 'center' });

  doc.save(`Inscription_${student.lastname}_${student.firstname}_${inscriptionNumber}.pdf`);
};

const generateSecureInscriptionNumber = (student: {
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  registrationDate?: string;
}): string => {
  const regDate = student.registrationDate || new Date().toISOString().split('T')[0];
  const [year, month] = regDate.split('-');
  
  const seed = Math.random().toString(36).substr(2, 3);
  const dataString = `${student.firstname}${student.lastname}${student.dateOfBirth}${Date.now()}${seed}`;
  
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  
  const uniqueCode = Math.abs(hash).toString().slice(-5).padStart(5, '0');
  
  return `CS-${year}-${month}-${uniqueCode}`;
};

// Fonction utilitaire pour les valeurs nulles/undefined
const safeText = (text: string | undefined | null): string => {
  return text && text.trim() !== '' ? text : 'Non spécifié';
};

  if (loading && step === 'familyCheck') {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Inscription d'un nouvel élève</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {/* Étape 1: Vérification famille */}
      {step === 'familyCheck' && (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">La famille est-elle déjà enregistrée ?</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('familySearch')} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Oui, rechercher
              </button>
              <button 
                onClick={() => setStep('familyInfo')} 
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Non, nouvelle famille
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Étape 2: Recherche famille */}
      {step === 'familySearch' && (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Rechercher une famille</h2>
            <div className="mb-4">
              <label className="block mb-2 font-medium">Numéro de téléphone ou nom de famille</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-2 flex-grow rounded"
                  placeholder="Ex: 061234567 ou MAKOSSO"
                  aria-label="Rechercher une famille"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                💡 Saisissez un numéro (ex: 061234567) pour une recherche par téléphone, ou un nom pour rechercher par nom de famille
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded p-4 bg-white">
                <h3 className="font-bold mb-2">Résultats :</h3>
                <div className="space-y-2">
                  {searchResults.map(family => (
                    <div 
                      key={family.id}
                      className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          family,
                          parent: {
                            firstname: '',
                            lastname: '',
                            relationship: Relationship.Father,
                            profession: '',
                            phone: '',
                            email: ''
                          }
                        }));
                        setStep('studentInfo');
                      }}
                    >
                      <div>
                        <span className="font-medium">{family.familyName}</span>
                        <span className="text-gray-600 ml-4">{family.phone}</span>
                      </div>
                      <span className="text-sm text-blue-600">Sélectionner</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setStep('familyCheck')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Retour
          </button>
        </div>
      )}
      
      {/* Étape 3: Informations famille */}
      {step === 'familyInfo' && (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Informations de la famille</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Nom de famille*</label>
                <input
                  type="text"
                  value={formData.family.familyName}
                  onChange={(e) => handleInputChange('family', 'familyName', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Nom de famille"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Adresse*</label>
                <input
                  type="text"
                  value={formData.family.address}
                  onChange={(e) => handleInputChange('family', 'address', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Adresse"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Téléphone* (04, 05 ou 06)</label>
                <input
                  type="tel"
                  value={formData.family.phone}
                  onChange={(e) => handleInputChange('family', 'phone', e.target.value)}
                  className="border p-2 w-full rounded"
                  placeholder="Ex: 061234567"
                  required
                  aria-label="Téléphone"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.family.email}
                  onChange={(e) => handleInputChange('family', 'email', e.target.value)}
                  className="border p-2 w-full rounded"
                  aria-label="Email"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => setStep('familyCheck')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Retour
            </button>
            <button 
              onClick={() => setStep('parentInfo')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
      
      {/* Étape 4: Informations parent */}
      {step === 'parentInfo' && (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Informations du parent</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Prénom*</label>
          <input
            type="text"
            value={formData.parent.firstname}
            onChange={(e) => handleInputChange('parent', 'firstname', e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Prénom du parent"
            required
            aria-label="Prénom du parent"
            title="Prénom du parent"
          />
        </div>
              <div>
                <label className="block mb-1 font-medium">Nom*</label>
                <input
                  type="text"
                  value={formData.parent.lastname}
                  onChange={(e) => handleInputChange('parent', 'lastname', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Nom du parent"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Relation avec l'élève*</label>
                <select
                  value={formData.parent.relationship}
                  onChange={(e) => handleInputChange('parent', 'relationship', e.target.value as Relationship)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Relation avec l'élève"
                >
                  {Object.values(Relationship).map(rel => (
                    <option key={rel} value={rel}>
                      {getRelationshipLabel(rel)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Profession</label>
                <input
                  type="text"
                  value={formData.parent.profession}
                  onChange={(e) => handleInputChange('parent', 'profession', e.target.value)}
                  className="border p-2 w-full rounded"
                  aria-label="Profession du parent"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Téléphone* (04, 05 ou 06)</label>
                <input
                  type="tel"
                  value={formData.parent.phone}
                  onChange={(e) => handleInputChange('parent', 'phone', e.target.value)}
                  className="border p-2 w-full rounded"
                  placeholder="Ex: 061234567"
                  required
                  aria-label="Téléphone du parent"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={formData.parent.email}
                  onChange={(e) => handleInputChange('parent', 'email', e.target.value)}
                  className="border p-2 w-full rounded"
                  aria-label="Email du parent"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => setStep('familyInfo')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Retour
            </button>
            <button 
              onClick={() => setStep('studentInfo')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
      
      {/* Étape 5: Informations élève */}
      {step === 'studentInfo' && (
        <div className="space-y-6">
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Informations de l'élève</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Prénom*</label>
                <input
                  type="text"
                  value={formData.student.firstname}
                  onChange={(e) => handleInputChange('student', 'firstname', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Prénom de l'élève"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Nom*</label>
                <input
                  type="text"
                  value={formData.student.lastname}
                  onChange={(e) => handleInputChange('student', 'lastname', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Nom de l'élève"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Date de naissance*</label>
                <input
                  type="date"
                  value={formData.student.dateOfBirth}
                  onChange={(e) => handleInputChange('student', 'dateOfBirth', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Date de naissance de l'élève"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Sexe*</label>
                <select
                  value={formData.student.gender}
                  onChange={(e) => handleInputChange('student', 'gender', e.target.value)}
                  className="border p-2 w-full rounded"
                  required
                  aria-label="Sexe de l'élève"
                >
                  <option value="male">Masculin</option>
                  <option value="female">Féminin</option>
                </select>
              </div>
                  <div>
                    <label className="block mb-1 font-medium">Email de l'élève</label>
                    <input
                      type="email"
                      value={formData.student.email || ''}
                      onChange={(e) => handleInputChange('student', 'email', e.target.value)}
                      className="border p-2 w-full rounded"
                      aria-label="Email de l'élève"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Adresse de l'élève</label>
                    <input
                      type="text"
                      value={formData.student.address || ''}
                      onChange={(e) => handleInputChange('student', 'address', e.target.value)}
                      className="border p-2 w-full rounded"
                      placeholder="N° rue, Quartier, Arrondissement"
                      aria-label="Adresse de l'élève"
                     />
                  </div>
                  <div className="md:col-span-2">
                   <label className="block mb-1 font-medium">Classe*</label>
                  <select
                    value={formData.student.classId || ""} 
                    onChange={(e) => {
                             const classId = e.target.value;
                             console.log('✅ ClassId sélectionné:', classId);
                            handleInputChange('student', 'classId', classId);
                    }}
                   className="border p-2 w-full rounded"
                   required
                  aria-label="Classe de l'élève"
                  >
                  <option value="">Sélectionner une classe</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                    ))}
                   </select>
  
                  <p className="text-gray-500 text-sm mt-1">
                  Classe actuelle: {formData.student.classId || "Aucune"}
                 </p>
            </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button 
              onClick={() => {
             // Retour intelligent selon le contexte
                if (searchResults.length > 0 && 'id' in formData.family && formData.family.id) {
                setStep('familySearch');
                } else {
                  setStep('parentInfo');
               }
             }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Retour
            </button>
            <button 
              onClick={submitRegistration}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Inscription en cours...' : 'Finaliser l\'inscription'}
            </button>
          </div>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Inscription réussie !</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {formData.student.firstname} {formData.student.lastname} a été inscrit(e) avec succès.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/students');
                  }}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;