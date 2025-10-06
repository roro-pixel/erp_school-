import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Définitions des types
export type Teacher = {
  id: number;
  teacherId: string;
  firstname: string;
  lastname: string;
  fullname: string;
  gender: string;
  dateOfBirth: string; 
  email: string;
  startingDate?: string; 
  phoneNumber?: string;
  active: boolean;
  speciality: string;
  salary: number;
  salaryType?: string;
  salaryFrequency?: string;
  position?: string;
  qualification?: string;
  createdAt: string; 
  updatedAt: string;
  deletedAt?: string;
};

export type TeacherRequest = {
  firstname: string;
  lastname: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  startingDate?: string;
  phoneNumber?: string;
  active?: boolean;
  speciality: string;
  salary: number;
};

export type TeacherResponse = {
  id: number;
  teacherId: string;
  firstname: string;
  lastname: string;
  fullname: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  startingDate?: string;
  phoneNumber?: string;
  active: boolean;
  speciality: string;
  salary: number;
  salaryType?: string;
  salaryFrequency?: string;
  position?: string;
  qualification?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type TeacherUpdateRequest = Partial<TeacherRequest> & {
  teacherId: string;
};

const API_BASE_URL = import.meta.env.VITE_API_URL;

const TeachersPage = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newTeacher, setNewTeacher] = useState<TeacherRequest>({ 
    firstname: '',
    lastname: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    startingDate: '',
    phoneNumber: '',
    active: true,
    speciality: '',
    salary: 0
  });

  // Fonction pour récupérer tous les enseignants
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/v1/teachers`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      console.log('Fetched teachers:', response.data);
      console.log('First teacher structure:', response.data[0]);
      console.log('About to set teachers state with:', response.data);
      
      setTeachers(response.data);
      
      // Vérifier ce qui est réellement stocké dans le state
      setTimeout(() => {
        console.log('Teachers state after setting:', teachers);
      }, 100);
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des enseignants';
      setError(errorMessage);
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer un enseignant
  const createTeacher = async (teacherData: TeacherRequest) => {
    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/v1/teachers/`, teacherData, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      setTeachers(prev => [...prev, response.data]);
      toast.success('Enseignant créé avec succès');
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour modifier un enseignant
  const updateTeacher = async (teacherId: string, teacherData: TeacherRequest) => {
    console.log('Updating teacher with ID:', teacherId);
    console.log('Teacher data:', teacherData);
    
    try {
      setSubmitting(true);
      const response = await axios.put(`${API_BASE_URL}/v1/teachers/${teacherId}`, teacherData, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      setTeachers(prev => prev.map(teacher => 
        teacher.teacherId === teacherId ? response.data : teacher
      ));
      toast.success('Enseignant modifié avec succès');
      setShowEditModal(false);
      setSelectedTeacher(null);
    } catch (err) {
      console.error('Update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification';
      toast.error(`Erreur: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour supprimer un enseignant
  const deleteTeacher = useCallback(async (teacherId: string) => {
    console.log('=== DELETE TEACHER FUNCTION ===');
    console.log('Deleting teacher with ID:', teacherId);
    console.log('teacherId type:', typeof teacherId);
    console.log('teacherId length:', teacherId?.length);
    
    if (!teacherId) {
      console.error('teacherId is falsy:', teacherId);
      toast.error('Erreur: ID enseignant manquant');
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      return;
    }

    try {
      console.log('Making DELETE request to:', `${API_BASE_URL}/v1/teachers/${teacherId}`);
      await axios.delete(`${API_BASE_URL}/v1/teachers/${teacherId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      setTeachers(prev => prev.filter(teacher => teacher.teacherId !== teacherId));
      toast.success('Enseignant supprimé avec succès');
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast.error(`Erreur: ${errorMessage}`);
    }
  }, []);

  // Fonction pour récupérer un enseignant spécifique
  const fetchTeacherById = async (teacherId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/teachers/${teacherId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'enseignant';
      toast.error(`Erreur: ${errorMessage}`);
      return null;
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setNewTeacher({
      firstname: '',
      lastname: '',
      gender: '',
      dateOfBirth: '',
      email: '',
      startingDate: '',
      phoneNumber: '',
      active: true,
      speciality: '',
      salary: 0
    });
  };

  // Fonction pour ouvrir le modal d'édition
  const openEditModal = async (teacher: Teacher) => {
    console.log('Opening edit modal for teacher:', teacher);
    console.log('Teacher ID:', teacher.teacherId);
    
    setSelectedTeacher(teacher);
    setNewTeacher({
      firstname: teacher.firstname,
      lastname: teacher.lastname,
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth,
      email: teacher.email,
      startingDate: teacher.startingDate || '',
      phoneNumber: teacher.phoneNumber || '',
      active: teacher.active,
      speciality: teacher.speciality,
      salary: teacher.salary
    });
    setShowEditModal(true);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submitting form...');
    console.log('showEditModal:', showEditModal);
    console.log('selectedTeacher:', selectedTeacher);
    
    if (showEditModal && selectedTeacher) {
      console.log('Calling updateTeacher with ID:', selectedTeacher.teacherId);
      await updateTeacher(selectedTeacher.teacherId, newTeacher);
    } else {
      console.log('Calling createTeacher');
      await createTeacher(newTeacher);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Debug: vérifier le state des teachers
  useEffect(() => {
    console.log('Teachers state changed:', teachers);
    if (teachers.length > 0) {
      console.log('First teacher in state:', teachers[0]);
      console.log('Keys of first teacher:', Object.keys(teachers[0]));
    }
  }, [teachers]);

  // Filtrer les enseignants
  const filteredTeachers = teachers.filter(teacher => {
    console.log('Filtering teacher:', teacher);
    console.log('Teacher teacherId in filter:', teacher.teacherId);
    
    const matchesSearch = 
      teacher.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur lors du chargement des données: {error}
          <button 
            onClick={fetchTeachers}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Enseignants</h1>
            <p className="text-gray-600">{teachers.length} enseignants au total</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ajouter un enseignant
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow">
          <div className="max-w-md">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              id="search"
              placeholder="Nom, prénom, spécialité ou email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Liste des enseignants */}
        {filteredTeachers.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">Aucun enseignant trouvé avec ces critères</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => {
              // Debug: vérifier la structure de chaque teacher dans le map
              console.log('Rendering teacher in map:', teacher);
              console.log('Teacher keys:', Object.keys(teacher));
              console.log('Teacher teacherId in map:', teacher.teacherId);
              
              return (
              <div key={teacher.teacherId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500 text-white rounded-full h-12 w-12 flex items-center justify-center mr-4">
                      {teacher.firstname.charAt(0)}{teacher.lastname.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-800">
                        {teacher.fullname}
                      </h2>
                      <p className="text-sm text-gray-500">{teacher.teacherId}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        teacher.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {teacher.active ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Spécialité</h3>
                      <p className="text-gray-800">{teacher.speciality}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="text-gray-800">{teacher.email}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Salaire</h3>
                      <p className="text-gray-800">{teacher.salary.toLocaleString()} FCFA</p>
                    </div>

                    {teacher.phoneNumber && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                        <p className="text-gray-800">{teacher.phoneNumber}</p>
                      </div>
                    )}

                    {teacher.position && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Poste</h3>
                        <p className="text-gray-800">{teacher.position}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => {
                        console.log('Edit button clicked for teacher:', teacher);
                        console.log('Teacher teacherId:', teacher.teacherId);
                        if (teacher.teacherId) {
                          openEditModal(teacher);
                        } else {
                          console.error('teacherId is undefined!', teacher);
                          toast.error('Erreur: ID enseignant manquant');
                        }
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        const id = teacher.teacherId;
                        console.log('BUTTON CLICK - Raw teacher object:', teacher);
                        console.log('BUTTON CLICK - teacher.teacherId direct:', teacher.teacherId);
                        console.log('BUTTON CLICK - id variable:', id);
                        console.log('BUTTON CLICK - teacher keys:', Object.keys(teacher));
                        
                        // Essayons aussi d'accéder autrement
                        console.log('BUTTON CLICK - teacher["teacherId"]:', teacher["teacherId"]);
                        
                        if (id) {
                          deleteTeacher(id);
                        } else {
                          console.error('ALL ID ATTEMPTS FAILED:', {
                            'teacher.teacherId': teacher.teacherId,
                            'teacher["teacherId"]': teacher["teacherId"],
                            'id variable': id,
                            'full teacher': teacher
                          });
                          toast.error('Erreur: ID enseignant manquant');
                        }
                      }}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Modal d'ajout/modification */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {showEditModal ? 'Modifier un enseignant' : 'Ajouter un enseignant'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacher.firstname}
                    onChange={(e) => setNewTeacher({...newTeacher, firstname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacher.lastname}
                    onChange={(e) => setNewTeacher({...newTeacher, lastname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre *
                  </label>
                  <select
                    required
                    value={newTeacher.gender}
                    onChange={(e) => setNewTeacher({...newTeacher, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    required
                    value={newTeacher.dateOfBirth}
                    onChange={(e) => setNewTeacher({...newTeacher, dateOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newTeacher.email}
                    onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spécialité *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacher.speciality}
                    onChange={(e) => setNewTeacher({...newTeacher, speciality: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salaire *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({...newTeacher, salary: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={newTeacher.startingDate}
                    onChange={(e) => setNewTeacher({...newTeacher, startingDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={newTeacher.phoneNumber}
                    onChange={(e) => setNewTeacher({...newTeacher, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newTeacher.active}
                    onChange={(e) => setNewTeacher({...newTeacher, active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Actif
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedTeacher(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'En cours...' : (showEditModal ? 'Modifier' : 'Ajouter')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersPage;