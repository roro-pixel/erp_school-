import { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Edit, Trash2, Check, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  shortName: string;
  coefficient: number;
  color: string;
}

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({
    name: '',
    shortName: '',
    coefficient: 1,
    color: '#4C51BF'
  });

  // Couleurs prédéfinies pour les matières
  const colorOptions = [
    { value: '#4C51BF', label: 'Violet' },
    { value: '#ED8936', label: 'Orange' },
    { value: '#38B2AC', label: 'Turquoise' },
    { value: '#F56565', label: 'Rouge' },
    { value: '#48BB78', label: 'Vert' },
    { value: '#805AD5', label: 'Pourpre' },
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Simulation d'appel API
        const response = await fetch('http://localhost:3000/subjects');
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        console.error("Erreur de chargement:", err);
        setError("Impossible de charger les matières. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveSubject = async () => {
    try {
      // Validation
      if (!newSubject.name || !newSubject.shortName || newSubject.coefficient < 1) {
        throw new Error("Veuillez remplir tous les champs correctement.");
      }

      if (editingSubject) {
        // Mise à jour
        const updatedSubject = { ...editingSubject, ...newSubject };
        
        // Simulation d'appel API PUT
        // await fetch(`http://localhost:3000/subjects/${editingSubject.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updatedSubject)
        // });
        
        setSubjects(subjects.map(s => s.id === editingSubject.id ? updatedSubject : s));
      } else {
        // Création
        const subjectToAdd = {
          ...newSubject,
          id: `SUBJ-${Date.now()}`
        };
        
        // Simulation d'appel API POST
        // await fetch('http://localhost:3000/subjects', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(subjectToAdd)
        // });
        
        setSubjects([...subjects, subjectToAdd]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
      try {
        // Simulation d'appel API DELETE
        // await fetch(`http://localhost:3000/subjects/${id}`, {
        //   method: 'DELETE'
        // });
        
        setSubjects(subjects.filter(s => s.id !== id));
      } catch (err) {
        console.error("Erreur de suppression:", err);
        setError("Impossible de supprimer la matière. Veuillez réessayer.");
      }
    }
  };

  const resetForm = () => {
    setNewSubject({
      name: '',
      shortName: '',
      coefficient: 1,
      color: '#4C51BF'
    });
    setEditingSubject(null);
    setShowAddModal(false);
    setError(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            Gestion des Matières
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={16} /> Ajouter une matière
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abréviation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coefficient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Couleur</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{ backgroundColor: subject.color }}
                            ></div>
                            <div className="font-medium text-gray-900">{subject.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{subject.shortName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{subject.coefficient}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            className="w-6 h-6 rounded-full border border-gray-300" 
                            style={{ backgroundColor: subject.color }}
                          ></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingSubject(subject);
                              setNewSubject({
                                name: subject.name,
                                shortName: subject.shortName,
                                coefficient: subject.coefficient,
                                color: subject.color
                              });
                              setShowAddModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(subject.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Aucune matière trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingSubject ? 'Modifier la matière' : 'Ajouter une matière'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                  title='supp'
                >
                  <X size={20} />
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Nom complet*</label>
                  <input
                    type="text"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    className="border p-2 w-full rounded"
                    placeholder="Mathématiques"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Abréviation*</label>
                    <input
                      type="text"
                      value={newSubject.shortName}
                      onChange={(e) => setNewSubject({...newSubject, shortName: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Math"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Coefficient*</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSubject.coefficient}
                      onChange={(e) => setNewSubject({...newSubject, coefficient: parseInt(e.target.value) || 1})}
                      className="border p-2 w-full rounded"
                      title='coefficient'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map(color => (
                      <div 
                        key={color.value}
                        onClick={() => setNewSubject({...newSubject, color: color.value})}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${newSubject.color === color.value ? 'border-blue-500' : 'border-transparent'}`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button 
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveSubject}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingSubject ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsPage;