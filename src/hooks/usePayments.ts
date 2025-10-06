import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Payment, Student } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const usePayements = () => {
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

  const paymentsAll = useQuery({
    queryKey: ['payments'], // Clé de requête sous forme de tableau
    queryFn: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        const api = createApiInstance();
        const response = await api.get<Payment[]>('/payemts');
        return handleResponse<Payment[]>(response);
      } catch (error) {
        console.log(error);
        throw new Error('Erreur lors du chargement deS paiements. Veuillez réessayer.');
      }
    },
    enabled: isAuthenticated(),
  });

  const createPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, 'paymentId'>) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour créer un paiement.');
      }

      const api = createApiInstance();
      const response = await api.post<Payment>('/payments', payment);
      return handleResponse<Payment>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment'] }); // Utilisation d'un objet
      toast.success('Paiement créé avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la création du paiement: ${errorMessage}`);
    },
  });

  const getPaymentDetails = useMutation({
    mutationFn: async (payment: Payment) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher les details de paiement.');
      }

      const api = createApiInstance();
      const response = await api.get<Payment>(`payments/${payment.id}`);
      return handleResponse<Payment>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour du paiement : ${errorMessage}`);
    },
  });

  const generateRapports = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour générer un rapport de paiement.');
      }

      const api = createApiInstance();
      const response = await api.get<Payment>(`payments/reports`);
      return handleResponse<Payment>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Utilisation d'un objet
      toast.success('Rapport générer avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage du paiement : ${errorMessage}`);
    },
  });

  const getPaymentStudent = useMutation({
    mutationFn: async ({student} : {student: Student}) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher les details de paiement.');
      }

      const api = createApiInstance();
      const response = await api.get<Payment>(`payments/students/${student.id}/payments`);
      return handleResponse<Payment>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage de paiement : ${errorMessage}`);
    },
  });

  return {
    paymentsAll,
    createPayment,
    getPaymentDetails,
    getPaymentStudent,
    generateRapports
  };
};