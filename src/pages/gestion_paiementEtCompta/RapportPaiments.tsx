import { PieChart, Calendar, FileText, Download, ChevronDown, Wallet, Users, AlertTriangle } from 'lucide-react';

const RapportPaiements = () => {
  // Données simulées basées sur les enseignants avec montants cohérents
  const teachers = [
    { id: 1, name: "Chantal MAMPOUYA", daysPresent: 18, daysExpected: 20, status: "À payer", amount: 48000 },
    { id: 2, name: "BOUITY Jacques", daysPresent: 20, daysExpected: 20, status: "Payé", amount: 52000 },
    { id: 3, name: "Élodie MBOUA", daysPresent: 15, daysExpected: 20, status: "En retard", amount: 42000 }
  ];

  // Statistiques mensuelles de paiement
  const monthlyStats = [
    { month: "Septembre 2024", paid: 285000, pending: 95000 },
    { month: "Octobre 2024", paid: 215000, pending: 182000 },
    { month: "Novembre 2024", paid: 142000, pending: 238000 }
  ];

  // Historique des paiements
  const paymentHistory = [
    { id: 1, teacher: "Chantal MAMPOUYA", month: "09/2024", amount: "48000 FCFA", method: "Virement", date: "2024-09-28" },
    { id: 2, teacher: "BOUITY Jacques", month: "09/2024", amount: "52000 FCFA", method: "Chèque", date: "2024-09-30" },
    { id: 3, teacher: "Élodie MBOUA", month: "09/2024", amount: "42000 FCFA", method: "Virement", date: "2024-10-02" },
    { id: 4, teacher: "Chantal MAMPOUYA", month: "10/2024", amount: "48000 FCFA", method: "Virement", date: "2024-10-29" },
    { id: 5, teacher: "BOUITY Jacques", month: "10/2024", amount: "52000 FCFA", method: "Chèque", date: "2024-10-30" }
  ];

  // Prévisions de paiement
  const upcomingPayments = [
    { date: "15 Nov 2024", teacherCount: 8, amount: "~380 000 FCFA" },
    { date: "15 Déc 2024", teacherCount: 8, amount: "~380 000 FCFA" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-600 border-b pb-2">
        <FileText className="inline mr-2" /> Rapport des Paiements Enseignants
      </h1>

      {/* En-tête avec filtres */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500">
              <option>Année scolaire 2024-2025</option>
              <option>Année scolaire 2023-2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="relative">
            <select className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500">
              <option>Tous les mois</option>
              <option>Septembre 2024</option>
              <option>Octobre 2024</option>
              <option>Novembre 2024</option>
              <option>Décembre 2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300">
          <Download size={16} /> Exporter le rapport
        </button>
      </div>

      {/* Résumé des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Wallet size={18} /> <span>Total salaires payés</span>
          </div>
          <p className="text-3xl font-bold text-green-600">642 000 FCFA</p>
          <p className="text-sm text-gray-600 mt-1">Année scolaire en cours</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <AlertTriangle size={18} /> <span>En attente de paiement</span>
          </div>
          <p className="text-3xl font-bold text-red-600">238 000 FCFA</p>
          <p className="text-sm text-gray-600 mt-1">Novembre 2024</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users size={18} /> <span>Enseignants</span>
          </div>
          <p className="text-3xl font-bold mt-0">8</p>
          <p className="text-sm text-red-600 mt-1">5 à payer en Novembre</p>
        </div>
      </div>

      {/* Graphique mensuel des paiements */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Wallet size={18} /> Historique des Paiements
        </h2>
        <div className="space-y-4">
          {monthlyStats.map((stat, index) => (
            <div key={index}>
              <h3 className="font-medium text-gray-700">{stat.month}</h3>
              <div className="flex h-8 mt-2 bg-gray-100 rounded overflow-hidden">
                <div 
                  className="bg-green-500" 
                  style={{ width: `${(stat.paid / (stat.paid + stat.pending)) * 100}%` }}
                >
                  <span className="sr-only">Payés</span>
                </div>
                <div 
                  className="bg-yellow-500" 
                  style={{ width: `${(stat.pending / (stat.paid + stat.pending)) * 100}%` }}
                >
                  <span className="sr-only">En attente</span>
                </div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Payés: {stat.paid.toLocaleString()} FCFA</span>
                <span>En attente: {stat.pending.toLocaleString()} FCFA</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau avec statut des enseignants */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 bg-red-600 text-white font-medium">
          <div className="col-span-4">Enseignant</div>
          <div className="col-span-3">Présences</div>
          <div className="col-span-2">Statut</div>
          <div className="col-span-3">Montant</div>
        </div>
        
        {teachers.map(teacher => (
          <div key={teacher.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-red-50 items-center">
            <div className="col-span-4 font-medium">{teacher.name}</div>
            <div className="col-span-3">
              <span className="font-mono">
                {teacher.daysPresent}/{teacher.daysExpected} jours
              </span>
            </div>
            <div className="col-span-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                teacher.status === "Payé" ? "bg-green-100 text-green-800" :
                teacher.status === "En retard" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {teacher.status}
              </span>
            </div>
            <div className="col-span-3 text-red-600 font-medium">
              {teacher.amount.toLocaleString()} FCFA
            </div>
          </div>
        ))}
      </div>

      {/* Historique des paiements */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Historique des paiements</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enseignant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mois
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de paiement
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Méthode
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentHistory.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.teacher}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.method === 'Virement' ? 'bg-blue-100 text-blue-800' :
                      payment.method === 'Chèque' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {payment.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prochaines échéances */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar size={18} /> Prochains Paiements
        </h2>
        {upcomingPayments.map((payment, index) => (
          <div key={index} className="flex items-center justify-between p-2 border-b">
            <span>{payment.date}</span>
            <span className="font-medium">{payment.teacherCount} enseignants</span>
            <span className="text-red-600 font-medium">{payment.amount}</span>
          </div>
        ))}
      </div>

      {/* Paiements par méthode */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <PieChart size={18} /> Méthodes de paiement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-3 text-center">
            <div className="font-medium">Virement bancaire</div>
            <div className="text-blue-600 font-bold text-xl mt-2">65%</div>
            <div className="text-gray-500 text-sm">417 300 FCFA</div>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <div className="font-medium">Chèque</div>
            <div className="text-purple-600 font-bold text-xl mt-2">30%</div>
            <div className="text-gray-500 text-sm">192 600 FCFA</div>
          </div>
          <div className="border rounded-lg p-3 text-center">
            <div className="font-medium">Espèces</div>
            <div className="text-green-600 font-bold text-xl mt-2">5%</div>
            <div className="text-gray-500 text-sm">32 100 FCFA</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportPaiements;