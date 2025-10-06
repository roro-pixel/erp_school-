import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface EmployeeAttendanceResponse {
  teacherId: string;
  fullname: string;
  day: string;
  month: string;
  attendanceTime: string; 
  numberOfAttendance: number;
}

interface TeacherData {
  teacherId: string;
  fullname: string;
  attendances: EmployeeAttendanceResponse[];
  numberOfAttendance: number;
}

interface MonthData {
  value: number;
  label: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Une erreur inconnue s\'est produite';
};

const TeacherAttendance = () => {
  const [attendanceData, setAttendanceData] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [months, setMonths] = useState<MonthData[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fonctions pour gérer les toasts
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Initialisation des mois
  const initializeMonths = () => {
    const staticMonths = [
      { value: 1, label: 'Janvier' }, { value: 2, label: 'Février' },
      { value: 3, label: 'Mars' }, { value: 4, label: 'Avril' },
      { value: 5, label: 'Mai' }, { value: 6, label: 'Juin' },
      { value: 7, label: 'Juillet' }, { value: 8, label: 'Août' },
      { value: 9, label: 'Septembre' }, { value: 10, label: 'Octobre' },
      { value: 11, label: 'Novembre' }, { value: 12, label: 'Décembre' }
    ];
    setMonths(staticMonths);
  };

  // Génération des années disponibles
  const generateAvailableYears = (attendances: EmployeeAttendanceResponse[]) => {
    const years = new Set<number>();
    attendances.forEach(attendance => {
      const year = new Date(attendance.attendanceTime).getFullYear();
      years.add(year);
    });
    
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear + 1);
    
    setAvailableYears(Array.from(years).sort((a, b) => b - a));
  };

  // Traitement des données des enseignants
  const processTeacherData = (teacherAttendances: EmployeeAttendanceResponse[]) => {
    if (!teacherAttendances || teacherAttendances.length === 0) {
      return { numberOfAttendance: 0 };
    }
    return { numberOfAttendance: teacherAttendances[0].numberOfAttendance };
  };

  // Groupement des présences par enseignant
  const groupAttendancesByTeacher = (attendances: EmployeeAttendanceResponse[]): TeacherData[] => {
    const grouped: Record<string, TeacherData> = {};
    
    attendances.forEach(attendance => {
      if (!grouped[attendance.teacherId]) {
        grouped[attendance.teacherId] = {
          teacherId: attendance.teacherId,
          fullname: attendance.fullname,
          attendances: [],
          numberOfAttendance: 0
        };
      }
      grouped[attendance.teacherId].attendances.push(attendance);
    });

    return Object.values(grouped).map(teacher => ({
      ...teacher,
      ...processTeacherData(teacher.attendances)
    }));
  };

  // Récupération des présences
  const fetchAllAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching from: ${API_BASE_URL}/v1/attendance/all`); // Debug
      const response = await fetch(`${API_BASE_URL}/v1/attendance/all`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Response status:', response.status); // Debug
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText); // Debug
        throw new Error(`Erreur ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Réponse non-JSON: ${text.substring(0, 100)}`);
      }
      
      const data: EmployeeAttendanceResponse[] = await response.json();
      console.log('Received data:', data); // Debug
      
      generateAvailableYears(data);
      
      const filteredData = data.filter(attendance => {
        const attendanceDate = new Date(attendance.attendanceTime);
        return attendanceDate.getMonth() + 1 === selectedMonth && 
               attendanceDate.getFullYear() === selectedYear;
      });
      
      setAttendanceData(groupAttendancesByTeacher(filteredData));
      showToast('Présences chargées avec succès', 'success');
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('Full error:', err); // Debug
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Marquage d'une présence
  const markAttendance = async (teacherId: string) => {
    try {
      console.log(`Marking attendance for teacher: ${teacherId}`); // Debug
      const response = await fetch(`${API_BASE_URL}/v1/attendance/${teacherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Mark attendance response:', response.status); // Debug
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erreur ${response.status}`);
      }
      
      showToast('Présence enregistrée avec succès', 'success');
      await fetchAllAttendances();
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      console.error('Mark attendance error:', err); // Debug
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  // Export du rapport
  const exportReport = async () => {
    try {
      setIsExporting(true);
      
      const csvHeaders = ['Enseignant', 'Nombre de présences', 'Mois', 'ID Enseignant'];
      const csvData = attendanceData.map(teacher => [
        `"${teacher.fullname}"`,
        teacher.numberOfAttendance,
        teacher.attendances[0]?.month || months.find(m => m.value === selectedMonth)?.label,
        teacher.teacherId
      ]);
      
      const csvContent = [csvHeaders, ...csvData].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `presences_${selectedMonth}_${selectedYear}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Rapport exporté avec succès', 'success');
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Effets
  useEffect(() => {
    initializeMonths();
    fetchAllAttendances();
  }, []);

  useEffect(() => {
    if (months.length > 0) {
      fetchAllAttendances();
    }
  }, [selectedMonth, selectedYear]);

  // Gestion des changements
  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const currentMonth = months.find(m => m.value === selectedMonth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600">Chargement des présences...</span>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-red-500 border-b pb-2">
            Suivi des présences - {currentMonth?.label} {selectedYear}
          </h1>
          
          <div className="flex gap-2">
            <select 
              value={selectedMonth} 
              onChange={handleMonthChange}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            <button
              onClick={fetchAllAttendances}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-4 bg-red-500 text-white font-medium">
            <div className="col-span-5">Enseignant</div>
            <div className="col-span-3">Nombre de présences</div>
            <div className="col-span-2">Mois</div>
            <div className="col-span-2">Actions</div>
          </div>
          
          {attendanceData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune présence enregistrée pour cette période
            </div>
          ) : (
            attendanceData.map(teacher => (
              <div key={teacher.teacherId} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-red-50 items-center transition-colors">
                <div className="col-span-5 font-medium">{teacher.fullname}</div>
                <div className="col-span-3">
                  <span className="font-mono bg-red-100 px-2 py-1 rounded text-red-700">
                    {teacher.numberOfAttendance} présences
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-gray-600">
                    {teacher.attendances[0]?.month || currentMonth?.label}
                  </span>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => markAttendance(teacher.teacherId)}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    + Présence
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {attendanceData.length} enseignant(s) avec présences enregistrées
          </div>
          <button
            onClick={exportReport}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
            disabled={isExporting || attendanceData.length === 0}
          >
            {isExporting ? "Export en cours..." : "Exporter le rapport"}
          </button>
        </div>
      </div>
    </>
  );
};

export default TeacherAttendance;