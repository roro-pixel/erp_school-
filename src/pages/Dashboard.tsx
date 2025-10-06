import { useState, useEffect } from 'react';
import { Users, Book, DollarSign, BarChart2, Calendar, Printer, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface Student {
  id: number;
  studentId: string;
  firstname: string;
  lastname: string;
  classId: string;
  family: string;
  classes: string;
  gender: string;
  birthDate: string;
}

interface Class {
  id: string;
  name: string;
  description?: string | null;
  academicYear: string;
  levelId: number;
  levelName?: string;
  classFee: number;
  students: Student[];
}

interface Level {
  id: number;
  name: string;
  description: string;
  classes: Class[];
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

interface InvoiceResponse {
  invoiceNumber: string;
  studentId: string;
  studentFirstname: string;
  studentLastname: string;
  issueDate: string;
  dueDate: string;
  outstandingAmount: number;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  balance: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  className: string;
  academicYear: string;
}

interface DashboardStats {
  students: number;
  classes: number;
  levels: number;
  totalPayments: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
}

interface MonthlyData {
  month: string;
  payments: number;
  revenue: number;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    students: 0,
    classes: 0,
    levels: 0,
    totalPayments: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    outstandingAmount: 0
  });
  const [recentPayments, setRecentPayments] = useState<PaymentResponse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setStudents(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des étudiants:', err);
      setStudents([]);
      return [];
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
      setClasses(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des classes:', err);
      setClasses([]);
      return [];
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
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLevels(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des niveaux:', err);
      setLevels([]);
      return [];
    }
  };

  // Récupérer les paiements du mois actuel
  const fetchCurrentMonthPayments = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const response = await fetch(`${API_BASE_URL}/v1/payments/monthly/${currentMonth}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const paymentsArray = Array.isArray(data) ? data : [];
      setPayments(paymentsArray);
      
      // Trier les paiements par date (du plus récent au plus ancien) et prendre les 5 derniers
      const sortedPayments = [...paymentsArray].sort((a, b) => {
        return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
      });
      setRecentPayments(sortedPayments.slice(0, 5));
      
      return paymentsArray;
    } catch (err) {
      console.error('Erreur lors du chargement des paiements:', err);
      setPayments([]);
      setRecentPayments([]);
      return [];
    }
  };

  // Récupérer toutes les factures
  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/invoices/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setInvoices(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error('Erreur lors du chargement des factures:', err);
      setInvoices([]);
      return [];
    }
  };

  // Calculer les données mensuelles pour les 6 derniers mois
  const calculateMonthlyData = (paymentsData: PaymentResponse[]) => {
    const monthlyStats: { [key: string]: { payments: number; revenue: number } } = {};
    
    // Initialiser les 6 derniers mois
    for (let i = 0; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
      monthlyStats[monthKey] = { payments: 0, revenue: 0 };
    }

    // Calculer les stats pour chaque paiement
    paymentsData.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const monthKey = paymentDate.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
      
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].payments += 1;
        monthlyStats[monthKey].revenue += payment.amount;
      }
    });

    const monthlyDataArray = Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      payments: data.payments,
      revenue: data.revenue
    }));

    setMonthlyData(monthlyDataArray);
  };

  // Calculer toutes les statistiques
  const calculateStats = (
    studentsData: Student[],
    classesData: Class[],
    levelsData: Level[],
    paymentsData: PaymentResponse[],
    invoicesData: InvoiceResponse[]
  ) => {
    // Stats de base
    const totalStudents = studentsData.length;
    const totalClasses = classesData.length;
    const totalLevels = levelsData.length;
    const totalPayments = paymentsData.length;
    const totalInvoices = invoicesData.length;

    // Stats des factures
    const paidInvoices = invoicesData.filter(inv => inv.status === 'PAID').length;
    const pendingInvoices = invoicesData.filter(inv => inv.status === 'PENDING').length;
    const overdueInvoices = invoicesData.filter(inv => inv.status === 'OVERDUE').length;

    // Stats financières
    const totalRevenue = paymentsData.reduce((sum, payment) => sum + payment.amount, 0);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = paymentsData
      .filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() + 1 === currentMonth && paymentDate.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);

    const outstandingAmount = invoicesData.reduce((sum, invoice) => sum + invoice.balance, 0);

    setStats({
      students: totalStudents,
      classes: totalClasses,
      levels: totalLevels,
      totalPayments,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      monthlyRevenue,
      outstandingAmount
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [studentsData, classesData, levelsData, paymentsData, invoicesData] = await Promise.all([
          fetchStudents(),
          fetchClasses(),
          fetchLevels(),
          fetchCurrentMonthPayments(),
          fetchInvoices()
        ]);

        // Calculer les statistiques avec toutes les données
        calculateStats(studentsData, classesData, levelsData, paymentsData, invoicesData);
        
        // Calculer les données mensuelles
        calculateMonthlyData(paymentsData);

      } catch (error) {
        console.error("Erreur de chargement:", error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Styles
    const primaryColor: [number, number, number] = [41, 128, 185];
    const textColor: [number, number, number] = [51, 51, 51];

    // En-tête
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 297, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORT DU TABLEAU DE BORD', 148, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 148, 28, { align: 'center' });

    // Statistiques globales
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.text('STATISTIQUES GLOBALES', 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Élèves inscrits: ${stats.students}`, 20, 55);
    doc.text(`Classes: ${stats.classes}`, 20, 60);
    doc.text(`Niveaux: ${stats.levels}`, 20, 65);
    doc.text(`Recettes totales: ${stats.totalRevenue.toLocaleString('fr-FR')} FCFA`, 20, 70);
    doc.text(`Recettes ce mois: ${stats.monthlyRevenue.toLocaleString('fr-FR')} FCFA`, 20, 75);
    doc.text(`Montant en attente: ${stats.outstandingAmount.toLocaleString('fr-FR')} FCFA`, 20, 80);

    // Statistiques des factures
    doc.setFontSize(14);
    doc.text('STATISTIQUES DES FACTURES', 20, 95);
    
    doc.setFontSize(10);
    doc.text(`Total factures: ${stats.totalInvoices}`, 20, 105);
    doc.text(`Factures payées: ${stats.paidInvoices}`, 20, 110);
    doc.text(`Factures en attente: ${stats.pendingInvoices}`, 20, 115);
    doc.text(`Factures en retard: ${stats.overdueInvoices}`, 20, 120);

    // Derniers paiements
    doc.setFontSize(14);
    doc.text('DERNIERS PAIEMENTS', 20, 135);
    
    doc.setFontSize(10);
    let y = 145;
    recentPayments.slice(0, 5).forEach(payment => {
      doc.text(`${payment.studentFirstname} ${payment.studentLastname}`, 20, y);
      doc.text(`${payment.amount.toLocaleString('fr-FR')} FCFA`, 100, y);
      doc.text(`${payment.month} - ${payment.className}`, 150, y);
      doc.text(new Date(payment.paymentDate).toLocaleDateString('fr-FR'), 200, y);
      y += 5;
    });

    // Calendrier scolaire
    doc.setFontSize(14);
    doc.text('CALENDRIER SCOLAIRE 2024-2025', 20, y + 15);
    
    doc.setFontSize(10);
    doc.text('Trimestre 1: Septembre - Décembre 2025', 20, y + 25);
    doc.text('Trimestre 2: Janvier - Mars 2026', 20, y + 30);
    doc.text('Trimestre 3: Avril - Juin 2026', 20, y + 35);

    // Pied de page
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('Les Minimes - Tableau de Bord', 148, 200, { align: 'center' });

    doc.save(`tableau_de_bord_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Printer size={18} /> Exporter PDF
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle size={18} className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Cartes de statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div 
            className="bg-white p-6 rounded-lg shadow flex items-center cursor-pointer hover:bg-blue-50 transition-colors duration-200"
            onClick={() => navigate('/students')}
          >
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Élèves</h3>
              <p className="text-2xl font-bold">{stats.students}</p>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow flex items-center cursor-pointer hover:bg-green-50 transition-colors duration-200"
            onClick={() => navigate('/classes')}
          >
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Book size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Classes</h3>
              <p className="text-2xl font-bold">{stats.classes}</p>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow flex items-center cursor-pointer hover:bg-purple-50 transition-colors duration-200"
            onClick={() => navigate('/levels')}
          >
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Niveaux</h3>
              <p className="text-2xl font-bold">{stats.levels}</p>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-lg shadow flex items-center cursor-pointer hover:bg-yellow-50 transition-colors duration-200"
            onClick={() => navigate('/payments')}
          >
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Recettes (FCFA)</h3>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue).replace('XAF', '').trim()}</p>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques financières détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Recettes ce mois</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyRevenue).replace('XAF', '').trim()}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Factures payées</h3>
                <p className="text-2xl font-bold text-blue-600">{stats.paidInvoices}/{stats.totalInvoices}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm font-medium">Montant en attente</h3>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.outstandingAmount).replace('XAF', '').trim()}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et dernières activités */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart2 className="mr-2" size={20} /> Évolution des paiements (6 derniers mois)
            </h2>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              {monthlyData.length > 0 ? (
                <div className="w-full h-full p-4">
                  <div className="flex justify-between items-end h-full">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-500 w-8 rounded-t"
                          style={{
                            height: `${Math.max((data.revenue / Math.max(...monthlyData.map(d => d.revenue))) * 180, 10)}px`
                          }}
                          title={`${data.month}: ${formatCurrency(data.revenue)}`}
                        ></div>
                        <span className="text-xs mt-2 text-gray-600">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-gray-500">Aucune donnée disponible</span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} /> Derniers paiements
            </h2>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map(payment => (
                  <div key={payment.paymentNumber} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {payment.studentFirstname} {payment.studentLastname}
                      </span>
                      <span className="font-bold">{payment.amount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{payment.month} - {payment.className}</span>
                      <span>{formatDate(payment.paymentDate)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <Calendar className="mx-auto mb-2 text-gray-300" size={32} />
                  <p>Aucun paiement récent</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alertes et statut */}
        {stats.overdueInvoices > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="text-red-400 mr-2" size={20} />
              <div>
                <h3 className="text-red-800 font-medium">Attention !</h3>
                <p className="text-red-700">
                  {stats.overdueInvoices} facture{stats.overdueInvoices > 1 ? 's' : ''} en retard de paiement.
                  Montant total en attente: {formatCurrency(stats.outstandingAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calendrier scolaire */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">Calendrier Scolaire 2025-2026</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">Trimestre 1</h3>
              <p className="text-sm">Septembre - Décembre 2025</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">Trimestre 2</h3>
              <p className="text-sm">Janvier - Mars 2026</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">Trimestre 3</h3>
              <p className="text-sm">Avril - Juin 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;