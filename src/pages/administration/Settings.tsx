import { Upload, Calendar, Mail, MapPin, School, ArrowLeft, Clock, FileText, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const mockData = {
    schoolName: "École Les Minimes",
    address: "2 bis rue Mfoa Centre-ville, Brazzaville",
    contact: "contact@eles-minimes.cg",
    currentYear: "2024-2025",
    holidays: ["2024-12-25", "2025-01-01"],
    auditLogs: [
      { id: 1, user: "admin@eles-minimes.cg", action: "Modification du nom de l'école", timestamp: "2024-04-10 09:23:45" },
      { id: 2, user: "direction@eles-minimes.cg", action: "Ajout d'un jour férié", timestamp: "2024-04-15 14:17:30" },
      { id: 3, user: "admin@eles-minimes.cg", action: "Mise à jour de l'adresse", timestamp: "2024-04-18 11:05:22" }
    ]
  };

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      {/* Bouton de retour au tableau de bord */}
      <div className="flex justify-between items-center">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>
      
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <School className="text-blue-600" /> Paramètres de l'École
      </h2>

      {/* Section Logo */}
      <div className="border rounded-lg p-4">
        <label className="block font-medium mb-2 flex items-center gap-2">
          <Upload size={18} /> Logo de l'école
        </label>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-500">PNG/JPG</span>
          </div>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">
            Téléverser
          </button>
        </div>
      </div>

      {/* Section Informations */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <label className="block font-medium mb-2 flex items-center gap-2">
            <School size={18} /> Nom de l'école
          </label>
          <input 
            type="text" 
            defaultValue={mockData.schoolName}
            className="w-full p-2 border rounded"
            disabled // Simulation seulement
          />
        </div>

        <div className="border rounded-lg p-4">
          <label className="block font-medium mb-2 flex items-center gap-2">
            <MapPin size={18} /> Adresse
          </label>
          <input 
            type="text" 
            defaultValue={mockData.address}
            className="w-full p-2 border rounded"
            disabled
          />
        </div>

        <div className="border rounded-lg p-4">
          <label className="block font-medium mb-2 flex items-center gap-2">
            <Mail size={18} /> Contact
          </label>
          <input 
            type="email" 
            defaultValue={mockData.contact}
            className="w-full p-2 border rounded"
            disabled
          />
        </div>

        <div className="border rounded-lg p-4">
          <label className="block font-medium mb-2 flex items-center gap-2">
            <Calendar size={18} /> Année scolaire
          </label>
          <input 
            type="text" 
            defaultValue={mockData.currentYear}
            className="w-full p-2 border rounded"
            disabled
          />
        </div>
      </div>

      {/* Section Jours fériés (simulation) */}
      <div className="border rounded-lg p-4">
        <label className="block font-medium mb-2 flex items-center gap-2">
          <Calendar size={18} /> Jours fériés
        </label>
        <div className="space-y-2">
          {mockData.holidays.map((date, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <input 
                type="date" 
                defaultValue={date}
                className="bg-white border rounded p-1"
                disabled
              />
              <button className="text-red-500 hover:text-red-700" disabled>
                ×
              </button>
            </div>
          ))}
        </div>
        <button 
          className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
          disabled
        >
          + Ajouter un jour férié
        </button>
      </div>

      {/* Nouvelle section pour l'audit des actions */}
      <div className="border rounded-lg p-4">
        <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
          <FileText className="text-blue-600" /> Audit des actions
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    Date/Heure
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    Utilisateur
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockData.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.user}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            disabled
          >
            Voir l'historique complet
          </button>
        </div>
      </div>

      {/* Bouton de simulation (non fonctionnel) */}
      <div className="pt-4 flex justify-between items-center">
        <Link 
          to="/dashboard" 
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Annuler
        </Link>
        
        <div>
          <button 
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled
          >
            Enregistrer les modifications (simulation)
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Note : Ce formulaire est en mode simulation. Les données ne seront pas enregistrées.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;