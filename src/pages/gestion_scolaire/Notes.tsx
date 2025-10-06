import { useState, useEffect } from 'react';
import { Search, Plus, BarChart2, Clock, BookOpen, Calendar, ArrowLeft, Edit, Trash2} from 'lucide-react';

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  classId: string;
  gender: string;
}

interface Class {
  id: string;
  name: string;
  levelId: string;
}

interface Subject {
  id: string;
  name: string;
  shortName: string;
  coefficient: number;
  color: string;
}

interface Quarter {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  value: number;
  type: string;
  coefficient: number;
  date: string;
  comment: string;
  quarter: number;
}

interface SubjectWithGrades {
  subject: Subject;
  grades: Grade[];
  average: number | null;
}

interface StudentGradesReport {
  student: Student;
  class: Class | undefined;
  subjectsWithGrades: SubjectWithGrades[];
  generalAverage: number | null;
}

const StudentGrades = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [subjectsByClass, setSubjectsByClass] = useState<{ classId: string; subjects: string[] }[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(0);
  const [showAddGradeModal, setShowAddGradeModal] = useState<boolean>(false);
  const [gradeToEdit, setGradeToEdit] = useState<Grade | null>(null);
  
  const [newGrade, setNewGrade] = useState<Omit<Grade, 'id'>>({
    studentId: '',
    subjectId: '',
    value: 0,
    type: 'EVALUATION',
    coefficient: 1,
    date: new Date().toISOString().split('T')[0],
    comment: '',
    quarter: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulons des appels API pour récupérer les données
        const studentsRes = await fetch('http://localhost:3000/students');
        const classesRes = await fetch('http://localhost:3000/classes');
        const subjectsRes = await fetch('http://localhost:3000/subjects');
        const gradesRes = await fetch('http://localhost:3000/grades');
        const quartersRes = await fetch('http://localhost:3000/quarters');
        const subjectsByClassRes = await fetch('http://localhost:3000/subjectsByClass');
        
        const studentsData = await studentsRes.json();
        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        const gradesData = await gradesRes.json();
        const quartersData = await quartersRes.json();
        const subjectsByClassData = await subjectsByClassRes.json();
        
        setStudents(studentsData);
        setClasses(classesData);
        setSubjects(subjectsData);
        setGrades(gradesData);
        setQuarters(quartersData);
        setSubjectsByClass(subjectsByClassData);
        
        // Par défaut, sélectionnez le trimestre actuel
        const currentDate = new Date();
        const currentQuarter = quartersData.find(
          q => new Date(q.startDate) <= currentDate && new Date(q.endDate) >= currentDate
        );
        if (currentQuarter) {
          setSelectedQuarter(currentQuarter.id);
        } else {
          // Si aucun trimestre en cours, prenez le premier
          setSelectedQuarter(quartersData[0]?.id || 1);
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setError("Une erreur est survenue lors du chargement des données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mise à jour des champs du nouveau grade
  useEffect(() => {
    if (selectedStudentId) {
      setNewGrade(prev => ({
        ...prev,
        studentId: selectedStudentId,
        quarter: selectedQuarter
      }));
    }
  }, [selectedStudentId, selectedQuarter]);

  // Filtrer les étudiants en fonction du terme de recherche
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const className = classes.find(c => c.id === student.classId)?.name || '';
    
    return (
      `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchLower) ||
      className.toLowerCase().includes(searchLower)
    );
  });

  // Calculer la moyenne d'une matière pour un étudiant et un trimestre
  const calculateSubjectAverage = (studentId: string, subjectId: string, quarter: number): number | null => {
    const studentGrades = grades.filter(
      g => g.studentId === studentId && g.subjectId === subjectId && (quarter === 0 || g.quarter === quarter)
    );
    
    if (studentGrades.length === 0) return null;
    
    let totalWeightedGrade = 0;
    let totalCoefficient = 0;
    
    studentGrades.forEach(grade => {
      totalWeightedGrade += grade.value * grade.coefficient;
      totalCoefficient += grade.coefficient;
    });
    
    return totalCoefficient > 0 ? parseFloat((totalWeightedGrade / totalCoefficient).toFixed(2)) : null;
  };

  // Préparer le rapport de notes complet pour un étudiant
  const prepareStudentGradesReport = (studentId: string): StudentGradesReport | null => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;
    
    const studentClass = classes.find(c => c.id === student.classId);
    
    // Trouver les matières disponibles pour la classe de l'étudiant
    const classSubjectIds = subjectsByClass.find(s => s.classId === student.classId)?.subjects || [];
    const classSubjects = subjects.filter(s => classSubjectIds.includes(s.id));
    
    // Préparer les matières avec leurs notes et moyennes
    const subjectsWithGrades: SubjectWithGrades[] = classSubjects.map(subject => {
      const subjectGrades = grades.filter(
        g => g.studentId === studentId && g.subjectId === subject.id && (selectedQuarter === 0 || g.quarter === selectedQuarter)
      );
      
      const average = calculateSubjectAverage(studentId, subject.id, selectedQuarter);
      
      return {
        subject,
        grades: subjectGrades,
        average
      };
    });
    
    // Calculer la moyenne générale
    let totalWeightedAverage = 0;
    let totalCoefficient = 0;
    let validSubjects = 0;
    
    subjectsWithGrades.forEach(swg => {
      if (swg.average !== null) {
        totalWeightedAverage += swg.average * swg.subject.coefficient;
        totalCoefficient += swg.subject.coefficient;
        validSubjects++;
      }
    });
    
    const generalAverage = validSubjects > 0 ? parseFloat((totalWeightedAverage / totalCoefficient).toFixed(2)) : null;
    
    return {
      student,
      class: studentClass,
      subjectsWithGrades,
      generalAverage
    };
  };

  // Ajouter ou modifier une note
  const handleSaveGrade = async () => {
    try {
      if (!newGrade.studentId || !newGrade.subjectId || newGrade.value < 0 || newGrade.value > 20) {
        throw new Error("Veuillez remplir tous les champs correctement. La note doit être entre 0 et 20.");
      }

      let gradeToSave: Grade;
      
      if (gradeToEdit) {
        // Mise à jour d'une note existante
        gradeToSave = {
          ...gradeToEdit,
          ...newGrade,
          id: gradeToEdit.id
        };
        
        // Simulation d'une requête PUT
        // await fetch(`http://localhost:3000/grades/${gradeToEdit.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(gradeToSave)
        // });
        
        // Mise à jour locale des notes
        setGrades(grades.map(g => g.id === gradeToEdit.id ? gradeToSave : g));
      } else {
        // Création d'une nouvelle note
        gradeToSave = {
          ...newGrade,
          id: `GRD-${Date.now()}`
        } as Grade;
        
        // Simulation d'une requête POST
        // await fetch('http://localhost:3000/grades', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(gradeToSave)
        // });
        
        // Ajout local de la note
        setGrades([...grades, gradeToSave]);
      }
      
      // Réinitialiser le formulaire et fermer le modal
      resetForm();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  // Supprimer une note
  const handleDeleteGrade = async (gradeId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) {
      try {
        // Simulation d'une requête DELETE
        // await fetch(`http://localhost:3000/grades/${gradeId}`, {
        //   method: 'DELETE'
        // });
        
        // Suppression locale de la note
        setGrades(grades.filter(g => g.id !== gradeId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setError("Une erreur est survenue lors de la suppression");
      }
    }
  };

  // Réinitialiser le formulaire d'ajout/modification de note
  const resetForm = () => {
    setNewGrade({
      studentId: selectedStudentId || '',
      subjectId: '',
      value: 0,
      type: 'EVALUATION',
      coefficient: 1,
      date: new Date().toISOString().split('T')[0],
      comment: '',
      quarter: selectedQuarter
    });
    setGradeToEdit(null);
    setShowAddGradeModal(false);
    setError(null);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Obtenir la couleur de fond en fonction de la note
  const getGradeColor = (value: number): string => {
    if (value >= 16) return 'bg-green-100 text-green-800';
    if (value >= 14) return 'bg-green-50 text-green-700';
    if (value >= 12) return 'bg-blue-50 text-blue-700';
    if (value >= 10) return 'bg-yellow-50 text-yellow-700';
    if (value >= 8) return 'bg-orange-50 text-orange-700';
    return 'bg-red-50 text-red-700';
  };

  // Obtenir une description du niveau en fonction de la note
  const getGradeLevel = (value: number): string => {
    if (value >= 16) return 'Très bien';
    if (value >= 14) return 'Bien';
    if (value >= 12) return 'Assez bien';
    if (value >= 10) return 'Passable';
    if (value >= 8) return 'Insuffisant';
    return 'Très insuffisant';
  };

  // Vue détaillée des notes d'un étudiant
  if (selectedStudentId) {
    const studentReport = prepareStudentGradesReport(selectedStudentId);
    
    if (!studentReport) return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">L'élève sélectionné n'a pas été trouvé.</p>
            <button
              onClick={() => setSelectedStudentId(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setSelectedStudentId(null)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={16} /> Retour à la liste
            </button>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500" size={18} />
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                  title='liste'
                  className="border p-2 rounded"
                >
                  <option value={0}>Tous les trimestres</option>
                  {quarters.map(quarter => (
                    <option key={quarter.id} value={quarter.id}>
                      {quarter.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={() => {
                  setGradeToEdit(null);
                  setShowAddGradeModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Plus size={16} /> Ajouter une note
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">
                    {studentReport.student.firstname} {studentReport.student.lastname}
                  </h1>
                  <p className="mt-1">
                    Classe : {studentReport.class?.name || 'Non assignée'}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-medium">Moyenne générale</div>
                  {studentReport.generalAverage !== null ? (
                    <div className="mt-2 flex flex-col items-center">
                      <div className={`text-3xl font-bold ${
                        studentReport.generalAverage >= 14 ? 'text-green-300' :
                        studentReport.generalAverage >= 10 ? 'text-yellow-300' :
                        'text-red-300'
                      }`}>
                        {studentReport.generalAverage.toFixed(2)}/20
                      </div>
                      <div className="text-sm mt-1">
                        {getGradeLevel(studentReport.generalAverage)}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xl text-gray-300">Aucune note</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <BookOpen size={20} /> Matières et notes
              </h2>
              
              {studentReport.subjectsWithGrades.length > 0 ? (
                <div className="space-y-6">
                  {studentReport.subjectsWithGrades.map(swg => (
                    <div key={swg.subject.id} className="border rounded-lg overflow-hidden">
                      <div className="flex justify-between items-center p-4" style={{ backgroundColor: `${swg.subject.color}20` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: swg.subject.color }}></div>
                          <h3 className="text-lg font-medium">{swg.subject.name}</h3>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-sm text-gray-500">
                            Coefficient: {swg.subject.coefficient}
                          </div>
                          
                          {swg.average !== null ? (
                            <div className={`px-3 py-1 rounded-full ${getGradeColor(swg.average)}`}>
                              {swg.average.toFixed(2)}/20
                            </div>
                          ) : (
                            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                              Pas de note
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {swg.grades.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {swg.grades.map(grade => (
                            <div key={grade.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className={`px-2 py-1 rounded-full text-xs ${getGradeColor(grade.value)}`}>
                                      {grade.value.toFixed(2)}/20
                                    </div>
                                    <span className="text-sm font-medium">
                                      {grade.type}
                                      {grade.coefficient > 1 && ` (coef. ${grade.coefficient})`}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{grade.comment}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock size={14} /> {formatDate(grade.date)}
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      setGradeToEdit(grade);
                                      setNewGrade({
                                        studentId: grade.studentId,
                                        subjectId: grade.subjectId,
                                        value: grade.value,
                                        type: grade.type,
                                        coefficient: grade.coefficient,
                                        date: grade.date,
                                        comment: grade.comment,
                                        quarter: grade.quarter
                                      });
                                      setShowAddGradeModal(true);
                                    }}
                                    className="p-1 text-blue-600 hover:text-blue-800 rounded"
                                    title="Modifier"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteGrade(grade.id)}
                                    className="p-1 text-red-600 hover:text-red-800 rounded"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Aucune note pour cette matière
                          <button
                            onClick={() => {
                              setNewGrade(prev => ({
                                ...prev,
                                subjectId: swg.subject.id
                              }));
                              setShowAddGradeModal(true);
                            }}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            Ajouter une note
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune matière trouvée pour cet élève.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Modal pour ajouter/modifier une note */}
        {showAddGradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">
                  {gradeToEdit ? 'Modifier la note' : 'Ajouter une note'}
                </h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                    {error}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Matière*</label>
                    <select
                      value={newGrade.subjectId}
                      onChange={(e) => setNewGrade({...newGrade, subjectId: e.target.value})}
                      className="border p-2 w-full rounded"
                      title='matiere'
                      required
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects.filter(subject => {
                        const studentClass = students.find(s => s.id === selectedStudentId)?.classId;
                        const classSubjects = subjectsByClass.find(sc => sc.classId === studentClass)?.subjects || [];
                        return classSubjects.includes(subject.id);
                      }).map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Note (/20)*</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={newGrade.value}
                        onChange={(e) => setNewGrade({...newGrade, value: parseFloat(e.target.value) || 0})}
                        className="border p-2 w-full rounded"
                        title='note'
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block mb-1 font-medium">Coefficient</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newGrade.coefficient}
                        onChange={(e) => setNewGrade({...newGrade, coefficient: parseInt(e.target.value) || 1})}
                        className="border p-2 w-full rounded"
                        title='coefficient'
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Type d'évaluation</label>
                      <select
                        value={newGrade.type}
                        onChange={(e) => setNewGrade({...newGrade, type: e.target.value})}
                        className="border p-2 w-full rounded"
                        title='typeevaluation'
                      >
                        <option value="EVALUATION">Évaluation</option>
                        <option value="DEVOIR">Devoir</option>
                        <option value="PROJET">Projet</option>
                        <option value="CONTROLE">Contrôle</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block mb-1 font-medium">Date</label>
                      <input
                        type="date"
                        value={newGrade.date}
                        onChange={(e) => setNewGrade({...newGrade, date: e.target.value})}
                        className="border p-2 w-full rounded"
                        title='date'
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Trimestre</label>
                    <select
                      value={newGrade.quarter}
                      onChange={(e) => setNewGrade({...newGrade, quarter: parseInt(e.target.value)})}
                      className="border p-2 w-full rounded"
                      title='trimestre'
                    >
                      {quarters.map(quarter => (
                        <option key={quarter.id} value={quarter.id}>
                          {quarter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block mb-1 font-medium">Commentaire</label>
                    <textarea
                      value={newGrade.comment}
                      onChange={(e) => setNewGrade({...newGrade, comment: e.target.value})}
                      className="border p-2 w-full rounded"
                      rows={3}
                      title='commentaire'
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
                    onClick={handleSaveGrade}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {gradeToEdit ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vue liste des élèves
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Notes</h1>
          <div className="flex items-center gap-2">
            {/* <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <FileText size={16} /> Bulletin de notes
            </button> */}
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              <BarChart2 size={16} /> Statistiques
            </button>
          </div>
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
                placeholder="Rechercher par nom d'élève ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredStudents.length} élève{filteredStudents.length !== 1 ? 's' : ''} trouvé{filteredStudents.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const studentClass = classes.find(c => c.id === student.classId);
                  const studentGrades = grades.filter(g => g.studentId === student.id);
                  
                  // Calculer la moyenne générale si l'élève a des notes
                  let generalAverage = null;
                  if (studentGrades.length > 0) {
                    const studentSubjects = new Set(studentGrades.map(g => g.subjectId));
                    let totalWeightedAverage = 0;
                    let totalCoefficient = 0;
                    
                    studentSubjects.forEach(subjectId => {
                      const subject = subjects.find(s => s.id === subjectId);
                      if (subject) {
                        const average = calculateSubjectAverage(student.id, subjectId, 0);
                        if (average !== null) {
                          totalWeightedAverage += average * subject.coefficient;
                          totalCoefficient += subject.coefficient;
                        }
                      }
                    });
                    
                    if (totalCoefficient > 0) {
                      generalAverage = parseFloat((totalWeightedAverage / totalCoefficient).toFixed(2));
                    }
                  }
                  
                  return (
                    <div 
                      key={student.id} 
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-blue-600">
                              {student.firstname} {student.lastname}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {studentClass?.name || 'Classe non spécifiée'}
                            </p>
                          </div>
                          
                          {generalAverage !== null && (
                            <div className={`px-2 py-1 rounded-full text-xs ${getGradeColor(generalAverage)}`}>
                              {generalAverage.toFixed(2)}/20
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-3 text-sm">
                          <div className="flex justify-between text-gray-500 mb-1">
                            <span>Nombre de notes</span>
                            <span>{studentGrades.length}</span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-500">Dernière note</span>
                            {studentGrades.length > 0 ? (
                              <span>
                                {formatDate(studentGrades.sort((a, b) => 
                                  new Date(b.date).getTime() - new Date(a.date).getTime()
                                )[0].date)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {studentGrades.length > 0 
                            ? `${new Set(studentGrades.map(g => g.subjectId)).size} matière(s)` 
                            : 'Aucune note'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentId(student.id);
                            setGradeToEdit(null);
                            setShowAddGradeModal(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ajouter une note
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Aucun élève trouvé pour votre recherche
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;