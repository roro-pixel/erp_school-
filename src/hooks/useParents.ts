import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Parent, Family } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useParents = () => {
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

  const parentsAll = useQuery({
    queryKey: ['parents'], // Clé de requête sous forme de tableau
    queryFn: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        const api = createApiInstance();
        const response = await api.get<Parent[]>('/parents');
        return handleResponse<Parent[]>(response);
      } catch (error) {
        console.log(error);
        throw new Error('Erreur lors du chargement des parents. Veuillez réessayer.');
      }
    },
    enabled: isAuthenticated(),
  });

  const getParentByPhoneNumber = useMutation({
    mutationFn: async (parent: Parent) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher le parent.');
      }

      const api = createApiInstance();
      const response = await api.get<Parent>(`/parents/${parent.phone}`);
      return handleResponse<Parent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage du parent: ${errorMessage}`);
    },
  });

  const getParentById = useMutation({
    mutationFn: async (parent: Parent) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher le parent.');
      }

      const api = createApiInstance();
      const response = await api.get<Parent>(`/parents/${parent.id}`);
      return handleResponse<Parent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage du parent: ${errorMessage}`);
    },
  });

  const getParentByFamily = useMutation({
    mutationFn: async ({ family }: { family: Family })  => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher le parent.');
      }

      const api = createApiInstance();
      const response = await api.get<Parent>(`/parents/family/${family.id}`);
      return handleResponse<Parent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] }); // Utilisation d'un objet
      toast.success('Parent mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage du parent: ${errorMessage}`);
    },
  });

  const createParent = useMutation({
    mutationFn: async (parent: Omit<Parent, 'parentId'>) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour créer un parent.');
      }

      const api = createApiInstance();
      const response = await api.post<Parent>('/parents', parent);
      return handleResponse<Parent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] }); // Utilisation d'un objet
      toast.success('Parent créé avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la création du parent: ${errorMessage}`);
    },
  });

  const updateParent = useMutation({
    mutationFn: async (parent: Parent) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour modifier un parent.');
      }

      const api = createApiInstance();
      const response = await api.put<Parent>(`/parents/${parent.id}`, parent);
      return handleResponse<Parent>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] }); // Utilisation d'un objet
      toast.success('Parent mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour du parent: ${errorMessage}`);
    },
  });

  const deleteParent = useMutation({
    mutationFn: async (parentId: Parent) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer un parent.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/parents/${parentId.id}`);
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
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent supprimé avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression du parent : ${errorMessage}`);
      }
    },
  });


  return {
    parentsAll,
    getParentById,
    getParentByPhoneNumber,
    getParentByFamily,
    createParent,
    updateParent,
    deleteParent,
  };
};