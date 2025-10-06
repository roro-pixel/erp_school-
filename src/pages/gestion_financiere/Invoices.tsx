import { useState, useEffect } from 'react';
import { Search, Printer, Download, Check, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';

// Déclaration des types pour jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Import du plugin autoTable
import 'jspdf-autotable';

// Interfaces basées sur votre backend
interface InvoiceItemResponse {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

interface PaymentBasicInfo {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  monthsPaid: string[];
  status: string;
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
  items: InvoiceItemResponse[];
  payments: PaymentBasicInfo[];
  className: string;
  academicYear: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Invoices = () => {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
      setInvoices(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des factures';
      setError(errorMessage);
      console.error(`Désolé, ${errorMessage.toLowerCase()}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchInvoices();
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      `${invoice.studentFirstname} ${invoice.studentLastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.className.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'PARTIAL':
      case 'PARTIALLY_PAID':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'Payée';
      case 'PENDING':
        return 'En attente';
      case 'OVERDUE':
        return 'En retard';
      case 'PARTIAL':
      case 'PARTIALLY_PAID':
        return 'Partielle';
      default:
        return status || 'Non défini';
    }
  };

  // Fonction PDF corrigée - Version simple et efficace
  const generateInvoicePDF = (invoice: InvoiceResponse) => {
    // Créer le contenu HTML à imprimer
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Facture ${invoice.invoiceNumber}</title>
        <style>
          @page { 
            margin: 1cm; 
            size: A4;
          }
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.4; 
            margin: 0; 
            padding: 0;
            font-size: 12px;
          }
          .header { 
            background: #2980b9; 
            color: white; 
            padding: 15px; 
            text-align: center; 
            margin-bottom: 20px;
          }
          .header h1 { 
            margin: 0; 
            font-size: 24px; 
          }
          .header p { 
            margin: 5px 0 0 0; 
            font-size: 12px; 
          }
          .invoice-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin-bottom: 15px; 
            text-align: center;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px; 
          }
          .info-section p { 
            margin: 3px 0; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background-color: #3498db; 
            color: white; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f8f9fa; 
          }
          .summary { 
            float: right; 
            width: 250px; 
            border: 1px solid #ddd; 
            padding: 10px; 
            margin: 15px 0; 
          }
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 5px 0; 
          }
          .total-row { 
            font-weight: bold; 
            border-top: 1px solid #ddd; 
            padding-top: 5px; 
            margin-top: 10px;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 10px; 
            color: #666; 
            clear: both;
          }
          .notes-section {
            margin-top: 20px;
            clear: both;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Les Minimes</h1>
          <p>Brazzaville, République du Congo | Tél: +242 06 123 456</p>
        </div>
        
        <div class="invoice-title">FACTURE</div>
        
        <div class="info-grid">
          <div class="info-section">
            <p><strong>N° Facture:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date d'émission:</strong> ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Statut:</strong> ${getStatusText(invoice.status)}</p>
          </div>
          <div class="info-section">
            <p><strong>Élève:</strong> ${invoice.studentFirstname} ${invoice.studentLastname}</p>
            <p><strong>Classe:</strong> ${invoice.className}</p>
            <p><strong>Année scolaire:</strong> ${invoice.academicYear}</p>
            <p><strong>ID Élève:</strong> ${invoice.studentId}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.amount.toLocaleString('fr-FR')} FCFA</td>
                <td>${(item.amount * item.quantity).toLocaleString('fr-FR')} FCFA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${invoice.payments && invoice.payments.length > 0 ? `
          <h3>HISTORIQUE DES PAIEMENTS</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Mois payés</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.payments.map(payment => `
                <tr>
                  <td>${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</td>
                  <td>${payment.amount.toLocaleString('fr-FR')} FCFA</td>
                  <td>${payment.paymentMethod}</td>
                  <td>${payment.monthsPaid.join(', ')}</td>
                  <td>${payment.status === 'COMPLETED' ? 'Validé' : payment.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        <div class="summary">
          <div class="summary-row">
            <span>Montant total:</span>
            <span>${invoice.totalAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
          ${invoice.discountAmount > 0 ? `
            <div class="summary-row">
              <span>Remise:</span>
              <span>-${invoice.discountAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          ` : ''}
          <div class="summary-row">
            <span>Montant net:</span>
            <span>${invoice.netAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div class="summary-row">
            <span>Montant payé:</span>
            <span>${invoice.paidAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div class="summary-row total-row">
            <span>Solde restant:</span>
            <span>${invoice.balance.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="notes-section">
            <h3>NOTES:</h3>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Les Minimes - Enseignement d'excellence</p>
          <p>Merci de votre confiance</p>
        </div>
      </body>
      </html>
    `;

    // Ouvrir dans une nouvelle fenêtre et imprimer
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      };
    } else {
      alert('Veuillez autoriser les pop-ups pour générer le PDF');
    }
  };

  // Export Excel amélioré avec mise en forme propre
  const exportAllInvoicesExcel = () => {
    // Créer un fichier Excel au format HTML pour une meilleure compatibilité
    const htmlTable = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
          .number { text-align: right; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>N° Facture</th>
              <th>Prénom Élève</th>
              <th>Nom Élève</th>
              <th>Classe</th>
              <th>Année Scolaire</th>
              <th>Date Émission</th>
              <th>Date Échéance</th>
              <th>Montant Total</th>
              <th>Remise</th>
              <th>Montant Net</th>
              <th>Montant Payé</th>
              <th>Solde Restant</th>
              <th>Statut</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${filteredInvoices.map(invoice => `
              <tr>
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.studentFirstname}</td>
                <td>${invoice.studentLastname}</td>
                <td>${invoice.className}</td>
                <td>${invoice.academicYear}</td>
                <td>${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</td>
                <td>${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</td>
                <td class="number">${invoice.totalAmount}</td>
                <td class="number">${invoice.discountAmount}</td>
                <td class="number">${invoice.netAmount}</td>
                <td class="number">${invoice.paidAmount}</td>
                <td class="number">${invoice.balance}</td>
                <td>${getStatusText(invoice.status)}</td>
                <td>${invoice.notes || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Créer et télécharger le fichier
    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `factures_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Impression simple sans nouvelle fenêtre
  const handlePrint = (invoice: InvoiceResponse) => {
    // Année académique en dur
    const academicYear = "2025-2026";
    
    // Sauvegarder le contenu actuel
    const originalContent = document.body.innerHTML;
    
    // Créer le contenu d'impression
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2980b9; margin: 0;">Les Minimes</h1>
          <p style="margin: 5px 0;">Brazzaville, République du Congo | Tél: +242 06 123 456</p>
        </div>
        
        <h2 style="text-align: center; margin-bottom: 20px;">FACTURE</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <p><strong>N° Facture:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date d'émission:</strong> ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Date d'échéance:</strong> ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
            <p><strong>Statut:</strong> ${getStatusText(invoice.status)}</p>
          </div>
          <div>
            <p><strong>Élève:</strong> ${invoice.studentFirstname} ${invoice.studentLastname}</p>
            <p><strong>Classe:</strong> ${invoice.className}</p>
            <p><strong>Année scolaire:</strong> ${academicYear}</p>
            <p><strong>ID Élève:</strong> ${invoice.studentId}</p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Quantité</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Prix unitaire</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.amount.toLocaleString('fr-FR')} FCFA</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${(item.amount * item.quantity).toLocaleString('fr-FR')} FCFA</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px;">
          <div style="float: right; width: 300px; border: 1px solid #ddd; padding: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Montant total:</span>
              <span>${invoice.totalAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
            ${invoice.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Remise:</span>
                <span>-${invoice.discountAmount.toLocaleString('fr-FR')} FCFA</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Montant net:</span>
              <span>${invoice.netAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Montant payé:</span>
              <span>${invoice.paidAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 15px 0 5px 0; padding-top: 10px; border-top: 1px solid #ddd; font-weight: bold;">
              <span>Solde restant:</span>
              <span>${invoice.balance.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
        </div>
        
        <div style="clear: both; text-align: center; margin-top: 50px; font-size: 12px; color: #666;">
          <p>Les Minimes - Enseignement d'excellence</p>
          <p>Merci de votre confiance</p>
        </div>
      </div>
    `;
    
    // Remplacer le contenu et imprimer
    document.body.innerHTML = printContent;
    window.print();
    
    // Restaurer le contenu original après impression
    document.body.innerHTML = originalContent;
    
    // Recharger les event listeners
    window.location.reload();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Factures</h1>
          <div className="flex gap-2">
            <button 
              onClick={exportAllInvoicesExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Download size={18} /> Exporter Excel
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle size={18} className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par élève, N° facture ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border p-2 rounded text-sm"
                title="Filtrer par statut"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="PAID">Payées</option>
                <option value="PENDING">En attente</option>
                <option value="PARTIAL">Partielles</option>
                <option value="PARTIALLY_PAID">Partielles</option>
                <option value="OVERDUE">En retard</option>
              </select>
              
              <div className="text-sm text-gray-600">
                {filteredInvoices.length} facture{filteredInvoices.length !== 1 ? 's' : ''} trouvée{filteredInvoices.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Facture</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Élève</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payé</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map(invoice => (
                      <tr key={invoice.invoiceNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.studentFirstname} {invoice.studentLastname}
                          </div>
                          <div className="text-sm text-gray-500">ID: {invoice.studentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.className}
                          <div className="text-xs text-gray-400">2025-2026</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Émise: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</div>
                          <div className="text-xs text-gray-400">
                            Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {invoice.totalAmount.toLocaleString('fr-FR')} FCFA
                          {invoice.discountAmount > 0 && (
                            <div className="text-xs text-green-600">
                              Remise: -{invoice.discountAmount.toLocaleString('fr-FR')} FCFA
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {invoice.paidAmount.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                            {invoice.balance.toLocaleString('fr-FR')} FCFA
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => generateInvoicePDF(invoice)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Générer PDF"
                            >
                              <Download size={18} />
                            </button>
                            <button
                              onClick={() => handlePrint(invoice)}
                              className="text-gray-700 hover:text-black p-1"
                              title="Imprimer la facture"
                            >
                              <Printer size={18} />
                            </button>
                            {invoice.balance > 0 && (
                              <button
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Marquer comme payée"
                              >
                                <Check size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                        {loading ? 'Chargement...' : 'Aucune facture trouvée'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistiques rapides */}
        {!loading && filteredInvoices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Année Scolaire</div>
              <div className="text-lg font-bold text-purple-600">2025-2026</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Total Factures</div>
              <div className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Montant Total</div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Montant Payé</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0).toLocaleString('fr-FR')} FCFA
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">Solde Restant</div>
              <div className="text-2xl font-bold text-red-600">
                {filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0).toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;