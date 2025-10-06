import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Fee } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useFees = () => {
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

  const feesAll = useQuery({
    queryKey: ['fees'], // Clé de requête sous forme de tableau
    queryFn: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        const api = createApiInstance();
        const response = await api.get<Fee[]>('/fees');
        return handleResponse<Fee[]>(response);
      } catch (error) {
        console.log(error);
        throw new Error('Erreur lors du chargement du frais. Veuillez réessayer.');
      }
    },
    enabled: isAuthenticated(),
  });

  const createFee = useMutation({
    mutationFn: async (fee: Omit<Fee, 'feeId'>) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour créer un frais.');
      }

      const api = createApiInstance();
      const response = await api.post<Fee>('/fees', fee);
      return handleResponse<Fee>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] }); // Utilisation d'un objet
      toast.success('Frais créé avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la création du frais: ${errorMessage}`);
    },
  });

  const getFee = useMutation({
    mutationFn: async (fee: Fee) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher un frais.');
      }

      const api = createApiInstance();
      const response = await api.get<Fee>(`fees/${fee.id}`);
      return handleResponse<Fee>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage du frais: ${errorMessage}`);
    },
  });

  const updateFee = useMutation({
    mutationFn: async (fee: Fee) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour modifier un frais.');
      }

      const api = createApiInstance();
      const response = await api.put<Fee>(`fees/${fee.id}`, fee);
      return handleResponse<Fee>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] }); // Utilisation d'un objet
      toast.success('Frais mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour du frais: ${errorMessage}`);
    },
  });

  const deleteFee = useMutation({
    mutationFn: async (feeId: string) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer un frais .');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/fees/${feeId}`);
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
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast.success('Frais supprimé avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression du frais : ${errorMessage}`);
      }
    },
  });


  return {
    feesAll,
    getFee,
    createFee,
    updateFee,
    deleteFee,
  };
};