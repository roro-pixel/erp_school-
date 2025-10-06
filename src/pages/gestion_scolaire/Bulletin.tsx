import React, { useState, useEffect } from 'react';
import _ from 'lodash';

// Define TypeScript interfaces
interface Student {
  id: string;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  familyId: string;
  parentId: string;
}

interface Family {
  id: string;
  familyName: string;
  address: string;
  phone: string;
  email: string;
}

interface Parent {
  id: string;
  firstname: string;
  lastname: string;
  relationship: string;
  familyId: string;
  profession: string;
  phone: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  levelId: string;
}

interface Level {
  id: string;
  name: string;
  description: string;
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

const BulletinScolaire: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [
          studentsRes, 
          familiesRes, 
          parentsRes, 
          classesRes, 
          levelsRes, 
          gradesRes, 
          subjectsRes, 
          quartersRes
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/students`),
          fetch(`${API_BASE_URL}/families`),
          fetch(`${API_BASE_URL}/parents`),
          fetch(`${API_BASE_URL}/classes`),
          fetch(`${API_BASE_URL}/levels`),
          fetch(`${API_BASE_URL}/grades`),
          fetch(`${API_BASE_URL}/subjects`),
          fetch(`${API_BASE_URL}/quarters`)
        ]);

        // Check if any request failed
        if (!studentsRes.ok || !familiesRes.ok || !parentsRes.ok || 
            !classesRes.ok || !levelsRes.ok || !gradesRes.ok || 
            !subjectsRes.ok || !quartersRes.ok) {
          throw new Error('Une ou plusieurs requêtes ont échoué');
        }

        // Parse response data
        const studentsData: Student[] = await studentsRes.json();
        const familiesData: Family[] = await familiesRes.json();
        const parentsData: Parent[] = await parentsRes.json();
        const classesData: Class[] = await classesRes.json();
        const levelsData: Level[] = await levelsRes.json();
        const gradesData: Grade[] = await gradesRes.json();
        const subjectsData: Subject[] = await subjectsRes.json();
        const quartersData: Quarter[] = await quartersRes.json();

        // Set state with fetched data
        setStudents(studentsData);
        setFamilies(familiesData);
        setParents(parentsData);
        setClasses(classesData);
        setLevels(levelsData);
        setGrades(gradesData);
        setSubjects(subjectsData);
        setQuarters(quartersData);

        // Set defaults if data is available
        if (studentsData.length > 0) {
          setSelectedStudent(studentsData[0].id);
        }
        
        if (quartersData.length > 0) {
          setSelectedQuarter(quartersData[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError(`Erreur lors du chargement des données: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getStudentById = (studentId: string): Student | undefined => {
    return students.find(student => student.id === studentId);
  };

  const getClassById = (classId: string): Class | undefined => {
    return classes.find(cls => cls.id === classId);
  };

  const getLevelById = (levelId: string): Level | undefined => {
    return levels.find(level => level.id === levelId);
  };

  const getFamilyById = (familyId: string): Family | undefined => {
    return families.find(family => family.id === familyId);
  };

  const getParentsByFamilyId = (familyId: string): Parent[] => {
    return parents.filter(parent => parent.familyId === familyId);
  };

  const getStudentGrades = (studentId: string, quarterId: number): Grade[] => {
    return grades.filter(grade => 
      grade.studentId === studentId && 
      grade.quarter === quarterId
    );
  };

  const getSubjectById = (subjectId: string): Subject | undefined => {
    return subjects.find(subject => subject.id === subjectId);
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudent(e.target.value);
  };

  const handleQuarterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuarter(parseInt(e.target.value));
  };

  // Fonction d'impression
const handleCompletePrint = () => {
  // Récupérer le contenu du bulletin
  const bulletinElement = document.querySelector('.max-w-4xl');
  
  if (!bulletinElement) {
    window.print();
    return;
  }
  
  // Créer une nouvelle fenêtre pour l'impression
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert("Veuillez autoriser les pop-ups pour l'impression");
    return;
  }
  
  // Extraire le contenu HTML du bulletin
  const bulletinContent = bulletinElement.innerHTML;
  
  // Créer une page pour l'impression avec les styles Tailwind essentiels
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bulletin Scolaire</title>
        
        <!-- Importer Tailwind directement depuis CDN pour avoir tous les styles -->
        <script src="https://cdn.tailwindcss.com"></script>
        
        <style>
          /* Styles spécifiques pour l'impression */
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }

          .max-w-4xl {
              max-width: 100% !important;
              width: 100% !important;
            }
          }
          
          /* Forcer l'affichage des bordures */
          .border-gray-800 { border-color: #2d3748 !important; }
          .border { border-width: 1px !important; border-style: solid !important; }
          .border-b { border-bottom-width: 1px !important; border-bottom-style: solid !important; }
          .border-r { border-right-width: 1px !important; border-right-style: solid !important; }
          .border-t { border-top-width: 1px !important; border-top-style: solid !important; }
          
          /* Cacher les boutons */
          button { display: none !important; }
        </style>
      </head>
      <body class="bg-white">
       <div class="max-w-4xl mx-auto p-4 bg-white" style="width: 100%; max-width: 100%;">
         ${bulletinContent}
       </div>
        <script>
          // Supprimer tous les boutons
          document.querySelectorAll('button').forEach(button => {
            button.style.display = 'none';
            button.remove();
          });
          
          // Imprimer automatiquement
          window.addEventListener('load', () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 500);
            }, 800); // Délai plus long pour s'assurer que Tailwind est chargé
          });
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

  


  const calculateAverageBySubject = (grades: Grade[], subjectId: string): string => {
    const subjectGrades = grades.filter(grade => grade.subjectId === subjectId);
    if (subjectGrades.length === 0) return "-";
    
    const total = subjectGrades.reduce((sum, grade) => sum + (grade.value * grade.coefficient), 0);
    const totalCoefficients = subjectGrades.reduce((sum, grade) => sum + grade.coefficient, 0);
    
    return (total / totalCoefficients).toFixed(1);
  };

  const calculateOverallAverage = (grades: Grade[]): string => {
    if (!grades || grades.length === 0) return "-";
    
    // Group grades by subject
    const gradesBySubject = _.groupBy(grades, 'subjectId');
    
    let totalWeightedAverage = 0;
    let totalCoefficients = 0;
    
    // Calculate weighted average for each subject
    for (const subjectId in gradesBySubject) {
      const subject = getSubjectById(subjectId);
      
      if (!subject) continue;
      
      const subjectAverage = calculateAverageBySubject(grades, subjectId);
      if (subjectAverage !== "-") {
        totalWeightedAverage += parseFloat(subjectAverage) * subject.coefficient;
        totalCoefficients += subject.coefficient;
      }
    }
    
    return totalCoefficients > 0 ? (totalWeightedAverage / totalCoefficients).toFixed(1) : "-";
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement des données...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (students.length === 0) {
    return <div className="p-4 text-center">Aucune donnée disponible</div>;
  }

  // Get the selected student and related data
  const student = getStudentById(selectedStudent);
  if (!student) {
    return <div className="p-4 text-center">Étudiant non trouvé</div>;
  }

  const currentQuarter = quarters.find(q => q.id === selectedQuarter);
  const studentClass = getClassById(student.classId);
  const level = studentClass ? getLevelById(studentClass.levelId) : undefined;
  const family = getFamilyById(student.familyId);
  const familyParents = family ? getParentsByFamilyId(family.id) : [];
  const parentWithId = familyParents.find(p => p.id === student.parentId);
  const studentGrades = getStudentGrades(student.id, selectedQuarter);

  // Get student age
  const birthDate = new Date(student.dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Group grades by subject
  const gradesBySubject: Record<string, Grade[]> = _.groupBy(studentGrades, 'subjectId');

  // Get unique subjects that the student has grades for
  const studentSubjects: Subject[] = _.uniq(studentGrades.map(grade => grade.subjectId))
    .map(subjectId => {
      const subject = getSubjectById(subjectId);
      return subject;
    })
    .filter((subject): subject is Subject => subject !== undefined);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white">
      {/* Student and quarter selection */}
      <div className="mb-6 flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Étudiant:</label>
          <select 
            className="w-full border border-gray-300 rounded p-2"
            value={selectedStudent}
            onChange={handleStudentChange}
          >
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstname} {student.lastname}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium mb-1">Trimestre:</label>
          <select 
            className="w-full border border-gray-300 rounded p-2"
            value={selectedQuarter}
            onChange={handleQuarterChange}
          >
            {quarters.map(quarter => (
              <option key={quarter.id} value={quarter.id}>
                {quarter.name} ({new Date(quarter.startDate).toLocaleDateString()} - {new Date(quarter.endDate).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulletin */}
      <div className="border border-gray-800 print:border-black">
        {/* Section 1: Renseignements Généraux */}
        <div className="border-b border-gray-800 print:border-black">
          <div className="font-bold bg-gray-100 border-b border-gray-800 print:border-black p-2">
            1. RENSEIGNEMENTS GÉNÉRAUX
          </div>
          <div className="grid grid-cols-2">
            {/* Left side */}
            <div className="border-r border-gray-800 print:border-black">
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Nom de l'école :</div>
                <div className="col-span-3 p-2">
                  École Privée - École Secondaire
                </div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Code d'organisme :</div>
                <div className="col-span-3 p-2">ÉCOLE-01</div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Adresse :</div>
                <div className="col-span-3 p-2">
                  {family ? family.address : "Adresse non disponible"}
                </div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Téléphone :</div>
                <div className="col-span-3 p-2">{family ? family.phone : "N/A"}</div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Email :</div>
                <div className="col-span-3 p-2">{family ? family.email : "N/A"}</div>
              </div>
              <div className="grid grid-cols-5">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">École :</div>
                <div className="col-span-3 p-2">École Privée</div>
              </div>
            </div>
            
            {/* Right side */}
            <div>
              <div className="grid grid-cols-4 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Trimestre :</div>
                <div className="col-span-2 p-2">{currentQuarter ? currentQuarter.name : ""}</div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Début :</div>
                <div className="col-span-2 p-2">{currentQuarter ? new Date(currentQuarter.startDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : ""}</div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Fin :</div>
                <div className="col-span-2 p-2">{currentQuarter ? new Date(currentQuarter.endDate).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-') : ""}</div>
              </div>
            </div>
          </div>
          
          {/* Student and Parent Information */}
          <div className="grid grid-cols-2">
            {/* Left side - Student info */}
            <div className="border-r border-t border-gray-800 print:border-black">
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Nom de l'élève :</div>
                <div className="col-span-3 p-2">{student.lastname}, {student.firstname}</div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">ID Étudiant :</div>
                <div className="col-span-3 p-2">{student.id}</div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Date de naissance :</div>
                <div className="col-span-3 p-2">{new Date(student.dateOfBirth).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Âge :</div>
                <div className="col-span-3 p-2">{age} ans</div>
              </div>
              <div className="grid grid-cols-5 border-b border-gray-800 print:border-black">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Niveau :</div>
                <div className="col-span-3 p-2">{level ? level.name : "Non défini"}</div>
              </div>
              <div className="grid grid-cols-5">
                <div className="col-span-2 p-2 border-r border-gray-800 print:border-black font-bold">Classe :</div>
                <div className="col-span-3 p-2">{studentClass ? studentClass.name : "Non assigné"}</div>
              </div>
            </div>
            
            {/* Right side - Parent info */}
            <div className="border-t border-gray-800 print:border-black">
              <div className="grid grid-cols-4 border-b border-gray-800 print:border-black">
                <div className="col-span-4 p-2 font-bold">Informations du parent :</div>
              </div>
              <div className="p-2 border-b border-gray-800 print:border-black">
                <div className="mb-2">
                  <strong>Nom : </strong>
                  {parentWithId ? `${parentWithId.firstname} ${parentWithId.lastname}` : "Non disponible"}
                </div>
                <div className="mb-2">
                  <strong>Relation : </strong>
                  {parentWithId ? parentWithId.relationship : "Non spécifiée"}
                </div>
                <div className="mb-2">
                  <strong>Profession : </strong>
                  {parentWithId ? parentWithId.profession : "Non spécifiée"}
                </div>
                <div className="mb-2">
                  <strong>Téléphone : </strong>
                  {parentWithId ? parentWithId.phone : "Non disponible"}
                </div>
                <div>
                  <strong>Email : </strong>
                  {parentWithId ? parentWithId.email : "Non disponible"}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section 2: Résultats */}
        <div>
          <div className="font-bold bg-gray-100 border-b border-gray-800 print:border-black p-2">
            2. RÉSULTATS
          </div>
          
          {/* Display results for each subject */}
          {studentSubjects.length > 0 ? (
            studentSubjects.map((subject) => (
              <div key={subject.id} className="border-b border-gray-800 print:border-black">
                {/* Subject header */}
                <div className="bg-gray-50 p-2 font-bold border-b border-gray-800 print:border-black grid grid-cols-4">
                  <div className="col-span-3">
                    {subject.name}
                  </div>
                  <div className="text-right" style={{ color: subject.color || '#000' }}>
                    {subject.shortName || subject.name}
                  </div>
                </div>
                
                {/* Grades for this subject */}
                <div className="grid grid-cols-8 border-b border-gray-800 print:border-black">
                  <div className="col-span-4 p-2 border-r border-gray-800 print:border-black font-bold">
                    Note
                  </div>
                  <div className="col-span-1 p-2 text-center border-r border-gray-800 print:border-black font-bold">
                    Trimestre {currentQuarter ? currentQuarter.id : ""}
                  </div>
                  <div className="col-span-3 p-2 text-center">
                    Coefficient: {subject.coefficient || 1}
                  </div>
                </div>
                
                {/* For each grade in this subject */}
                {gradesBySubject[subject.id]?.map((grade) => (
                  <div key={grade.id} className="grid grid-cols-8 border-b border-gray-800 print:border-black">
                    <div className="col-span-4 p-2 border-r border-gray-800 print:border-black">
                      {grade.type || "Évaluation"} - {new Date(grade.date).toLocaleDateString()}
                    </div>
                    <div className="col-span-1 p-2 text-center border-r border-gray-800 print:border-black">
                      {grade.value.toFixed(1)}
                    </div>
                    <div className="col-span-3 p-2">
                      {grade.comment || ""}
                    </div>
                  </div>
                ))}
                
                {/* Subject Average */}
                <div className="grid grid-cols-8 border-b border-gray-800 print:border-black">
                  <div className="col-span-4 p-2 border-r border-gray-800 print:border-black text-right font-bold">
                    Moyenne de la matière
                  </div>
                  <div className="col-span-1 p-2 text-center border-r border-gray-800 print:border-black font-bold">
                    {calculateAverageBySubject(studentGrades, subject.id)}
                  </div>
                  <div className="col-span-3 p-2">
                    
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center italic">
              Aucune note disponible pour cet étudiant dans ce trimestre.
            </div>
          )}
          
          {/* Overall average */}
          {studentSubjects.length > 0 && (
            <div className="p-4 border-t border-gray-800 print:border-black">
              <div className="font-bold text-lg mb-2">Moyenne générale: {calculateOverallAverage(studentGrades)}/20</div>
              <div className="italic mt-4">
                Ce bulletin a été généré automatiquement. Pour toute question, veuillez contacter l'administration de l'école.
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Print button */}
      <div className="mt-4 text-center">
         <button 
           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden print-button"
           onClick={handleCompletePrint}
         >
          Imprimer le bulletin
         </button>
      </div>
    </div>
  );
};

export default BulletinScolaire;