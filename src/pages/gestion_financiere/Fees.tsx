import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AnnexFeeResponse {
  feeId: string;
  feeName: string;
  feeType: string;
  amount: number;
  description: string;
}

interface AnnexFeeRequest {
  feeName: string;
  description: string;
  amount: number;
}

const Fees = () => {
  const [fees, setFees] = useState<AnnexFeeResponse[]>([]);
  const [newFee, setNewFee] = useState<AnnexFeeRequest>({
    feeName: '',
    amount: 0,
    description: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/v1/annex-fees/`;

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}all`, {
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur ${response.status}`);
      }

      const data: AnnexFeeResponse[] = await response.json();
      setFees(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur serveur';
      toast.error(`Échec du chargement: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFee = async () => {
    if (!newFee.feeName.trim()) {
      toast.warn('Le nom du frais est requis');
      return;
    }
    if (newFee.amount <= 0) {
      toast.warn('Le montant doit être positif');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newFee)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur ${response.status}`);
      }

      const createdFee: AnnexFeeResponse = await response.json();
      setFees(prev => [...prev, createdFee]);
      setNewFee({ feeName: '', amount: 0, description: '' });
      setShowForm(false);
      toast.success('Frais créé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Échec de la création: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFee = async (feeId: string) => {
    if (!window.confirm("Confirmez la suppression de ce frais ?")) return;

    try {
      const response = await fetch(``, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur ${response.status}`);
      }

      setFees(prev => prev.filter(fee => fee.feeId !== feeId));
      toast.success('Frais supprimé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Échec de la suppression: ${errorMessage}`);
    }
  };

  const handleUpdateFee = async (feeId: string, updatedData: AnnexFeeRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}${feeId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur ${response.status}`);
      }

      const updatedFee: AnnexFeeResponse = await response.json();
      setFees(prev => prev.map(fee => fee.feeId === feeId ? updatedFee : fee));
      toast.success('Frais mis à jour avec succès');
      return updatedFee;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Échec de la mise à jour: ${errorMessage}`);
      throw err;
    }
  };

  const filteredFees = fees.filter(fee =>
    fee.feeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fee.description && fee.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Frais Annexes</h1>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            <Plus size={18} /> Ajouter un frais
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un frais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {showForm && (
            <div className="mb-6 p-4 border rounded bg-gray-50">
              <h2 className="text-lg font-semibold mb-4">Nouveau Frais Annexe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-1 font-medium">Nom du frais *</label>
                  <input
                    type="text"
                    value={newFee.feeName}
                    onChange={(e) => setNewFee({...newFee, feeName: e.target.value})}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Montant (FCFA) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newFee.amount || ''}
                    onChange={(e) => setNewFee({...newFee, amount: Number(e.target.value)})}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    value={newFee.description}
                    onChange={(e) => setNewFee({...newFee, description: e.target.value})}
                    className="border p-2 w-full rounded resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleAddFee}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFees.length > 0 ? (
                  filteredFees.map(fee => (
                    <FeeRow 
                      key={fee.feeId}
                      fee={fee}
                      onDelete={handleDeleteFee}
                      onUpdate={handleUpdateFee}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'Aucun résultat' : 'Aucun frais configuré'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeeRow = ({ fee, onDelete, onUpdate }: { 
  fee: AnnexFeeResponse; 
  onDelete: (feeId: string) => void; 
  onUpdate: (feeId: string, updatedData: AnnexFeeRequest) => void 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFee, setEditedFee] = useState<AnnexFeeRequest>({
    feeName: fee.feeName,
    amount: fee.amount,
    description: fee.description
  });

  const handleSave = async () => {
    try {
      await onUpdate(fee.feeId, editedFee);
      setIsEditing(false);
    } catch (error) {
      // L'erreur est déjà gérée dans handleUpdateFee
    }
  };

  const handleCancel = () => {
    setEditedFee({
      feeName: fee.feeName,
      amount: fee.amount,
      description: fee.description
    });
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="text"
            value={editedFee.feeName}
            onChange={(e) => setEditedFee({...editedFee, feeName: e.target.value})}
            className="border p-1 rounded w-full"
            required
          />
        ) : (
          <div className="font-medium">{fee.feeName}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {fee.feeType || 'ANNEXE'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <input
            type="number"
            min="0"
            step="0.01"
            value={editedFee.amount}
            onChange={(e) => setEditedFee({...editedFee, amount: Number(e.target.value)})}
            className="border p-1 rounded w-full"
            required
          />
        ) : (
          <span>{fee.amount.toLocaleString('fr-FR')} FCFA</span>
        )}
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <textarea
            value={editedFee.description}
            onChange={(e) => setEditedFee({...editedFee, description: e.target.value})}
            className="border p-1 rounded w-full resize-none"
            rows={2}
          />
        ) : (
          <span className="text-sm text-gray-500">
            {fee.description || 'Aucune description'}
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-900 p-1"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900 p-1"
              >
                Annuler
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-900 p-1"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(fee.feeId)}
                className="text-red-600 hover:text-red-900 p-1"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default Fees;