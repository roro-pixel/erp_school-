import { Wallet, ChevronDown, Download, Plus, Calendar } from 'lucide-react';

const Depenses = () => {
  // Données simulées avec montants cohérents
  const expenses = [
    { 
      id: 1, 
      date: "2024-09-15", 
      category: "Salaires", 
      description: "Salaires enseignants Septembre", 
      amount: 380000,
      paymentMethod: "Virement"
    },
    { 
      id: 2, 
      date: "2024-09-10", 
      category: "Fournitures", 
      description: "Achat de fournitures scolaires", 
      amount: 75000,
      paymentMethod: "Chèque"
    },
    { 
      id: 3, 
      date: "2024-09-25", 
      category: "Entretien", 
      description: "Maintenance bâtiment", 
      amount: 45000,
      paymentMethod: "Espèces"
    },
    { 
      id: 4, 
      date: "2024-10-15", 
      category: "Salaires", 
      description: "Salaires enseignants Octobre", 
      amount: 380000,
      paymentMethod: "Virement"
    },
    { 
      id: 5, 
      date: "2024-10-20", 
      category: "Électricité", 
      description: "Facture électricité Octobre", 
      amount: 28500,
      paymentMethod: "Prélèvement"
    }
  ];

  // Catégories de dépenses prédéfinies
  const expenseCategories = [
    "Salaires", "Fournitures", "Entretien", "Électricité", "Eau", 
    "Internet", "Transport", "Alimentation", "Taxes", "Autres"
  ];

  // Synthèse des dépenses par catégorie
  const expenseSummary = [
    { category: "Salaires", amount: 760000, percentage: 83.6 },
    { category: "Fournitures", amount: 75000, percentage: 8.2 },
    { category: "Entretien", amount: 45000, percentage: 4.9 },
    { category: "Électricité", amount: 28500, percentage: 3.1 },
    { category: "Autres", amount: 2000, percentage: 0.2 }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-600 border-b pb-2">
        <Wallet className="inline mr-2" /> Gestion des Dépenses
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
              {expenseCategories.map((category, index) => (
                <option key={index}>{category}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-700">
            <Plus size={16} /> Nouvelle dépense
          </button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300">
            <Download size={16} /> Exporter
          </button>
        </div>
      </div>

      {/* Résumé des dépenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Graphique de répartition des dépenses */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Répartition des dépenses</h2>
          <div className="space-y-3">
            {expenseSummary.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.category}</span>
                  <span className="font-medium">{item.amount.toLocaleString()} FCFA ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total des dépenses avec ventilation mensuelle */}
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="font-bold text-lg mb-4">Aperçu mensuel</h2>
          <p className="text-3xl font-bold text-red-600 mb-4">910 500 FCFA</p>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span>Septembre 2024</span>
                <span className="font-medium">500 000 FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: "54.9%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Octobre 2024</span>
                <span className="font-medium">408 500 FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: "44.9%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>Novembre 2024</span>
                <span className="font-medium">2 000 FCFA</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: "0.2%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des dépenses */}
      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 bg-red-600 text-white font-medium">
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Catégorie</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {expenses.map(expense => (
          <div key={expense.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-red-50">
            <div className="col-span-2 flex items-center">
              <Calendar size={16} className="inline mr-2 text-gray-500" />
              {new Date(expense.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="col-span-2">
              <span className="px-2 py-1 bg-gray-100 rounded text-sm">{expense.category}</span>
            </div>
            <div className="col-span-4">{expense.description}</div>
            <div className="col-span-2 font-medium text-red-600">
              {expense.amount.toLocaleString()} FCFA
            </div>
            <div className="col-span-2 flex gap-2">
              <button className="text-blue-600 hover:text-blue-800">Modifier</button>
              <button className="text-red-600 hover:text-red-800">Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Affichage de 1 à {expenses.length} sur {expenses.length} entrées
        </div>
        <div className="flex gap-1">
          <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50" disabled>
            Précédent
          </button>
          <button className="px-3 py-1 border rounded bg-red-600 text-white">
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

export default Depenses;