import { Wallet, ChevronDown, Download, Plus, Calendar } from 'lucide-react';

const Recettes= () => {
  // Utilisation des données de db.json pour créer des recettes cohérentes
  const revenues = [
    { 
      id: 1, 
      date: "2024-09-05", 
      category: "Frais de scolarité", 
      student: "Luc MAKOSSO",
      class: "Petite Section",
      description: "Scolarité Septembre 2024", 
      amount: 50000,
      paymentMethod: "Espèces"
    },
    { 
      id: 2, 
      date: "2024-09-05", 
      category: "Inscription", 
      student: "Luc MAKOSSO",
      class: "Petite Section",
      description: "Frais d'inscription", 
      amount: 45000,
      paymentMethod: "Espèces"
    },
    { 
      id: 3, 
      date: "2024-09-05", 
      category: "Tenue scolaire", 
      student: "Luc MAKOSSO",
      class: "Petite Section",
      description: "Uniforme et tenue de sport", 
      amount: 31500,
      paymentMethod: "Espèces"
    },
    { 
      id: 4, 
      date: "2024-09-05", 
      category: "Livres et fournitures", 
      student: "Luc MAKOSSO",
      class: "Petite Section",
      description: "Manuels et fournitures", 
      amount: 18000,
      paymentMethod: "Espèces"
    },
    { 
      id: 5, 
      date: "2024-09-10", 
      category: "Frais de scolarité", 
      student: "Anne NGOUMA",
      class: "Petite Section",
      description: "Scolarité Septembre 2024", 
      amount: 50000,
      paymentMethod: "Espèces"
    },
    { 
      id: 6, 
      date: "2024-09-10", 
      category: "Inscription", 
      student: "Anne NGOUMA",
      class: "Petite Section",
      description: "Frais d'inscription", 
      amount: 45000,
      paymentMethod: "Espèces"
    },
    { 
      id: 7, 
      date: "2024-10-05", 
      category: "Frais de scolarité", 
      student: "Luc MAKOSSO",
      class: "Petite Section",
      description: "Scolarité Octobre 2024", 
      amount: 50000,
      paymentMethod: "Espèces"
    },
    { 
      id: 8, 
      date: "2024-10-08", 
      category: "Frais de scolarité", 
      student: "Anne NGOUMA",
      class: "Petite Section",
      description: "Scolarité Octobre 2024", 
      amount: 50000,
      paymentMethod: "Chèque"
    },
  ];

  // Catégories de recettes
  const revenueCategories = [
    "Frais de scolarité", "Inscription", "Réinscription", 
    "Tenue scolaire", "Livres et fournitures", "Autres"
  ];

  // Synthèse des recettes par catégorie (montants cohérents)
  const revenueSummary = [
    { category: "Frais de scolarité", amount: 200000, percentage: 52.6 },
    { category: "Inscription", amount: 90000, percentage: 23.7 },
    { category: "Tenue scolaire", amount: 31500, percentage: 8.3 },
    { category: "Livres et fournitures", amount: 18000, percentage: 4.7 },
    { category: "Autres", amount: 500, percentage: 0.1 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-600 border-b pb-2">
        <Wallet className="inline mr-2" /> Gestion des Recettes
      </h1>

      {/* En-tête avec boutons d'action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <select className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500">
              <option>Toutes les périodes</option>
              <option>Septembre 2024</option>
              <option>Octobre 2024</option>
              <option>Novembre 2024</option>
              <option>Décembre 2024</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="relative">
            <select className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500">
              <option>Toutes les catégories</option>
              {revenueCategories.map((category, index) => (
                <option key={index}>{category}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
          
          <div className="relative">
            <select className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-red-500">
              <option>Toutes les classes</option>
              <option>Petite Section</option>
              <option>Moyenne Section</option>
              <option>Grande Section</option>
              <option>CP</option>
              <option>CE1</option>
              <option>CE2</option>
              <option>CM1</option>
              <option>CM2</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700">
            <Plus size={16} /> Nouvelle recette
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300">
            <Download size={16} /> Exporter
          </button>
        </div>
      </div>

      {/* Résumé des recettes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graphique de répartition des recettes */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Répartition des recettes</h2>
          <div className="space-y-3">
            {revenueSummary.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.category}</span>
                  <span className="font-medium">{item.amount.toLocaleString()} FCFA ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total des recettes avec ventilation mensuelle */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Aperçu mensuel</h2>
          <p className="text-3xl font-bold text-green-600 mb-4">380 000 FCFA</p>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span>Septembre 2024</span>
                <span className="font-medium">285 000 FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Octobre 2024</span>
                <span className="font-medium">95 000 FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des recettes */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 bg-green-600 text-white font-medium">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-2">Élève</div>
          <div className="col-span-2">Classe</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {revenues.map(revenue => (
          <div key={revenue.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-green-50">
            <div className="col-span-2 flex items-center">
              <Calendar size={16} className="inline mr-2 text-gray-500" />
              {new Date(revenue.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="col-span-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">{revenue.category}</span>
            </div>
            <div className="col-span-2">{revenue.student}</div>
            <div className="col-span-2">{revenue.class}</div>
            <div className="col-span-2 font-medium text-green-600">
              {revenue.amount.toLocaleString()} FCFA
            </div>
            <div className="col-span-2 flex gap-2">
              <button className="text-blue-600 hover:text-blue-800">Détails</button>
              <button className="text-red-600 hover:text-red-800">Annuler</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Affichage de 1 à {revenues.length} sur {revenues.length} entrées
        </div>
        <div className="flex gap-1">
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50" disabled>
            Précédent
          </button>
          <button className="px-3 py-1 border rounded bg-green-600 text-white">
            1
          </button>
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50" disabled>
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recettes;