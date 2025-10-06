const TeacherPayments = () => {
  // Données simulées avec montants corrects
  const payments = [
    { id: 1, teacher: "Chantal MAMPOUYA", month: "09/2024", amount: "48000 FCFA", method: "Virement" },
    { id: 2, teacher: "BOUITY Jacques", month: "09/2024", amount: "52000 FCFA", method: "Chèque" }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-red-600 border-b pb-2">
        Historique des paiements
      </h1>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 bg-red-600 text-white font-medium">
          <div className="col-span-4">Enseignant</div>
          <div className="col-span-2">Mois</div>
          <div className="col-span-2">Montant</div>
          <div className="col-span-2">Méthode</div>
          <div className="col-span-2">Justificatif</div>
        </div>
        
        {payments.map(payment => (
          <div key={payment.id} className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-red-50 items-center">
            <div className="col-span-4">{payment.teacher}</div>
            <div className="col-span-2 font-mono">{payment.month}</div>
            <div className="col-span-2 text-red-600 font-medium">{payment.amount}</div>
            <div className="col-span-2">{payment.method}</div>
            <div className="col-span-2">
              <button className="text-sm text-blue-600 hover:underline">
                Télécharger
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherPayments;