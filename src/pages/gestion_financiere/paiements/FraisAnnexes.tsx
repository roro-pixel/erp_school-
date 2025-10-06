import { useState, useEffect } from 'react';
import { CheckCircle, ChevronLeft, Download, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Student {
  studentId: string;
  firstname: string;
  lastname: string;
  classId: string;
  familyId?: string;
}

interface Family {
  familyId: string;
  familyName: string;
  phone: string;
}

interface AnnexFeeResponse {
  feeId: string;
  feeName: string;
  feeType: string;
  amount: number;
  description: string;
}

interface AnnexFeePaymentRequest {
  studentId: string;
  monthOfPayment: number;
  amount: number;
  paymentMethod: string;
  feeId: string;
}

interface PaymentResponse {
  paymentId: string;
  studentId: string;
  feeId: string;
  amount: number;
  paymentMethod: string;
  monthOfPayment: number;
  paymentDate: string;
  status: string;
}

const AnnexFees = () => {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [fees, setFees] = useState<AnnexFeeResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFee, setSelectedFee] = useState<AnnexFeeResponse | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MOBILE_MONEY' | 'CHEQUE'>('CASH');
  const [monthOfPayment, setMonthOfPayment] = useState<number>(new Date().getMonth() + 1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentResults, setPaymentResults] = useState<PaymentResponse[]>([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/annex-fees/all`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur ${response.status}`);
      }

      const data: AnnexFeeResponse[] = await response.json();
      setFees(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
      toast.error(`Échec du chargement des frais: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/students/all`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur ${response.status}`);
      }

      const data: Student[] = await response.json();
      setAllStudents(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
      toast.error(`Échec du chargement des élèves: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    fetchAllStudents();
  }, []);

  const fetchStudentById = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/v1/students/${studentId}`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Étudiant non trouvé`);
      }

      const student: Student = await response.json();
      setSelectedStudent(student);
      
      if (student.familyId) {
        await fetchFamily(student.familyId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
      toast.error(`Échec du chargement de l'étudiant: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamily = async (familyId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/families/${familyId}`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const familyData: Family = await response.json();
        setFamily(familyData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la famille:", error);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    await fetchStudentById(student.studentId);
  };

  const toggleFeeSelection = (fee: AnnexFeeResponse) => {
    setSelectedFee(prev => 
      prev?.feeId === fee.feeId ? null : fee
    );
  };

  const handleSubmitPayment = async () => {
    if (!selectedStudent) {
      toast.warn('Veuillez sélectionner un étudiant');
      return;
    }

    if (!selectedFee) {
      toast.warn('Veuillez sélectionner un frais');
      return;
    }

    setLoading(true);

    try {
      const paymentRequest: AnnexFeePaymentRequest = {
        studentId: selectedStudent.studentId,
        feeId: selectedFee.feeId,
        amount: selectedFee.amount,
        monthOfPayment: monthOfPayment,
        paymentMethod: paymentMethod
      };

      const response = await fetch(`${API_BASE_URL}/v1/payments/annex-fee`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(paymentRequest)
      });
      
      if (!response.ok) {
        throw new Error('Échec du paiement');
      }

      const paymentResult = await response.json();
      setPaymentResults([paymentResult]);
      setShowSuccess(true);
      toast.success('Paiement enregistré avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur serveur';
      toast.error(`Échec du paiement: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = () => {
    if (!selectedStudent || !selectedFee) {
      toast.warn('Aucun frais sélectionné');
      return;
    }

    const currentDate = new Date().toLocaleDateString('fr-FR');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const receiptContent = `
=== REÇU DE PAIEMENT - FRAIS ANNEXES ===

Élève: ${selectedStudent.firstname} ${selectedStudent.lastname}
${family ? `Famille: ${family.familyName}` : ''}
${family?.phone ? `Téléphone: ${family.phone}` : ''}

Mois de paiement: ${monthNames[monthOfPayment - 1]} ${new Date().getFullYear()}

Frais annexe payé:
- ${selectedFee.feeName}: ${selectedFee.amount.toLocaleString('fr-FR')} FCFA

Total: ${selectedFee.amount.toLocaleString('fr-FR')} FCFA
Méthode: ${paymentMethod === 'CASH' ? 'Espèces' : paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Chèque'}
Date: ${currentDate}

Le Responsable financier
_________________________
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FraisAnnexes_${selectedStudent.lastname}_${selectedStudent.firstname}_${monthNames[monthOfPayment - 1]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filtrer les élèves en fonction du terme de recherche
  const filteredStudents = allStudents.filter(student => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      student.firstname.toLowerCase().includes(searchLower) ||
      student.lastname.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower) ||
      `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchLower)
    );
  });

  const totalAmount = selectedFee ? selectedFee.amount : 0;

  if (showSuccess) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow text-center">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2">Paiement confirmé !</h1>
        <p className="mb-4">
          Les frais annexes pour {selectedStudent?.firstname} {selectedStudent?.lastname} ont été payés avec succès.
        </p>
        <p className="font-medium mb-2">
          Montant total: {totalAmount.toLocaleString('fr-FR')} FCFA
        </p>
        <p className="text-sm text-gray-600 mb-6">
          {paymentResults.length} paiement(s) enregistré(s)
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setShowSuccess(false);
              setSelectedStudent(null);
              setSelectedFee(null);
              setPaymentResults([]);
              setFamily(null);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Nouveau paiement
          </button>
        </div>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
        <button 
          onClick={() => {
            setSelectedStudent(null);
            setSelectedFee(null);
            setFamily(null);
          }} 
          className="flex items-center text-blue-600 mb-4 hover:text-blue-800"
        >
          <ChevronLeft size={20} /> Retour à la liste des élèves
        </button>

        <h1 className="text-2xl font-bold mb-6">Paiement des frais annexes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Informations de l'élève</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nom:</span> {selectedStudent.firstname} {selectedStudent.lastname}</p>
              <p><span className="font-medium">ID Étudiant:</span> {selectedStudent.studentId}</p>
              {family && (
                <>
                  <p><span className="font-medium">Famille:</span> {family.familyName}</p>
                  <p><span className="font-medium">Téléphone:</span> {family.phone || 'Non disponible'}</p>
                </>
              )}
            </div>
          </div>

          <div className="border rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Frais sélectionné</h2>
            {selectedFee ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedFee.feeName}</span>
                  <span className="font-medium">{selectedFee.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>{selectedFee.amount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Aucun frais sélectionné</p>
            )}
          </div>
        </div>

        <div className="border rounded p-4 bg-gray-50 mb-6">
          <h2 className="text-lg font-semibold mb-4">Paramètres de paiement</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 font-medium">Mois de paiement</label>
              <select
                value={monthOfPayment}
                onChange={(e) => setMonthOfPayment(parseInt(e.target.value))}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                title="Sélectionner le mois de paiement"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = i + 1;
                  const monthNames = [
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                  ];
                  return (
                    <option key={month} value={month}>
                      {monthNames[i]} {new Date().getFullYear()}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Méthode de paiement</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    className="h-4 w-4"
                  />
                  Espèces
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === 'MOBILE_MONEY'}
                    onChange={() => setPaymentMethod('MOBILE_MONEY')}
                    className="h-4 w-4"
                  />
                  Mobile Money
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={paymentMethod === 'CHEQUE'}
                    onChange={() => setPaymentMethod('CHEQUE')}
                    className="h-4 w-4"
                  />
                  Chèque
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Liste des frais annexes disponibles</h2>
          
          {fees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fees.map(fee => (
                <div 
                  key={fee.feeId}
                  onClick={() => toggleFeeSelection(fee)}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedFee?.feeId === fee.feeId
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{fee.feeName}</p>
                      <p className="text-sm text-gray-600">{fee.description}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {fee.feeType}
                      </span>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-medium">{fee.amount.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-xs text-gray-500">
                        {selectedFee?.feeId === fee.feeId ? '✓ Sélectionné' : 'Cliquer pour sélectionner'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun frais annexe disponible</p>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="font-bold text-lg">
              Total: {totalAmount.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateReceipt}
                disabled={!selectedFee}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Printer size={18} /> Générer reçu
              </button>
              <button
                onClick={handleSubmitPayment}
                disabled={!selectedFee || loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Enregistrement...' : (
                  <>
                    <Download size={18} /> Enregistrer le paiement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Paiement des frais annexes</h1>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Rechercher un élève</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nom, prénom ou ID de l'élève"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="border rounded">
          <div className="p-3 bg-gray-100 font-medium flex justify-between">
            <span>Liste des élèves</span>
            <span>{filteredStudents.length} élève(s) {searchTerm ? 'trouvé(s)' : 'au total'}</span>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {filteredStudents.map(student => (
              <div 
                key={student.studentId}
                className="p-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
                onClick={() => handleSelectStudent(student)}
              >
                <div>
                  <p className="font-medium">{student.firstname} {student.lastname}</p>
                  <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                </div>
                <span className="text-blue-600 hover:text-blue-800">Sélectionner →</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded p-8 text-center text-gray-500">
          {searchTerm ? 'Aucun élève trouvé pour cette recherche' : 'Aucun élève disponible'}
        </div>
      )}
    </div>
  );
};

export default AnnexFees;