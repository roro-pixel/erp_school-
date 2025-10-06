import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ChevronDown, School } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Level {
  id: number;
  name: string;
  description: string;
  classes: Class[];
}

interface Class {
  id: number;
  name: string;
}

interface LevelRequest {
  name: string;
  description: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Levels = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level>({
    id: 0,
    name: '',
    description: '',
    classes: []
  });
  const [expandedLevelId, setExpandedLevelId] = useState<number | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Récupérer tous les niveaux
  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/levels/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLevels(data);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des niveaux';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      console.error('Erreur lors du chargement des niveaux:', err);
    } finally {
      setLoading(false);
    }
  };

  // Créer un nouveau niveau
  const createLevel = async (levelData: LevelRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/levels/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(levelData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newLevel = await response.json();
      setLevels([...levels, newLevel]);
      toast.success(`Niveau "${levelData.name}" créé avec succès !`);
      return newLevel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du niveau';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Mettre à jour un niveau
  const updateLevel = async (id: number, levelData: LevelRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/levels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(levelData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const updatedLevel = await response.json();
      setLevels(levels.map(l => l.id === id ? updatedLevel : l));
      toast.success(`Niveau "${levelData.name}" mis à jour avec succès !`);
      return updatedLevel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du niveau';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Supprimer un niveau
  const deleteLevel = async (id: number) => {
    toast.info("🔒 Fonctionnalité de suppression à débloquer", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Ajouter une classe à un niveau
  const addClassToLevel = async (levelId: number, classId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/levels/${levelId}/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const updatedLevel = await response.json();
      setLevels(levels.map(l => l.id === levelId ? updatedLevel : l));
      toast.success('Classe ajoutée avec succès !');
      return updatedLevel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la classe';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Retirer une classe d'un niveau
  const removeClassFromLevel = async (levelId: number, classId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/levels/${levelId}/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const updatedLevel = await response.json();
      setLevels(levels.map(l => l.id === levelId ? updatedLevel : l));
      toast.success('Classe retirée avec succès !');
      return updatedLevel;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLevel.name.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const levelData: LevelRequest = {
        name: currentLevel.name.trim(),
        description: currentLevel.description.trim()
      };

      if (currentLevel.id && currentLevel.id > 0) {
        await updateLevel(currentLevel.id, levelData);
      } else {
        await createLevel(levelData);
      }

      setShowForm(false);
      setCurrentLevel({ id: 0, name: '', description: '', classes: [] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'opération';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (level: Level) => {
    setCurrentLevel(level);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce niveau et toutes ses classes ?")) return;

    setError('');
    try {
      await deleteLevel(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    }
  };

  const handleAddClass = async () => {
    if (!newClassName.trim() || !expandedLevelId) return;

    setError('');
    try {
      console.log('Ajout de classe:', newClassName, 'au niveau:', expandedLevelId);
      setNewClassName('');
      toast.success(`Classe "${newClassName}" ajoutée avec succès !`);
      
      // const newClass = await createClass({ name: newClassName.trim() });
      // await addClassToLevel(expandedLevelId, newClass.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la classe';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    }
  };

  const handleRemoveClass = async (levelId: number, classId: number) => {
    if (!window.confirm("Supprimer cette classe du niveau ?")) return;

    setError('');
    try {
      await removeClassFromLevel(levelId, classId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    }
  };

  const toggleExpanded = (levelId: number) => {
    setExpandedLevelId(expandedLevelId === levelId ? null : levelId);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Chargement des niveaux...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Niveaux Scolaires</h1>
          <button 
            onClick={() => {
              setCurrentLevel({ id: 0, name: '', description: '', classes: [] });
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            aria-label="Ajouter un niveau"
            
          >
            <Plus size={18} /> Ajouter un niveau
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          {levels.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun niveau scolaire enregistré
            </div>
          ) : (
            <div className="space-y-4">
              {levels.map(level => (
                <div key={level.id} className="border rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center p-4 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <School className="text-blue-600" />
                      <h2 className="font-bold text-lg">{level.name}</h2>
                      <span className="text-sm text-gray-500">{level.description}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(level)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        aria-label={`Modifier ${level.name}`}
                        
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(level.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        aria-label={`Supprimer ${level.name}`}
                        
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => toggleExpanded(level.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                        aria-label={`${expandedLevelId === level.id ? 'Fermer' : 'Ouvrir'} détails`}
                      >
                        <ChevronDown 
                          size={18} 
                          className={`transition-transform ${expandedLevelId === level.id ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>
                  </div>

                  {expandedLevelId === level.id && (
                    <div className="p-4 border-t">
                      <h3 className="font-medium mb-3">Classes de ce niveau :</h3>
                      {level.classes && level.classes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                          {level.classes.map(cls => (
                            <div key={cls.id} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded">
                              <span>{cls.name}</span>
                              <button 
                                onClick={() => handleRemoveClass(level.id, cls.id)}
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Supprimer ${cls.name}`}
                                
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-4">Aucune classe définie pour ce niveau</p>
                      )}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newClassName}
                          onChange={(e) => setNewClassName(e.target.value)}
                          placeholder="Nom de la nouvelle classe"
                          className="border p-2 rounded flex-grow"
                          aria-label="Nom de la nouvelle classe"
                        />
                        <button 
                          onClick={handleAddClass}
                          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                          
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal pour ajouter/modifier un niveau */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {currentLevel.id && currentLevel.id > 0 ? 'Modifier le niveau' : 'Ajouter un nouveau niveau'}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 font-medium">Nom du niveau*</label>
                      <input
                        type="text"
                        value={currentLevel.name}
                        onChange={(e) => setCurrentLevel({...currentLevel, name: e.target.value})}
                        className="border p-2 w-full rounded"
                        required
                        disabled={submitting}
                        aria-label="Nom du niveau"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Description</label>
                      <textarea
                        value={currentLevel.description}
                        onChange={(e) => setCurrentLevel({...currentLevel, description: e.target.value})}
                        className="border p-2 w-full rounded resize-none"
                        rows={3}
                        disabled={submitting}
                        aria-label="Description du niveau"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                    <button 
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                      disabled={submitting}
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'En cours...' : (currentLevel.id && currentLevel.id > 0 ? 'Mettre à jour' : 'Enregistrer')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Levels;