import { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, AlertTriangle, TrendingUp, GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';

interface FinancialReportResponse {
  id: number;
  expectedAmount: number;
  collectedAmount: number;
  studentsPaidCount: number;
  studentsOverdueCount: number;
  month: string;
  year: number;
}

interface StudentPaymentStatusResponse {
  studentId: number;
  studentName: string;
  className: string;
  outstandingAmount: number;
  overdue: boolean;
}

interface PaymentStatusApiResponse {
  paidStudents: StudentPaymentStatusResponse[];
  unpaidStudents: StudentPaymentStatusResponse[];
}

interface GenerateReportResponse {
  id: number;
  expectedAmount: number;
  collectedAmount: number;
  studentsPaidCount: number;
  studentsOverdueCount: number;
  month: string;
  year: number;
}

// Nouvelles interfaces pour l'API par classe
interface Student {
  studentId: string;
  studentName: string;
  className: string;
  outstandingAmount: number;
  classId: string;
}

interface ClassInfo {
  className: string;
  classFee: number;
  expectedAmount: number;
  actualAmount: number;
}

interface OverdueClassData {
  classInfo: ClassInfo;
  students: Student[];
}

const COLORS = ['#4CAF50', '#F44336', '#FF9800', '#2196F3'];
const CLASS_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

const API_BASE_URL = import.meta.env.VITE_API_URL;

const FinancialReports = () => {
  const [reportData, setReportData] = useState<GenerateReportResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusApiResponse | null>(null);
  const [overdueStudents, setOverdueStudents] = useState<StudentPaymentStatusResponse[]>([]);
  const [overdueByClass, setOverdueByClass] = useState<OverdueClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // Juin (mois actuel)
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'by-class'>('overview');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const monthOptions = [
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet (Vacances)' },
    { value: 8, label: 'Août (Vacances)' }
  ];

  useEffect(() => {
    // Appel unique au chargement pour student-payment-status
    const fetchPaymentStatus = async () => {
      try {
        const paymentStatusRes = await fetch(
          `${API_BASE_URL}/v1/financial-reports/student-payment-status?month=${selectedMonth}`,
          {
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }
        );
        if (paymentStatusRes.ok) {
          const paymentData = await paymentStatusRes.json();
          setPaymentStatus(paymentData);
        }
      } catch (err) {
        // Optionnel : gérer l'erreur
      }
    };
    fetchPaymentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- vide, donc une seule fois au montage

  useEffect(() => {
    // Les autres appels qui dépendent du mois sélectionné
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [reportRes, overdueRes, overdueByClassRes] = await Promise.all([
          fetch(`${API_BASE_URL}/v1/financial-reports/generate`, {
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }),
          fetch(`${API_BASE_URL}/v1/financial-reports/overdue-students`, {
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          }),
          fetch(`${API_BASE_URL}/v1/financial-reports/overdue-students/by-classes`, {
            headers: {
              'Accept': 'application/json',
              'ngrok-skip-browser-warning': 'true'
            }
          })
        ]);

        console.log('Response status:', {
          report: reportRes.status,
          overdue: overdueRes.status,
          overdueByClass: overdueByClassRes.status
        });

        if (!reportRes.ok) {
          const errorText = await reportRes.text();
          console.error('Report API error:', reportRes.status, errorText);
          throw new Error(`Erreur API generate: ${reportRes.status} - ${errorText.substring(0, 200)}`);
        }
        
        if (!overdueRes.ok) {
          const errorText = await overdueRes.text();
          console.error('Overdue API error:', overdueRes.status, errorText);
          throw new Error(`Erreur API overdue: ${overdueRes.status} - ${errorText.substring(0, 200)}`);
        }

        if (!overdueByClassRes.ok) {
          const errorText = await overdueByClassRes.text();
          console.error('Overdue by class API error:', overdueByClassRes.status, errorText);
          // Ne pas faire échouer le chargement si cette API n'est pas disponible
        }
        
        // Vérification du type de contenu avant de parser en JSON
        const reportContentType = reportRes.headers.get('content-type');
        const overdueContentType = overdueRes.headers.get('content-type');
        
        console.log('Content types:', {
          report: reportContentType,
          overdue: overdueContentType
        });
        
        if (!reportContentType || !reportContentType.includes('application/json')) {
          const text = await reportRes.text();
          console.error('Report endpoint returned non-JSON:', text.substring(0, 500));
          throw new Error('L\'endpoint /generate ne retourne pas du JSON');
        }
        
        const [reportData, overdueData] = await Promise.all([
          reportRes.json(),
          overdueRes.json()
        ]);

        // Parser les données par classe si disponibles
        let overdueByClassData = [];
        if (overdueByClassRes.ok) {
          overdueByClassData = await overdueByClassRes.json();
        }

        console.log('Data received:', { reportData, overdueData, overdueByClassData });

        setReportData(reportData);
        setOverdueStudents(overdueData);
        setOverdueByClass(overdueByClassData);
      } catch (error) {
        console.error("Erreur de chargement:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(`Impossible de charger les données financières: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const toggleClassExpansion = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const getChartData = () => {
    if (!reportData) return { pieData: [], barData: [] };

    const pieData = [
      { 
        name: 'Montant collecté', 
        value: reportData.collectedAmount || 0,
        color: '#4CAF50'
      },
      { 
        name: 'Montant en attente', 
        value: (reportData.expectedAmount || 0) - (reportData.collectedAmount || 0),
        color: '#F44336'
      }
    ];

    const barData = [
      { 
        name: 'Étudiants payés', 
        value: reportData.studentsPaidCount || 0,
        color: '#4CAF50'
      },
      { 
        name: 'Étudiants impayés', 
        value: reportData.studentsOverdueCount || 0,
        color: '#F44336'
      }
    ];

    return { pieData, barData };
  };

  const getClassChartData = () => {
    const pieData = overdueByClass.map((classData, index) => ({
      name: classData.classInfo.className,
      value: classData.students.length,
      color: CLASS_COLORS[index % CLASS_COLORS.length],
      amount: classData.students.reduce((sum, student) => sum + student.outstandingAmount, 0)
    }));

    const barData = overdueByClass.map((classData, index) => ({
      className: classData.classInfo.className,
      students: classData.students.length,
      amount: classData.students.reduce((sum, student) => sum + student.outstandingAmount, 0),
      color: CLASS_COLORS[index % CLASS_COLORS.length]
    }));

    return { pieData, barData };
  };

  const getClassStatistics = () => {
    const totalStudents = overdueByClass.reduce((sum, classData) => sum + classData.students.length, 0);
    const totalAmount = overdueByClass.reduce((sum, classData) => 
      sum + classData.students.reduce((classSum, student) => classSum + student.outstandingAmount, 0), 0
    );
    const totalClasses = overdueByClass.length;
    const totalExpectedAmount = overdueByClass.reduce((sum, classData) => sum + classData.classInfo.expectedAmount, 0);

    return { totalStudents, totalAmount, totalClasses, totalExpectedAmount };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">Aucune donnée disponible</div>
      </div>
    );
  }

  const { pieData, barData } = getChartData();
  const { pieData: classPieData, barData: classBarData } = getClassChartData();
  const { totalStudents: classesTotalStudents, totalAmount: classesTotalAmount, totalClasses, totalExpectedAmount: classesTotalExpected } = getClassStatistics();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Rapports Financiers</h1>
            <p className="text-gray-600">
              Rapport pour {reportData.month} {reportData.year}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border p-2 rounded text-sm"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab('by-class')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'by-class'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Par classe ({overdueByClass.length} classes)
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Cartes de synthèse - Vue d'ensemble */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<DollarSign className="text-blue-500" />}
                title="Montant collecté"
                value={`${(reportData.collectedAmount || 0).toLocaleString('fr-FR')} FCFA`}
                description={`Sur ${(reportData.expectedAmount || 0).toLocaleString('fr-FR')} FCFA attendus`}
              />
              <StatCard 
                icon={<Users className="text-green-500" />}
                title="Étudiants payés"
                value={reportData.studentsPaidCount || 0}
                description={`sur ${(reportData.studentsPaidCount || 0) + (reportData.studentsOverdueCount || 0)} étudiants`}
              />
              <StatCard 
                icon={<AlertTriangle className="text-red-500" />}
                title="Étudiants impayés"
                value={reportData.studentsOverdueCount || 0}
                description={`${(overdueStudents || []).reduce((sum, student) => sum + (student.outstandingAmount || 0), 0).toLocaleString('fr-FR')} FCFA dus`}
              />
              <StatCard 
                icon={<TrendingUp className="text-purple-500" />}
                title="Taux de recouvrement"
                value={`${reportData.expectedAmount && reportData.expectedAmount > 0 ? ((reportData.collectedAmount || 0) / reportData.expectedAmount * 100).toFixed(1) : 0}%`}
                description="Objectif: 95%"
              />
            </div>

            {/* Graphiques - Vue d'ensemble */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Graphique Camembert - Montants */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Répartition des montants</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toLocaleString('fr-FR')} FCFA`, 'Montant']} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique Barres - Étudiants */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Répartition des étudiants</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip 
                        formatter={(value: number) => [value, 'Nombre d\'étudiants']} 
                      />
                      <Bar dataKey="value">
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tableau des étudiants en retard */}
            {overdueStudents.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-red-600">
                  Étudiants en retard de paiement ({overdueStudents.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Étudiant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Classe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant dû
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {overdueStudents.map((student) => (
                        <tr key={student.studentId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.studentName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.studentId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.className}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {(student.outstandingAmount || 0).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              En retard
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Résumé des étudiants payés si disponible */}
            {paymentStatus && paymentStatus.paidStudents.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow mt-8">
                <h2 className="text-lg font-semibold mb-4 text-green-600">
                  Étudiants à jour ({paymentStatus.paidStudents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paymentStatus.paidStudents.slice(0, 9).map((student) => (
                    <div key={student.studentId} className="border rounded-lg p-4 bg-green-50">
                      <div className="font-medium text-gray-900">{student.studentName}</div>
                      <div className="text-sm text-gray-600">{student.className}</div>
                      <div className="text-xs text-green-600 mt-1">✓ Paiement à jour</div>
                    </div>
                  ))}
                  {paymentStatus.paidStudents.length > 9 && (
                    <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        +{paymentStatus.paidStudents.length - 9} autres étudiants
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'by-class' && (
          <>
            {/* Cartes de synthèse - Par classe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<GraduationCap className="text-blue-500" />}
                title="Classes concernées"
                value={totalClasses}
                description="Classes avec des impayés"
              />
              <StatCard 
                icon={<Users className="text-red-500" />}
                title="Étudiants en retard"
                value={classesTotalStudents}
                description="Total des étudiants impayés"
              />
              <StatCard 
                icon={<DollarSign className="text-orange-500" />}
                title="Montant total dû"
                value={`${classesTotalAmount.toLocaleString('fr-FR')} FCFA`}
                description="Somme des impayés"
              />
              <StatCard 
                icon={<AlertTriangle className="text-purple-500" />}
                title="Montant attendu"
                value={`${classesTotalExpected.toLocaleString('fr-FR')} FCFA`}
                description="Total espéré"
              />
            </div>

            {/* Graphiques - Par classe */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Graphique Camembert - Répartition par classe */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Répartition des étudiants en retard</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {classPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string, props: any) => [
                          `${value} étudiants`,
                          `${props.payload.amount.toLocaleString('fr-FR')} FCFA`
                        ]} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Graphique Barres - Montants par classe */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Montants dus par classe</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classBarData} margin={{ left: 20, right: 20, top: 20, bottom: 60 }}>
                      <XAxis 
                        dataKey="className" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'amount' ? `${value.toLocaleString('fr-FR')} FCFA` : `${value} étudiants`,
                          name === 'amount' ? 'Montant dû' : 'Nombre d\'étudiants'
                        ]} 
                      />
                      <Bar dataKey="amount" name="amount">
                        {classBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Liste détaillée par classe */}
            <div className="space-y-6">
              {overdueByClass.map((classData, index) => (
                <div key={classData.classInfo.className} className="bg-white rounded-lg shadow">
                  {/* En-tête de classe */}
                  <div 
                    className="p-6 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleClassExpansion(classData.classInfo.className)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: CLASS_COLORS[index % CLASS_COLORS.length] }}
                        ></div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            {classData.classInfo.className}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>Mensualité: {classData.classInfo.classFee.toLocaleString('fr-FR')} FCFA</span>
                            <span>•</span>
                            <span>Attendu: {classData.classInfo.expectedAmount.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold text-red-600">
                            {classData.students.length} étudiants
                          </div>
                          <div className="text-sm text-gray-500">
                            {classData.students.reduce((sum, student) => sum + student.outstandingAmount, 0).toLocaleString('fr-FR')} FCFA dus
                          </div>
                        </div>
                        {expandedClasses.has(classData.classInfo.className) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Liste des étudiants */}
                  {expandedClasses.has(classData.classInfo.className) && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classData.students.map((student) => (
                          <div 
                            key={student.studentId} 
                            className="border rounded-lg p-4 bg-red-50 border-red-200"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {student.studentName}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  ID: {student.studentId}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-red-600">
                                  {student.outstandingAmount.toLocaleString('fr-FR')} FCFA
                                </div>
                                <div className="text-xs text-red-500 mt-1">
                                  En retard
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {overdueByClass.length === 0 && (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Aucun étudiant en retard
                </h3>
                <p className="text-gray-500">
                  Tous les étudiants sont à jour dans leurs paiements.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Composant pour les cartes de statistiques
const StatCard = ({ 
  icon, 
  title, 
  value, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  description: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-gray-100">{icon}</div>
      <div className="ml-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

export default FinancialReports;