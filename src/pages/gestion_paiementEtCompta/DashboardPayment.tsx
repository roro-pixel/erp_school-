import { PieChart, UserCheck, Wallet, AlertTriangle, Clock } from 'lucide-react';

const DashboardPayment = () => {
  // Données simulées avec montants corrects
  const teachers = [
    { id: 1, name: "Chantal MAMPOUYA", status: "À payer", daysMissed: 2 },
    { id: 2, name: "Élodie MBOUA", status: "En retard", daysMissed: 0 },
    { id: 3, name: "BOUITY Jacques", status: "Payé", daysMissed: 1 }
  ];

  const paymentStats = [
    { month: "Sept 2024", paid: 285000, pending: 95000 },
    { month: "Oct 2024", paid: 215000, pending: 182000 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-600 border-b pb-2">
        <PieChart className="inline mr-2" /> Dashboard Paiement
      </h1>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <UserCheck size={18} /> <span>Enseignants</span>
          </div>
          <p className="text-3xl font-bold mt-2">16</p>
          <p className="text-sm text-green-600 mt-1">+2 ce mois</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Wallet size={18} /> <span>Paiements</span>
          </div>
          <p className="text-3xl font-bold mt-2">285 000 FCFA</p>
          <p className="text-sm text-yellow-600 mt-1">3 en attente</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <UserCheck size={18} /> <span>Présence</span>
          </div>
          <p className="text-3xl font-bold mt-2">94%</p>
          <p className="text-sm text-green-600 mt-1">↑2% vs mois dernier</p>
        </div>
      </div>

      {/* Section Alertes */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-600">
          <AlertTriangle size={18} /> Alertes Requérant une Action
        </h2>
        <div className="space-y-3">
          {teachers.filter(t => t.status !== "Payé").map(teacher => (
            <div key={teacher.id} className="flex items-center justify-between p-3 border-b hover:bg-red-50">
              <div className="flex items-center gap-3">
                <span className={`flex h-3 w-3 rounded-full ${
                  teacher.status === "À payer" ? "bg-yellow-500" : "bg-red-600"
                }`} />
                <span>{teacher.name}</span>
                {teacher.daysMissed > 0 && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    {teacher.daysMissed} jour(s) absent
                  </span>
                )}
              </div>
              <span className="text-sm font-medium">{teacher.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique des Paiements (simplifié) */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Wallet size={18} /> Historique des Paiements
        </h2>
        <div className="space-y-4">
          {paymentStats.map((stat, index) => (
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

      {/* Prochaines Échéances */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Clock size={18} /> Prochains Paiements
        </h2>
        <div className="flex items-center justify-between p-2 border-b">
          <span>15 Nov 2024</span>
          <span className="font-medium">8 enseignants</span>
          <span className="text-red-600 font-medium">~380 000 FCFA</span>
        </div>
        <div className="flex items-center justify-between p-2">
          <span>15 Déc 2024</span>
          <span className="font-medium">8 enseignants</span>
          <span className="text-red-600 font-medium">~380 000 FCFA</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardPayment;