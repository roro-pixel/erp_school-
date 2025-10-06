import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, ChevronLeft, User, Home, DollarSign, CheckCircle2, AlertTriangle, Calendar, CreditCard, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Family {
  id: number;
  familyName: string;
  address: string;
  phone: string;
  email: string;
}

interface Class {
  id: number;
  name: string;
  levelId: number;
}

interface StudentResponse {
  id: number;
  studentId: string;
  firstname: string;
  lastname: string;
  birthDate: string; 
  gender: string;
  classes: string; 
  family: string; 
  parentId: string;
  parentPhone: string;
  parentEmail: string;
  relationship: string;
  studentEmail: string;
  parentLastname: string;
  parentFirstname: string;
}

interface PaymentBasicInfo {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  monthsPaid: string[];
  status: string;
}

interface StudentFeeProfile {
  studentId: string;
  studentLastname: string;
  studentFirstname: string;
  studentNumber: string;
  outstandingAmount: number;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  paymentStatus: string;
  monthsOverdue: number;
  totalPaidAmount: number;
  discountPercentage: number;
  className: string;
  payments: PaymentBasicInfo[];
}

interface StudentDetails extends StudentResponse {
  familyDetails?: Family;
  classDetails?: Class;
  feeProfile?: StudentFeeProfile;
}

