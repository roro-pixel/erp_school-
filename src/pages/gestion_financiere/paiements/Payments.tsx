import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Printer, Download, Calendar } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

// Interfaces basées sur vos structures backend
interface Student {
  id: number;
  studentId: string;
  firstname: string;
  lastname: string;
  classes: string;
  family: string;
}

interface Class {
  id: string;
  name: string;
  levelId: number;
  classFee: number;
}

interface PaymentResponse {
  paymentNumber: string;
  invoiceNumber: string;
  studentId: string;
  studentFirstname: string;
  studentLastname: string;
  className: string;
  amount: number;
  month: string;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentRequest {
  studentId: string;
  monthOfPayment: number;
  amount: number;
  paymentMethod: string;
}

// Interface pour le suivi des paiements par mois
interface StudentDebtInfo {
  studentId: string;
  unpaidMonths: number[];
  totalDebt: number;
  classId: string;
  monthlyFee: number;
}

// Interface pour le profil de frais étudiant (même que dans Students.tsx)
interface StudentFeeProfile {
  studentId: string;
  studentLastname: string;
  studentFirstname: string;
  studentNumber: string;
  outstandingAmount: number;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  paymentStatus: string;
  monthsOverdue: number;
  totalPaidAmount: number;
  discountPercentage: number;
  className: string;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }

  interface AutoTableOptions {
    head: string[][];
    body: string[][];
    startY?: number;
    styles?: {
      cellPadding?: number;
      fontSize?: number;
      valign?: 'middle' | 'top' | 'bottom';
      halign?: 'left' | 'center' | 'right';
    };
    headStyles?: {
      fillColor?: [number, number, number];
      textColor?: number;
      fontStyle?: 'bold' | 'normal' | 'italic';
    };
    alternateRowStyles?: {
      fillColor?: [number, number, number];
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const MonthlyPayments = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const studentIdFromUrl = queryParams.get('studentId');
  const familyFromUrl = queryParams.get('family');
  const classFromUrl = queryParams.get('class');

  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(2025);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPayment, setNewPayment] = useState<PaymentRequest>({
    studentId: studentIdFromUrl || '',
    monthOfPayment: new Date().getMonth() + 1,
    amount: 50000,
    paymentMethod: 'CASH'
  });
  const [studentDebtInfo, setStudentDebtInfo] = useState<StudentDebtInfo | null>(null);

  useEffect(() => {
    if (studentIdFromUrl) {
      setShowPaymentModal(true);
    }
  }, [studentIdFromUrl]);

