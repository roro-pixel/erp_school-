import { useState } from 'react';
import { Search, Plus, Clock, Edit, Trash2, Check, X } from 'lucide-react';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  classId: string;
}

interface Absence {
  id: string;
  studentId: string;
  date: string;
  reason: string;
  justified: boolean;
  comment?: string;
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

const absencesData: Absence[] = [
  {
    id: "ABS-001",
    studentId: "STU-001",
    date: "2024-05-15",
    reason: "Maladie",
    justified: true,
    comment: "Certificat médical fourni"
  },
  {
    id: "ABS-002",
    studentId: "STU-003",
    date: "2024-05-16",
    reason: "Absence non justifiée",
    justified: false
  },
  {
    id: "ABS-003",
    studentId: "STU-002",
    date: "2024-05-17",
    reason: "Rendez-vous médical",
    justified: true,
    comment: "Prévenu à l'avance"
  }
];

const GestionAbscences = () => {
  const [absences, setAbsences] = useState<Absence[]>(absencesData);
  const [students] = useState<Student[]>(studentsData);
  const [classes] = useState<Class[]>(classesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newAbsence, setNewAbsence] = useState<Omit<Absence, 'id'>>({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
    justified: false,
    comment: ''
  });

  const filteredAbsences = absences.filter(absence => {
    const student = students.find(s => s.id === absence.studentId);
    const studentName = student ? `${student.firstname} ${student.lastname}`.toLowerCase() : '';
    const className = classes.find(c => c.id === student?.classId)?.name.toLowerCase() || '';
    
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      className.includes(searchTerm.toLowerCase()) ||
      absence.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      absence.date.includes(searchTerm)
    );
  });

  const handleSaveAbsence = () => {
    try {
      // Validation
      if (!newAbsence.studentId || !newAbsence.date || !newAbsence.reason) {
        throw new Error("Veuillez remplir tous les champs obligatoires.");
      }

      if (editingAbsence) {
        // Mise à jour
        const updatedAbsence = { ...editingAbsence, ...newAbsence };
        setAbsences(absences.map(a => a.id === editingAbsence.id ? updatedAbsence : a));
      } else {
        // Création
        const absenceToAdd = {
          ...newAbsence,
          id: `ABS-${Date.now()}`
        };
        setAbsences([...absences, absenceToAdd]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  const handleDeleteAbsence = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette absence ?")) {
      setAbsences(absences.filter(a => a.id !== id));
    }
  };

  const resetForm = () => {
    setNewAbsence({
      studentId: '',
      date: new Date().toISOString().split('T')[0],
      reason: '',
      justified: false,
      comment: ''
    });
    setEditingAbsence(null);
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            Gestion des Absences
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={16} /> Nouvelle absence
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raison</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAbsences.length > 0 ? (
                  filteredAbsences.map((absence) => {
                    const studentInfo = getStudentInfo(absence.studentId);
                    return (
                      <tr key={absence.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{studentInfo.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{studentInfo.class}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(absence.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{absence.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            absence.justified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {absence.justified ? 'Justifiée' : 'Non justifiée'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingAbsence(absence);
                              setNewAbsence({
                                studentId: absence.studentId,
                                date: absence.date,
                                reason: absence.reason,
                                justified: absence.justified,
                                comment: absence.comment || ''
                              });
                              setShowAddModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            title="Modifier"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteAbsence(absence.id)}
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
                      Aucune absence trouvée
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
                  {editingAbsence ? 'Modifier absence' : 'Nouvelle absence'}
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
                    value={newAbsence.studentId}
                    onChange={(e) => setNewAbsence({...newAbsence, studentId: e.target.value})}
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
                    <label className="block mb-1 font-medium">Date*</label>
                    <input
                      type="date"
                      value={newAbsence.date}
                      onChange={(e) => setNewAbsence({...newAbsence, date: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Statut</label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="justified"
                        checked={newAbsence.justified}
                        onChange={(e) => setNewAbsence({...newAbsence, justified: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="justified" className="ml-2 block text-sm text-gray-700">
                        Justifiée
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Raison*</label>
                  <input
                    type="text"
                    value={newAbsence.reason}
                    onChange={(e) => setNewAbsence({...newAbsence, reason: e.target.value})}
                    className="border p-2 w-full rounded"
                    placeholder="Maladie, rendez-vous..."
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Commentaire</label>
                  <textarea
                    value={newAbsence.comment}
                    onChange={(e) => setNewAbsence({...newAbsence, comment: e.target.value})}
                    className="border p-2 w-full rounded"
                    rows={3}
                    placeholder="Détails supplémentaires..."
                  />
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
                  onClick={handleSaveAbsence}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check size={16} />
                  {editingAbsence ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionAbscences;