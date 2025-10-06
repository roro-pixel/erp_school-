import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Invoice, Student } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useInvoices = () => {
  const queryClient = useQueryClient();
  const { getToken, isAuthenticated } = useAuth();

  const createApiInstance = () => {
    const token = getToken();
    const instance = axios.create({
      baseURL: API_URL,
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            Accept: 'application/json',
          }
        : undefined,
    });
    return instance;
  };

  const invoicesAll = useQuery({
    queryKey: ['levels'], // Clé de requête sous forme de tableau
    queryFn: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        const api = createApiInstance();
        const response = await api.get<Invoice[]>('/invoices');
        return handleResponse<[Invoice]>(response);
      } catch (error) {
        console.log(error);
        throw new Error('Erreur lors du chargement des factures. Veuillez réessayer.');
      }
    },
    enabled: isAuthenticated(),
  });

  const getInvoiceDetails = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher les détails de la facture.');
      }

      const api = createApiInstance();
      const response = await api.get<Invoice>(`/invoices/${invoice.id}`);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage du niveau : ${errorMessage}`);
    },
  });

  const generatePDF = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!isAuthenticated()) {
        throw new Error("Vous devez être connecté pour générer PDF.");
      }

      const api = createApiInstance();
      const response = await api.get<Invoice>(`/invoices/${invoice.id}/pdf`);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la génération du pdf : ${errorMessage}`);
    },
  });

  const getReports = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        throw new Error("Vous devez être connecté pour générer rapports.");
      }

      const api = createApiInstance();
      const response = await api.get<Invoice>(`/invoices/reports`);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la génération du rapport : ${errorMessage}`);
    },
  });

  const getInvoicesStudent = useMutation({
    mutationFn: async ({student}: {student: Student}) => {
      if (!isAuthenticated()) {
        throw new Error("Vous devez être connecté pour obtenir la facture de l'élève.");
      }

      const api = createApiInstance();
      const response = await api.get<Invoice>(`/invoices/students/${student.id}`);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'obtention de la facture: ${errorMessage}`);
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'invoiceId'>) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour créer une facture.');
      }

      const api = createApiInstance();
      const response = await api.post<Invoice>('/invoices', invoice);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice'] }); // Utilisation d'un objet
      toast.success('Facture créée avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la création de la facture: ${errorMessage}`);
    },
  });

  const sendInvoiceToParent = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour envoyer une facture.');
      }

      const api = createApiInstance();
      const response = await api.post<Invoice>(`/invoices/${invoice.id}/send`, invoice);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Utilisation d'un objet
      toast.success('Facture anvoyée avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'envoie de la facture: ${errorMessage}`);
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour modifier la facture.');
      }

      const api = createApiInstance();
      const response = await api.put<Invoice>(`/invoices/${invoice.id}`, invoice);
      return handleResponse<Invoice>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Utilisation d'un objet
      toast.success('Facture mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour de la facture : ${errorMessage}`);
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (invoice: Invoice) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprier une facture.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/invoices/${invoice.id}`);
        // Vérifiez explicitement le statut de la réponse
        if (response.status >= 200 && response.status < 300) {
          return response.data;
        } else {
          throw new Error(response.data?.message || `Erreur: ${response.status}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || error.message);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Facture supprimée avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression de la facture : ${errorMessage}`);
      }
    },
  });

  

  return {
    invoicesAll,
    getInvoiceDetails,
    generatePDF,
    getReports,
    getInvoicesStudent,
    createInvoice,
    sendInvoiceToParent,
    updateInvoice,
    deleteInvoice
  };
};