  // Récupérer tous les étudiants
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/students/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du chargement des étudiants');
    }
  };

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
      throw new Error(err instanceof Error ? err.message : 'Erreur lors du chargement des classes');
    }
  };

  // Récupérer les paiements d'un mois spécifique
  const fetchMonthlyPayments = async (month: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/payments/monthly/${month}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err);
      setPayments([]);
      // Ne pas lancer d'erreur pour permettre l'affichage de la page même sans paiements
    }
  };

  // Enregistrer un nouveau paiement
  const createPayment = async (paymentData: PaymentRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/payments/class-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newPaymentResponse = await response.json();
      toast.success('Paiement enregistré avec succès !');
      
      // Recharger les paiements du mois actuel
      await fetchMonthlyPayments(monthFilter);
      
      return newPaymentResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement du paiement';
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
          fetchStudents(),
          fetchClasses(),
          fetchMonthlyPayments(monthFilter)
        ]);
        
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        toast.error(`Désolé, ${error instanceof Error ? error.message.toLowerCase() : 'erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Recharger les paiements quand le mois change
  useEffect(() => {
    if (!loading) {
      fetchMonthlyPayments(monthFilter);
    }
  }, [monthFilter]);

  // Mise à jour des frais de classe quand l'élève change
  useEffect(() => {
    if (newPayment.studentId) {
      updateStudentClassFee(newPayment.studentId);
    } else {
      setStudentDebtInfo(null);
    }
  }, [newPayment.studentId, students, classes]);

  // Récupérer les frais de classe pour l'élève sélectionné
  const updateStudentClassFee = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student) {
      setStudentDebtInfo(null);
      return;
    }
    
    const studentClass = classes.find(c => c.name === student.classes);
    if (!studentClass) {
      setStudentDebtInfo(null);
      return;
    }
    
    // Récupérer simplement le montant de la classe
    const monthlyFee = studentClass.classFee || 50000;
    
    setStudentDebtInfo({
      studentId,
      unpaidMonths: [],
      totalDebt: 0,
      classId: studentClass.id,
      monthlyFee
    });
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = !searchTerm || 
        `${payment.studentFirstname} ${payment.studentLastname}`.toLowerCase().includes(searchTerm.toLowerCase());
        
      return matchesSearch;
    });
  }, [payments, searchTerm]);

  const handleAddPayment = async () => {
    try {
      if (!newPayment.studentId) {
        throw new Error('Veuillez sélectionner un élève');
      }

      setSubmitting(true);
      setError(null);

      // Utiliser le montant par défaut basé sur la classe si disponible
      let amount = newPayment.amount;
      if (studentDebtInfo) {
        amount = studentDebtInfo.monthlyFee;
      }

      const paymentToSubmit: PaymentRequest = {
        ...newPayment,
        amount
      };

      await createPayment(paymentToSubmit);
      
      setShowPaymentModal(false);
      setNewPayment({
        studentId: '',
        monthOfPayment: new Date().getMonth() + 1,
        amount: 50000,
        paymentMethod: 'CASH'
      });
      setStudentDebtInfo(null);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  };

  const getMonthName = (monthNumber: number): string => {
    return new Date(0, monthNumber - 1).toLocaleString('fr-FR', { month: 'long' });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('RELEVÉ DES PAIEMENTS MENSUELS', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Mois: ${getMonthName(monthFilter)} ${yearFilter}`, 105, 30, { align: 'center' });
    
    const headers = ['Élève', 'Classe', 'Montant', 'Méthode', 'Date', 'Référence'];
    const data = filteredPayments.map(payment => [
      `${payment.studentFirstname} ${payment.studentLastname}`,
      payment.className || '-',
      `${payment.amount.toLocaleString('fr-FR')} FCFA`,
      payment.paymentMethod === 'CASH' ? 'Espèces' : 
        payment.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 
        payment.paymentMethod === 'CHEQUE' ? 'Chèque' : payment.paymentMethod,
      new Date(payment.paymentDate).toLocaleDateString('fr-FR'),
      payment.paymentReference || '-'
    ]);
  
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 40,
      styles: {
        cellPadding: 5,
        fontSize: 9,
        valign: 'middle',
        halign: 'center'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });
  
    const total = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    doc.setFontSize(12);
    doc.text(`Total: ${total.toLocaleString('fr-FR')} FCFA`, 160, doc.lastAutoTable.finalY + 20);
  
    doc.save(`paiements_${getMonthName(monthFilter)}_${yearFilter}.pdf`);
  };

  // Formatter un tableau de mois en texte lisible (fonction supprimée car plus utilisée)

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Paiements des Mensualités Scolaires</h1>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus size={18} /> Nouveau paiement
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
                placeholder="Rechercher par nom élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-500" size={18} />
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                  className="border p-2 rounded text-sm"
                  title="Filtrer par mois"
                >
                  {/* Mois de l'année scolaire uniquement (Septembre à Juin) */}
                  {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(month => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(parseInt(e.target.value))}
                  className="border p-2 rounded text-sm"
                  title="Année scolaire"
                >
                  <option value={2024}>2025-2026</option>
                </select>
              </div>
              
              <button 
                onClick={generatePDF}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
              >
                <Printer size={16} /> Imprimer
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700">
                <Download size={16} /> Exporter Excel
              </button>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Élève</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map(payment => (
                      <tr key={payment.paymentNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.studentFirstname} {payment.studentLastname}
                          </div>
                          <div className="text-sm text-gray-500">ID: {payment.studentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.className}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.amount.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${payment.paymentMethod === 'CASH' ? 'bg-green-100 text-green-800' : 
                              payment.paymentMethod === 'MOBILE_MONEY' ? 'bg-blue-100 text-blue-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {payment.paymentMethod === 'CASH' ? 'Espèces' : 
                            payment.paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 
                            payment.paymentMethod === 'CHEQUE' ? 'Chèque' : payment.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paymentReference || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        Aucun paiement trouvé pour {getMonthName(monthFilter)} {yearFilter}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal pour ajouter un paiement */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Enregistrer un paiement de mensualité</h2>
                
                {studentIdFromUrl && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Paiement pour: {students.find(s => s.studentId === studentIdFromUrl)?.firstname} {students.find(s => s.studentId === studentIdFromUrl)?.lastname}
                    </p>
                    {familyFromUrl && <p className="text-sm text-blue-800">Famille: {familyFromUrl}</p>}
                    {classFromUrl && <p className="text-sm text-blue-800">Classe: {classFromUrl}</p>}
                  </div>
                )}

                <div className="space-y-4">
                  {!studentIdFromUrl && (
                    <div>
                      <label className="block mb-1 font-medium">Élève*</label>
                      <select
                        value={newPayment.studentId}
                        onChange={(e) => setNewPayment({...newPayment, studentId: e.target.value})}
                        className="border p-2 w-full rounded"
                        required
                        disabled={submitting}
                        title="Sélectionner un élève"
                      >
                        <option value="">Sélectionner un élève</option>
                        {students.map(student => (
                          <option key={student.studentId} value={student.studentId}>
                            {student.firstname} {student.lastname} - {student.classes}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Affichage automatique de la classe */}
                  {newPayment.studentId && (
                    <div>
                      <label className="block mb-1 font-medium">Classe</label>
                      <input
                        type="text"
                        value={students.find(s => s.studentId === newPayment.studentId)?.classes || ''}
                        className="border p-2 w-full rounded bg-gray-50"
                        disabled
                        title="Classe de l'élève sélectionné"
                      />
                    </div>
                  )}

                  {/* Suppression de l'affichage de l'état des paiements */}

                  <div>
                    <label className="block mb-1 font-medium">Mois de paiement*</label>
                    <select
                      value={newPayment.monthOfPayment}
                      onChange={(e) => setNewPayment({...newPayment, monthOfPayment: parseInt(e.target.value)})}
                      className="border p-2 w-full rounded"
                      required
                      disabled={submitting}
                      title="Sélectionner un mois"
                    >
                      {/* Tous les mois de l'année scolaire disponibles */}
                      {[9, 10, 11, 12, 1, 2, 3, 4, 5, 6].map(month => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Montant (FCFA)*</label>
                    <input
                      type="number"
                      value={studentDebtInfo ? studentDebtInfo.monthlyFee : newPayment.amount}
                      onChange={(e) => setNewPayment({...newPayment, amount: parseInt(e.target.value) || 0})}
                      className="border p-2 w-full rounded"
                      required
                      min="1000"
                      disabled={submitting}
                      title="Montant du paiement"
                    />
                    {studentDebtInfo && (
                      <p className="text-sm text-gray-600 mt-1">
                        Frais de classe par défaut: {studentDebtInfo.monthlyFee.toLocaleString('fr-FR')} FCFA
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Méthode de paiement*</label>
                    <select
                      value={newPayment.paymentMethod}
                      onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                      disabled={submitting}
                      title="Méthode de paiement"
                    >
                      <option value="CASH">Espèces</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                      <option value="CHEQUE">Chèque</option>
                      <option value="BANK_TRANSFER">Virement bancaire</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setShowPaymentModal(false);
                      setError(null);
                      setStudentDebtInfo(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddPayment}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={!newPayment.studentId || !newPayment.amount || submitting}
                  >
                    {submitting ? 'Enregistrement...' : 'Enregistrer'}
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

export default MonthlyPayments;