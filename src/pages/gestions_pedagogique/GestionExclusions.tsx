import { useState } from 'react';
import { Search, Plus, AlertTriangle, Edit, Trash2, Check, X } from 'lucide-react';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  classId: string;
}

interface Exclusion {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  comment?: string;
  notified: boolean;
}

interface Class {
  id: string;
  name: string;
}

// Données statiques issues du db.json
const studentsData: Student[] = [
  {
    "id": "STU-001",
    "firstname": "Luc",
    "lastname": "MAKOSSO",
    "classId": "CL-001"
  },
  {
    "id": "STU-002",
    "firstname": "Anne",
    "lastname": "NGOUMA",
    "classId": "CL-001"
  },
  {
    "id": "STU-003",
    "firstname": "Richard",
    "lastname": "MBEMBA",
    "classId": "CL-002"
  },
  {
    "id": "STU-004",
    "firstname": "Jeanne",
    "lastname": "OKOMBI",
    "classId": "CL-002"
  }
];

const classesData: Class[] = [
  {
    "id": "CL-001",
    "name": "Petite Section"
  },
  {
    "id": "CL-002",
    "name": "Moyenne Section"
  }
];

const exclusionsData: Exclusion[] = [
  {
    id: "EXC-001",
    studentId: "STU-003",
    startDate: "2024-05-10",
    endDate: "2024-05-12",
    reason: "Comportement violent",
    comment: "Bagarre dans la cour",
    notified: true
  },
  {
    id: "EXC-002",
    studentId: "STU-001",
    startDate: "2024-05-15",
    endDate: "2024-05-16",
    reason: "Non-respect répété du règlement",
    notified: false
  }
];

const GestionExclusions = () => {
  const [exclusions, setExclusions] = useState<Exclusion[]>(exclusionsData);
  const [students] = useState<Student[]>(studentsData);
  const [classes] = useState<Class[]>(classesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExclusion, setEditingExclusion] = useState<Exclusion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newExclusion, setNewExclusion] = useState<Omit<Exclusion, 'id'>>({
    studentId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 jour
    reason: '',
    comment: '',
    notified: false
  });

  const filteredExclusions = exclusions.filter(exclusion => {
    const student = students.find(s => s.id === exclusion.studentId);
    const studentName = student ? `${student.firstname} ${student.lastname}`.toLowerCase() : '';
    const className = classes.find(c => c.id === student?.classId)?.name.toLowerCase() || '';
    
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      className.includes(searchTerm.toLowerCase()) ||
      exclusion.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exclusion.startDate.includes(searchTerm) ||
      exclusion.endDate.includes(searchTerm)
    );
  });

  const handleSaveExclusion = () => {
    try {
      // Validation
      if (!newExclusion.studentId || !newExclusion.startDate || !newExclusion.endDate || !newExclusion.reason) {
        throw new Error("Veuillez remplir tous les champs obligatoires.");
      }

      if (new Date(newExclusion.endDate) < new Date(newExclusion.startDate)) {
        throw new Error("La date de fin doit être après la date de début.");
      }

      if (editingExclusion) {
        // Mise à jour
        const updatedExclusion = { ...editingExclusion, ...newExclusion };
        setExclusions(exclusions.map(e => e.id === editingExclusion.id ? updatedExclusion : e));
      } else {
        // Création
        const exclusionToAdd = {
          ...newExclusion,
          id: `EXC-${Date.now()}`
        };
        setExclusions([...exclusions, exclusionToAdd]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleDeleteExclusion = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette exclusion ?")) {
      setExclusions(exclusions.filter(e => e.id !== id));
    }
  };

  const resetForm = () => {
    setNewExclusion({
      studentId: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      reason: '',
      comment: '',
      notified: false
    });
    setEditingExclusion(null);
    setShowAddModal(false);
    setError(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStudentInfo = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { name: 'Inconnu', class: 'Inconnue' };
    
    const studentClass = classes.find(c => c.id === student.classId)?.name || 'Inconnue';
    return {
      name: `${student.firstname} ${student.lastname}`,
      class: studentClass
    };
  };

  const isActiveExclusion = (startDate: string, endDate: string): boolean => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return today >= start && today <= end;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            Gestion des Exclusions
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={16} /> Nouvelle exclusion
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
              placeholder="Rechercher par élève, classe ou raison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Élève</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raison</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExclusions.length > 0 ? (
                  filteredExclusions.map((exclusion) => {
                    const studentInfo = getStudentInfo(exclusion.studentId);
                    const isActive = isActiveExclusion(exclusion.startDate, exclusion.endDate);
                    
                    return (
                      <tr key={exclusion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{studentInfo.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{studentInfo.class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {formatDate(exclusion.startDate)} - {formatDate(exclusion.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{exclusion.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              isActive ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isActive ? 'En cours' : 'Terminée'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              exclusion.notified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {exclusion.notified ? 'Notifiée' : 'À notifier'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingExclusion(exclusion);
                              setNewExclusion({
                                studentId: exclusion.studentId,
                                startDate: exclusion.startDate,
                                endDate: exclusion.endDate,
                                reason: exclusion.reason,
                                comment: exclusion.comment || '',
                                notified: exclusion.notified
                              });
                              setShowAddModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteExclusion(exclusion.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Aucune exclusion trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'ajout/modification */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingExclusion ? 'Modifier exclusion' : 'Nouvelle exclusion'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
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
                  <label className="block mb-1 font-medium">Élève*</label>
                  <select
                    value={newExclusion.studentId}
                    onChange={(e) => setNewExclusion({...newExclusion, studentId: e.target.value})}
                    className="border p-2 w-full rounded"
                    required
                  >
                    <option value="">Sélectionner un élève</option>
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstname} {student.lastname} - {classes.find(c => c.id === student.classId)?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Date début*</label>
                    <input
                      type="date"
                      value={newExclusion.startDate}
                      onChange={(e) => setNewExclusion({...newExclusion, startDate: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Date fin*</label>
                    <input
                      type="date"
                      value={newExclusion.endDate}
                      onChange={(e) => setNewExclusion({...newExclusion, endDate: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Raison*</label>
                  <input
                    type="text"
                    value={newExclusion.reason}
                    onChange={(e) => setNewExclusion({...newExclusion, reason: e.target.value})}
                    className="border p-2 w-full rounded"
                    placeholder="Comportement, incident..."
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Commentaire</label>
                  <textarea
                    value={newExclusion.comment}
                    onChange={(e) => setNewExclusion({...newExclusion, comment: e.target.value})}
                    className="border p-2 w-full rounded"
                    rows={3}
                    placeholder="Détails de l'incident..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="notified"
                    checked={newExclusion.notified}
                    onChange={(e) => setNewExclusion({...newExclusion, notified: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="notified" className="ml-2 block text-sm text-gray-700">
                    Parents notifiés
                  </label>
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
                  onClick={handleSaveExclusion}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingExclusion ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionExclusions;