import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { Search, CheckCircle, ChevronLeft } from 'lucide-react';

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
  profession: string;
  phone: string;
  email: string;
}

interface Class {
  id: string;
  name: string;
  levelId: string;
}

interface Fee {
  id: string;
  name: string;
  amount: number;
  type: string;
}

const Reinscription = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [newClassId, setNewClassId] = useState('');
  const [reinscriptionAmount, setReinscriptionAmount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [classesRes, feesRes] = await Promise.all([
          fetch('http://localhost:3000/classes'),
          fetch('http://localhost:3000/fees')
        ]);
        setClasses(await classesRes.json());
        setFees(await feesRes.json());
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/students?q=${searchTerm}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Erreur de recherche:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setLoading(true);
    try {
      const [familyRes, parentRes] = await Promise.all([
        fetch(`http://localhost:3000/families/${student.familyId}`),
        fetch(`http://localhost:3000/parents/${student.parentId}`)
      ]);
      setSelectedStudent(student);
      setFamily(await familyRes.json());
      setParent(await parentRes.json());
      setNewClassId(student.classId); // Classe actuelle par défaut
    } catch (error) {
      console.error("Erreur de chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReinscriptionFee = (classId: string) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (!selectedClass) return 0;

    const fee = fees.find(f => f.type === 'REINSCRIPTION');
    return fee ? fee.amount : 40000; // Valeur par défaut si non trouvé
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !newClassId) return;

    setLoading(true);
    try {
      // 1. Mettre à jour la classe de l'élève
      const updateRes = await fetch(`http://localhost:3000/students/${selectedStudent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: newClassId })
      });

      if (!updateRes.ok) throw new Error('Erreur de mise à jour');

      // 2. Enregistrer le paiement
      const paymentRes = await fetch('http://localhost:3000/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          amount: reinscriptionAmount,
          type: 'school',
          subType: 'reinscription',
          date: new Date().toISOString().split('T')[0],
          recordedBy: 'Admin'
        })
      });

      if (!paymentRes.ok) throw new Error('Erreur de paiement');

      // 3. Générer le PDF
      generatePDF();

      // 4. Afficher le succès
      setShowSuccess(true);
    } catch (error) {
      console.error("Erreur lors de la réinscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!selectedStudent || !family) return;

    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('fr-FR');

    // En-tête
    doc.setFontSize(18);
    doc.text('CONFIRMATION DE RÉINSCRIPTION', 105, 20, { align: 'center' });
    
    // Informations élève
    doc.setFontSize(12);
    doc.text(`Élève: ${selectedStudent.firstname} ${selectedStudent.lastname}`, 20, 40);
    doc.text(`Nouvelle classe: ${classes.find(c => c.id === newClassId)?.name || ''}`, 20, 50);
    doc.text(`Famille: ${family.familyName}`, 20, 60);
    
    // Frais
    doc.text(`Frais de réinscription: ${reinscriptionAmount.toLocaleString('fr-FR')} FCFA`, 20, 80);
    doc.text(`Date: ${currentDate}`, 20, 90);
    
    // Signature
    doc.text('Le Responsable des inscriptions', 150, 120);
    doc.line(150, 122, 190, 122);

    doc.save(`Reinscription_${selectedStudent.lastname}_${selectedStudent.firstname}.pdf`);
  };

  useEffect(() => {
    if (newClassId) {
      setReinscriptionAmount(getReinscriptionFee(newClassId));
    }
  }, [newClassId]);

  if (showSuccess) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow text-center">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2">Réinscription confirmée !</h1>
        <p className="mb-4">
          {selectedStudent?.firstname} {selectedStudent?.lastname} a été réinscrit(e) en {classes.find(c => c.id === newClassId)?.name}.
        </p>
        <p className="font-medium mb-6">
          Frais payés: {reinscriptionAmount.toLocaleString('fr-FR')} FCFA
        </p>
        <button
          onClick={() => navigate('/students')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retour à la liste des élèves
        </button>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
        <button 
          onClick={() => setSelectedStudent(null)} 
          className="flex items-center text-blue-600 mb-4"
        >
          <ChevronLeft size={20} /> Retour à la recherche
        </button>

        <h1 className="text-2xl font-bold mb-6">Réinscription d'un élève</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Informations de l'élève</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nom:</span> {selectedStudent.firstname} {selectedStudent.lastname}</p>
              <p><span className="font-medium">Date de naissance:</span> {new Date(selectedStudent.dateOfBirth).toLocaleDateString('fr-FR')}</p>
              <p><span className="font-medium">Classe actuelle:</span> {classes.find(c => c.id === selectedStudent.classId)?.name || 'Inconnue'}</p>
            </div>
          </div>

          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Informations familiales</h2>
            {family && (
              <div className="space-y-2">
                <p><span className="font-medium">Famille:</span> {family.familyName}</p>
                <p><span className="font-medium">Adresse:</span> {family.address}</p>
                <p><span className="font-medium">Téléphone:</span> {family.phone}</p>
                {parent && <p><span className="font-medium">Parent:</span> {parent.firstname} {parent.lastname}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Nouvelle inscription</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Nouvelle classe*</label>
              <select
                value={newClassId}
                onChange={(e) => setNewClassId(e.target.value)}
                className="border p-2 w-full rounded"
                required
              >
                <option value="">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Frais de réinscription</label>
              <div className="border p-2 rounded bg-white">
                {reinscriptionAmount.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!newClassId || loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Traitement...' : 'Confirmer la réinscription'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Réinscription d'un élève</h1>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Rechercher un élève (nom, prénom ou classe)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 flex-grow rounded"
            placeholder="Ex: Luc MAKOSSO ou CM2"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="border rounded">
          <h2 className="p-3 bg-gray-100 font-medium">Résultats de la recherche</h2>
          <div className="divide-y">
            {students.map(student => (
              <div 
                key={student.id}
                className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                onClick={() => handleSelectStudent(student)}
              >
                <div>
                  <p className="font-medium">{student.firstname} {student.lastname}</p>
                  <p className="text-sm text-gray-600">
                    {classes.find(c => c.id === student.classId)?.name || 'Classe inconnue'}
                  </p>
                </div>
                <span className="text-blue-600">Sélectionner</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reinscription;