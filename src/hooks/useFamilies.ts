import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Family } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useFamilies = () => {
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

  const familiesAll = useQuery({
    queryKey: ['families'], // Clé de requête sous forme de tableau
    queryFn: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        const api = createApiInstance();
        const response = await api.get<Family[]>('/family');
        return handleResponse<Family[]>(response);
      } catch (error) {
        console.log(error);
        throw new Error('Erreur lors du chargement des familles. Veuillez réessayer.');
      }
    },
    enabled: isAuthenticated(),
  });

  const  getFamilyById = useMutation({
    mutationFn: async (famille: Family) => {
      if (!isAuthenticated()) {
        throw new Error("Vous devez être connecté pour afficher une famille.");
      }

      const api = createApiInstance();
      const response = await api.get<Family>(`/family${famille.id}`);
      return handleResponse<Family>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage de la famille : ${errorMessage}`);
    },
  });

  const  getFamilyByPhoneNumber = useMutation({
    mutationFn: async (famille: Family) => {
      if (!isAuthenticated()) {
        throw new Error("Vous devez être connecté pour afficher une famille.");
      }

      const api = createApiInstance();
      const response = await api.get<Family>(`/family${famille.phone}`);
      return handleResponse<Family>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage de la famille : ${errorMessage}`);
    },
  });

  const createFamily = useMutation({
    mutationFn: async (family: Omit<Family, 'familyId'>) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour créer une famille.');
      }

      const api = createApiInstance();
      const response = await api.post<Family>('family', family);
      return handleResponse<Family>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] }); // Utilisation d'un objet
      toast.success('Famille créée avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la création de la famille: ${errorMessage}`);
    },
  });

  const updateFamily = useMutation({
    mutationFn: async (famille: Family) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour modifier une famille.');
      }

      const api = createApiInstance();
      const response = await api.put<Family>(`/family${famille.id}`, famille);
      return handleResponse<Family>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] }); // Utilisation d'un objet
      toast.success('Famille mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour de la famille : ${errorMessage}`);
    },
  });

  const deleteFamily = useMutation({
    mutationFn: async (familyId: Family) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer une famille.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/family/${familyId.id}`);
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
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast.success('Famille supprimée avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression de la famille : ${errorMessage}`);
      }
    },
  });

  const deleteAllFamilies = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer tous les familles.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/family`);
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
      queryClient.invalidateQueries({ queryKey: ['families'] });
      toast.success('Familles supprimées avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression des familles : ${errorMessage}`);
      }
    },
  });

  return {
    familiesAll,
    getFamilyById,
    getFamilyByPhoneNumber,
    createFamily,
    updateFamily,
    deleteFamily,
    deleteAllFamilies
  };
};