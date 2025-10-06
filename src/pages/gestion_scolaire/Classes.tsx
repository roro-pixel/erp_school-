import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Level {
  id: number;
  name: string;
  description: string;
}

interface StudentInClass {
  id: string;
  firstname: string;
  lastname: string;
  classes: string;
}

interface Class {
  id: string;
  name: string;
  description?: string | null;
  academicYear: string;
  levelId: number;
  levelName?: string;
  classFee: number;
  students: StudentInClass[];
}

interface ClassRequest {
  name: string;
  levelId: number;
  description?: string;
  academicYear?: string;
  classFee: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newClass, setNewClass] = useState<ClassRequest>({ 
    name: '', 
    levelId: 0,
    description: '',
    academicYear: '',
    classFee: 0
  });
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // Récupérer toutes les classes
  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/classes/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des classes';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Récupérer tous les niveaux
  const fetchLevels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/levels/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error('Impossible de charger les niveaux');
      }
      
      const data = await response.json();
      setLevels(data);
    } catch (err) {
      console.warn('Erreur lors du chargement des niveaux:', err);
      toast.error('Impossible de charger les niveaux. Veuillez vérifier votre connexion.');
    }
  };

  // Créer une nouvelle classe
  const createClass = async (classData: ClassRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/classes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newClass = await response.json();
      setClasses([...classes, newClass]);
      toast.success(`Classe "${classData.name}" créée avec succès !`);
      return newClass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la classe';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Mettre à jour une classe - PUT /v1/classes/{classId}
  const updateClass = async (id: string, classData: ClassRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/classes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(classData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const updatedClass = await response.json();
      setClasses(classes.map(c => c.id === id ? updatedClass : c));
      toast.success(`Classe "${classData.name}" mise à jour avec succès !`);
      return updatedClass;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la classe';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Supprimer une classe - DELETE /v1/classes/{classId}
  const deleteClass = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/classes/${id}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      setClasses(classes.filter(c => c.id !== id));
      toast.success('Classe supprimée avec succès !');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await Promise.all([
          fetchClasses(),
          fetchLevels()
        ]);
        
      } catch (error) {
        console.error("Erreur de chargement:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(errorMessage);
        toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const formatAcademicYear = (academicYear: string): string => {
    if (!academicYear) return 'Non définie';
    
    // Format: "2000-01-01-2000-12-31" -> "2000-2000"
    const parts = academicYear.split('-');
    if (parts.length >= 4) {
      const startYear = parts[0];
      const endYear = parts[3];
      return `${startYear}-${endYear}`;
    }
    return academicYear;
  };

  const getLevelName = (levelId: number): string => {
    const level = levels.find(l => l.id === levelId);
    return level ? level.name : `Niveau ${levelId}`;
  };

  const toggleExpandClass = (classId: string) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const handleAddClass = async () => {
    if (!newClass.name.trim()) {
      setError('Veuillez remplir le nom de la classe');
      toast.error('Désolé, veuillez remplir le nom de la classe');
      return;
    }

    if (!newClass.levelId || newClass.levelId === 0) {
      setError('Veuillez sélectionner un niveau');
      toast.error('Désolé, veuillez sélectionner un niveau');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createClass({
        name: newClass.name.trim(),
        levelId: newClass.levelId,
        description: newClass.description?.trim() || undefined,
        academicYear: newClass.academicYear?.trim() || undefined,
        classFee: newClass.classFee
      });

      setShowAddModal(false);
      setNewClass({ name: '', levelId: 0, description: '', academicYear: '', classFee: 0 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la classe';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClass = async () => {
    if (!editingClass || !editingClass.name.trim()) {
      setError('Veuillez remplir le nom de la classe');
      toast.error('Désolé, veuillez remplir le nom de la classe');
      return;
    }

    if (!editingClass.levelId || editingClass.levelId === 0) {
      setError('Veuillez sélectionner un niveau');
      toast.error('Désolé, veuillez sélectionner un niveau');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateClass(editingClass.id, {
        name: editingClass.name.trim(),
        levelId: editingClass.levelId,
        description: editingClass.description?.trim() || undefined,
        academicYear: editingClass.academicYear?.trim() || undefined,
        classFee: editingClass.classFee
      });

      setShowEditModal(false);
      setEditingClass(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la classe';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;
    
    setError(null);
    try {
      await deleteClass(classId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    }
  };

  const openEditModal = (classToEdit: Class) => {
    setEditingClass({ ...classToEdit });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Classes</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} /> Ajouter une classe
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom de classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année Académique</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Élèves</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.length > 0 ? (
                    filteredClasses.map(cls => {
                      return (
                        <>
                          <tr key={cls.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-blue-600 font-medium">{getLevelName(cls.levelId)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{cls.description || 'Aucune description'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar size={14} />
                                {formatAcademicYear(cls.academicYear)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  {cls.students?.length || 0} élève{cls.students?.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => toggleExpandClass(cls.id)}
                                className="text-gray-600 hover:text-gray-900 mr-4"
                                title="Voir les élèves"
                              >
                                {expandedClass === cls.id ? (
                                  <ChevronUp size={18} />
                                ) : (
                                  <ChevronDown size={18} />
                                )}
                              </button>
                              <button 
                                onClick={() => openEditModal(cls)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                                title="Modifier"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClass(cls.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                          {expandedClass === cls.id && (
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-4">
                                <div className="pl-8 pr-4">
                                  <h3 className="font-medium mb-2">
                                    Liste des élèves ({cls.students?.length || 0})
                                  </h3>
                                  {cls.students && cls.students.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {cls.students.map(student => (
                                        <div key={student.id} className="bg-white p-3 rounded shadow-sm border">
                                          <div className="font-medium">
                                            {student.firstname} {student.lastname}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            ID: {student.id}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 italic">Aucun élève dans cette classe</div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Aucune classe trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal pour ajouter une classe */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Ajouter une nouvelle classe</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Nom de la classe*</label>
                    <input
                      type="text"
                      value={newClass.name}
                      onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 6e A, Terminal C..."
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Niveau*</label>
                    <select
                      value={newClass.levelId}
                      onChange={(e) => setNewClass({...newClass, levelId: Number(e.target.value)})}
                      className="border p-2 w-full rounded"
                      required
                      disabled={submitting}
                    >
                      <option value={0}>Sélectionner un niveau</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                      value={newClass.description || ''}
                      onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                      className="border p-2 w-full rounded resize-none"
                      rows={3}
                      placeholder="Description optionnelle..."
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Année Académique</label>
                    <input
                      type="text"
                      value={newClass.academicYear || ''}
                      onChange={(e) => setNewClass({...newClass, academicYear: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 2024-2025 ou 2024-01-01-2024-12-31"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Montant de la classe (FCFA)</label>
                    <input
                      type="number"
                      min={0}
                      value={newClass.classFee}
                      onChange={e => setNewClass({ ...newClass, classFee: Number(e.target.value) })}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 75000"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddClass}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting || !newClass.name || !newClass.levelId}
                  >
                    {submitting ? 'En cours...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour modifier une classe */}
        {showEditModal && editingClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Modifier la classe</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Nom de la classe*</label>
                    <input
                      type="text"
                      value={editingClass.name}
                      onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 6e A, Terminal C..."
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Niveau*</label>
                    <select
                      value={editingClass.levelId}
                      onChange={(e) => setEditingClass({...editingClass, levelId: Number(e.target.value)})}
                      className="border p-2 w-full rounded"
                      required
                      disabled={submitting}
                    >
                      <option value={0}>Sélectionner un niveau</option>
                      {levels.map(level => (
                        <option key={level.id} value={level.id}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                      value={editingClass.description || ''}
                      onChange={(e) => setEditingClass({...editingClass, description: e.target.value})}
                      className="border p-2 w-full rounded resize-none"
                      rows={3}
                      placeholder="Description optionnelle..."
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Année Académique</label>
                    <input
                      type="text"
                      value={editingClass.academicYear || ''}
                      onChange={(e) => setEditingClass({...editingClass, academicYear: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 2024-2025 ou 2024-01-01-2024-12-31"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Montant de la classe (FCFA)</label>
                    <input
                      type="number"
                      value={editingClass.classFee}
                      onChange={e => setEditingClass({ ...editingClass, classFee: Number(e.target.value) })}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 75000"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingClass(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleEditClass}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting || !editingClass.name || !editingClass.levelId}
                  >
                    {submitting ? 'En cours...' : 'Modifier'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;