interface EditStudentData {
  firstname: string;
  lastname: string;
  birthDate: string;
  gender: string;
  classId: string | null;
  familyId: number | null;
  parentPhone: string;
  parentEmail: string;
  relationship: string;
  studentEmail: string;
  parentLastname: string;
  parentFirstname: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Students = () => {
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingFeeProfile, setLoadingFeeProfile] = useState(false);
  const studentsPerPage = 10;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/students/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des étudiants';
      toast.error(`Erreur: ${errorMessage}`);
      setError(errorMessage);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (studentId: string, studentData: EditStudentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const updatedStudent = await response.json();
      
      // Mettre à jour la liste des étudiants
      setStudents(students.map(student => 
        student.studentId === studentId ? { ...student, ...updatedStudent } : student
      ));
      
      toast.success('Élève modifié avec succès');
      setEditingStudent(null);
      
      return updatedStudent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification';
      toast.error(`Échec de la modification: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  };

  const fetchStudentFeeProfile = async (studentId: string): Promise<StudentFeeProfile | undefined> => {
    try {
      setLoadingFeeProfile(true);
      const response = await fetch(`${API_BASE_URL}/v1/student-fee-profile/${studentId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Impossible de charger le profil de paiement`);
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du profil';
      toast.warn(errorMessage);
      return undefined;
    } finally {
      setLoadingFeeProfile(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/families`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        setFamilies([]);
        return;
      }
      
      const data = await response.json();
      setFamilies(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.warn(`Erreur familles: ${errorMessage}`);
      setFamilies([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/classes/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des classes');
      }
      
      const data = await response.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.warn(`Erreur classes: ${errorMessage}`);
      setClasses([]);
    }
  };

  const handleDelete = async (studentId: string) => {
    // Message personnalisé pour dire que la fonctionnalité est à débloquer
    toast.info("🔒 Fonctionnalité de suppression à débloquer", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const searchStudentsByName = async (name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/students/by-name?name=${encodeURIComponent(name)}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : [];
      toast.info(`${results.length} résultat(s) trouvé(s)`);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      toast.error(`Erreur de recherche: ${errorMessage}`);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchStudents(), fetchFamilies(), fetchClasses()]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStudentDetails = useCallback(async (studentId: string): Promise<StudentDetails | undefined> => {
    if (!Array.isArray(students) || students.length === 0) return undefined;
    
    const student = students.find(s => s.studentId === studentId);
    if (!student) return undefined;

    return {
      ...student,
      familyDetails: Array.isArray(families) ? families.find(f => f.familyName === student.family) : undefined,
      classDetails: Array.isArray(classes) ? classes.find(c => c.name === student.classes) : undefined,
      feeProfile: await fetchStudentFeeProfile(studentId)
    };
  }, [students, families, classes]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      try {
        await fetchStudents();
        toast.info('Liste des élèves actualisée');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(errorMessage);
      }
      return;
    }

    try {
      setLoading(true);
      setStudents(await searchStudentsByName(searchTerm));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'payé':
        return 'text-green-600 bg-green-100';
      case 'overdue':
      case 'en_retard':
        return 'text-red-600 bg-red-100';
      case 'partial':
      case 'partiel':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'À jour';
      case 'overdue':
        return 'En retard';
      case 'partial':
        return 'Partiel';
      default:
        return status || 'Non défini';
    }
  };

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchLower) ||
      student.family.toLowerCase().includes(searchLower) ||
      student.classes.toLowerCase().includes(searchLower)
    );
  }) : [];

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (selectedStudent) {
    return <StudentProfile 
      studentId={selectedStudent} 
      onBack={() => setSelectedStudent(null)}
      students={students}
      families={families}
      classes={classes}
      formatCurrency={formatCurrency}
      formatDate={formatDate}
      getPaymentStatusColor={getPaymentStatusColor}
      getPaymentStatusText={getPaymentStatusText}
    />;
  }

  if (editingStudent) {
    return <EditStudentForm 
      studentId={editingStudent}
      student={students.find(s => s.studentId === editingStudent)}
      families={families}
      classes={classes}
      onSave={updateStudent}
      onCancel={() => setEditingStudent(null)}
    />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Élèves</h1>
          <Link 
            to="/registration" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} /> Nouvelle inscription
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, famille ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Rechercher
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {filteredStudents.length} élève{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Famille</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Étudiant</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentStudents.length > 0 ? (
                  currentStudents.map(student => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => setSelectedStudent(student.studentId)}
                          className="font-medium text-blue-600 hover:underline text-left"
                        >
                          {student.firstname} {student.lastname}
                        </button>
                        <div className="text-sm text-gray-500">
                          {student.gender === 'MALE' ? 'Garçon' : student.gender === 'FEMALE' ? 'Fille' : student.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.family || 'Non spécifiée'}</div>
                        <div className="text-sm text-gray-500">{student.parentPhone || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.classes || 'Non spécifiée'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingStudent(student.studentId)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(student.studentId)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun élève trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Précédent
              </button>
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant de modification d'étudiant (informations propres uniquement)
const EditStudentForm = ({ 
  studentId, 
  student, 
  families, 
  classes, 
  onSave, 
  onCancel 
}: {
  studentId: string;
  student?: StudentResponse;
  families: Family[];
  classes: Class[]; 
  onSave: (studentId: string, data: EditStudentData) => Promise<void>;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<EditStudentData>({
    firstname: student?.firstname || '',
    lastname: student?.lastname || '',
    birthDate: student?.birthDate || '',
    gender: student?.gender || '',
    classId: classes.find(c => c.name === student?.classes)?.id?.toString() || null,
    familyId: families.find(f => f.familyName === student?.family)?.id || null,
    parentPhone: student?.parentPhone || '',
    parentEmail: student?.parentEmail || '',
    relationship: student?.relationship || '',
    studentEmail: student?.studentEmail || '',
    parentLastname: student?.parentLastname || '',
    parentFirstname: student?.parentFirstname || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await onSave(studentId, formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value || null
  }));
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Modifier l'élève: {student?.firstname} {student?.lastname}
              </h1>
              <button
                onClick={onCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                <X size={16} /> Annuler
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Informations de l'élève
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="MALE">Garçon</option>
                      <option value="FEMALE">Fille</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email élève
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe
                  </label>
                  <select
                    name="classId"
                    value={formData.classId || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner une classe...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section informative pour les données famille/parent (non modifiables) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 text-gray-500">
                  Informations famille/parent
                  <span className="text-sm font-normal text-gray-400 ml-2">(consultation seulement)</span>
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Famille
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                        {student?.family || 'Non spécifiée'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Parent/Tuteur
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                        {`${student?.parentFirstname || ''} ${student?.parentLastname || ''}`.trim() || 'Non spécifié'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Téléphone parent
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                        {student?.parentPhone || 'Non spécifié'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Relation
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">
                        {student?.relationship || 'Non spécifiée'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      💡 Pour modifier les informations de famille ou de parent, veuillez utiliser la section "Gestion des Familles" depuis le menu principal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const StudentProfile = ({ 
  studentId, 
  onBack, 
  students,
  families,
  classes,
  formatCurrency, 
  formatDate, 
  getPaymentStatusColor, 
  getPaymentStatusText
}: {
  studentId: string;
  onBack: () => void;
  students: StudentResponse[];
  families: Family[];
  classes: Class[];
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | null) => string | null;
  getPaymentStatusColor: (status: string) => string;
  getPaymentStatusText: (status: string) => string;
}) => {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFeeProfile, setLoadingFeeProfile] = useState(false);

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true);
      
      if (!students || !Array.isArray(students) || students.length === 0) {
        setLoading(false);
        return;
      }
      
      const studentData = students.find(s => s.studentId === studentId);
      if (!studentData) {
        setLoading(false);
        return;
      }

      const studentDetails: StudentDetails = {
        ...studentData,
        familyDetails: Array.isArray(families) ? families.find(f => f.familyName === studentData.family) : undefined,
        classDetails: Array.isArray(classes) ? classes.find(c => c.name === studentData.classes) : undefined,
        feeProfile: await fetchStudentFeeProfile(studentId)
      };

      setStudent(studentDetails);
      setLoading(false);
    };

    loadStudentData();
  }, [studentId, students, families, classes]);

  const fetchStudentFeeProfile = async (studentId: string): Promise<StudentFeeProfile | undefined> => {
    try {
      setLoadingFeeProfile(true);
      const response = await fetch(`${API_BASE_URL}/v1/student-fee-profile/${studentId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error('Impossible de charger le profil de paiement');
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.warn(errorMessage);
      return undefined;
    } finally {
      setLoadingFeeProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-blue-600 p-4 text-white">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <ChevronLeft size={18} /> Retour à la liste
          </button>
          <h1 className="text-2xl font-bold mt-2">
            {student.firstname} {student.lastname}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-blue-100">{student.classes || 'Classe non spécifiée'}</span>
            <span className="text-blue-200 text-sm">ID: {student.studentId}</span>
            {student.feeProfile && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(student.feeProfile.paymentStatus)}`}>
                {student.feeProfile.monthsOverdue > 0 ? (
                  <><AlertTriangle size={14} className="mr-1" /> {student.feeProfile.monthsOverdue} mois de retard</>
                ) : (
                  <><CheckCircle2 size={14} className="mr-1" /> {getPaymentStatusText(student.feeProfile.paymentStatus)}</>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Section title="Informations personnelles" icon={<User size={18} />}>
              <InfoRow 
                label="Date de naissance" 
                value={student.birthDate ? formatDate(student.birthDate) : undefined} 
              />
              <InfoRow 
                label="Genre" 
                value={student.gender === 'MALE' ? 'Garçon' : student.gender === 'FEMALE' ? 'Fille' : student.gender} 
              />
              <InfoRow label="Email élève" value={student.studentEmail} />
              <InfoRow label="Classe" value={student.classes} />
            </Section>

            <Section title="Famille" icon={<Home size={18} />}>
              <InfoRow label="Nom de famille" value={student.family} />
              <InfoRow label="Adresse" value={student.familyDetails?.address} />
              <InfoRow label="Téléphone famille" value={student.familyDetails?.phone} />
              <InfoRow label="Email famille" value={student.familyDetails?.email} />
            </Section>

            <Section title="Parent/Tuteur" icon={<User size={18} />}>
              <InfoRow label="Nom" value={`${student.parentFirstname || ''} ${student.parentLastname || ''}`.trim() || undefined} />
              <InfoRow label="Relation" value={student.relationship} />
              <InfoRow label="Téléphone" value={student.parentPhone} />
              <InfoRow label="Email" value={student.parentEmail} />
            </Section>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loadingFeeProfile ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Chargement des informations de paiement...</span>
              </div>
            ) : student.feeProfile ? (
              <>
                <Section title="Situation financière" icon={<DollarSign size={18} />}>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow 
                      label="Montant dû" 
                      value={formatCurrency(student.feeProfile.outstandingAmount)}
                      highlight={student.feeProfile.outstandingAmount > 0 ? 'text-red-600' : 'text-green-600'}
                    />
                    <InfoRow 
                      label="Total payé" 
                      value={formatCurrency(student.feeProfile.totalPaidAmount)}
                      highlight="text-green-600"
                    />
                    <InfoRow 
                      label="Statut" 
                      value={getPaymentStatusText(student.feeProfile.paymentStatus)}
                      highlight={getPaymentStatusColor(student.feeProfile.paymentStatus).includes('red') ? 'text-red-600' : 
                                getPaymentStatusColor(student.feeProfile.paymentStatus).includes('green') ? 'text-green-600' : 'text-yellow-600'}
                    />
                    <InfoRow 
                      label="Mois en retard" 
                      value={student.feeProfile.monthsOverdue > 0 ? `${student.feeProfile.monthsOverdue} mois` : 'Aucun'}
                      highlight={student.feeProfile.monthsOverdue > 0 ? 'text-red-600' : 'text-green-600'}
                    />
                  </div>
                  {student.feeProfile.discountPercentage > 0 && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        <strong>Réduction famille:</strong> {student.feeProfile.discountPercentage}% 
                        (3 enfants ou plus dans la famille)
                      </p>
                    </div>
                  )}
                </Section>

                <Section title="Dates importantes" icon={<Calendar size={18} />}>
                  <InfoRow 
                    label="Dernier paiement" 
                    value={student.feeProfile.lastPaymentDate ? formatDate(student.feeProfile.lastPaymentDate) : 'Aucun'}
                  />
                  <InfoRow 
                    label="Prochaine échéance" 
                    value={student.feeProfile.nextDueDate ? formatDate(student.feeProfile.nextDueDate) : 'Non définie'}
                    highlight={student.feeProfile.nextDueDate && new Date(student.feeProfile.nextDueDate) < new Date() ? 'text-red-600' : undefined}
                  />
                </Section>

                {student.feeProfile.payments && student.feeProfile.payments.length > 0 ? (
                  <Section title="Historique des paiements" icon={<CreditCard size={18} />}>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {student.feeProfile.payments
                          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                          .map((payment, index) => (
                            <div key={payment.id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                              <div>
                                <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                <div className="text-sm text-gray-600">{formatDate(payment.paymentDate)}</div>
                                {payment.monthsPaid && payment.monthsPaid.length > 0 && (
                                  <div className="text-xs text-blue-600">
                                    Mois: {payment.monthsPaid.join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600">{payment.paymentMethod}</div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                  payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {payment.status === 'COMPLETED' ? 'Validé' : payment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </Section>
                ) : (
                  <Section title="Historique des paiements" icon={<CreditCard size={18} />}>
                    <div className="text-center py-4 text-gray-500">
                      <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Aucun paiement enregistré</p>
                      <p className="text-sm">L'historique des paiements apparaîtra ici</p>
                    </div>
                  </Section>
                )}

                <div className="mt-6 flex gap-4">
                  <Link 
                    to={`/payments?studentId=${student.studentId}&family=${student.family}&class=${student.classes}`}
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    <DollarSign size={16} /> Effectuer un paiement
                  </Link>
                  {student.feeProfile.outstandingAmount > 0 && (
                    <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      <AlertTriangle size={16} /> Envoyer rappel
                    </button>
                  )}
                </div>
              </>
            ) : (
              <Section title="Informations de paiement" icon={<DollarSign size={18} />}>
                <div className="text-center py-8 text-gray-500">
                  <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Informations de paiement non disponibles</p>
                  <p className="text-sm">Les données de paiement n'ont pas pu être chargées.</p>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="border rounded-lg p-4">
    <h3 className="font-semibold flex items-center gap-2 mb-3">
      {icon} {title}
    </h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value, highlight }: { label: string; value?: string | null; highlight?: string }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}</span>
    <span className={`font-medium ${highlight || 'text-gray-900'}`}>
      {value || <span className="text-gray-400 italic">Non renseigné</span>}
    </span>
  </div>
);

export default Students;