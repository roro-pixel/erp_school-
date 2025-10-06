import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Level, Class } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useLevels = () => {
  const queryClient = useQueryClient();
  const { getToken, isAuthenticated } = useAuth();

  const createApiInstance = () => {
    const token = getToken();
    return axios.create({
      baseURL: API_URL,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        Accept: 'application/json',
      }
    });
  };

  // Récupérer tous les niveaux
  const fetchAllLevels = useQuery<Level[], Error>({
    queryKey: ['levels'],
    queryFn: async () => {
      if (!isAuthenticated()) throw new Error('Authentification requise');
      const api = createApiInstance();
      const response = await api.get('/levels');
      return handleResponse<Level[]>(response);
    },
    enabled: isAuthenticated(),
  });

  // Récupérer un niveau spécifique
  const fetchLevelById = useMutation<Level, Error, string>({
    mutationFn: async (levelId) => {
      const api = createApiInstance();
      const response = await api.get(`/levels/${levelId}`);
      return handleResponse<Level>(response);
    }
  });

  // Créer un nouveau niveau
  const createNewLevel = useMutation<Level, Error, Omit<Level, 'id'>>({
    mutationFn: async (newLevel) => {
      const api = createApiInstance();
      const response = await api.post('/levels', newLevel);
      return handleResponse<Level>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success('Niveau créé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Mettre à jour un niveau
  const updateExistingLevel = useMutation<Level, Error, Level>({
    mutationFn: async (updatedLevel) => {
      const api = createApiInstance();
      const response = await api.put(`/levels/${updatedLevel.id}`, updatedLevel);
      return handleResponse<Level>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success('Niveau mis à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Supprimer un niveau
  const deleteLevel = useMutation<void, Error, string>({
    mutationFn: async (levelId) => {
      const api = createApiInstance();
      const response = await api.delete(`/levels/${levelId}`);
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success('Niveau supprimé');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Gestion des classes dans un niveau
  const fetchClassesInLevel = useMutation<Class[], Error, string>({
    mutationFn: async (levelId) => {
      const api = createApiInstance();
      const response = await api.get(`/levels/${levelId}/classes`);
      return handleResponse<Class[]>(response);
    }
  });

  const addClassToLevel = useMutation<Level, Error, { levelId: string; classId: string }>({
    mutationFn: async ({ levelId, classId }) => {
      const api = createApiInstance();
      const response = await api.post(`/levels/${levelId}/classes`, { classId });
      return handleResponse<Level>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success('Classe ajoutée au niveau');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const removeClassFromLevel = useMutation<void, Error, { levelId: string; classId: string }>({
    mutationFn: async ({ levelId, classId }) => {
      const api = createApiInstance();
      const response = await api.delete(`/levels/${levelId}/classes/${classId}`);
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success('Classe retirée du niveau');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    fetchAllLevels,
    fetchLevelById,
    createNewLevel,
    updateExistingLevel,
    deleteLevel,
    fetchClassesInLevel,
    addClassToLevel,
    removeClassFromLevel
  };
};