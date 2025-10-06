import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Class, Student } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useClasses = () => {
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

  // Récupérer toutes les classes
  const fetchAllClasses = useQuery<Class[], Error>({
    queryKey: ['classes'],
    queryFn: async () => {
      if (!isAuthenticated()) {
        throw new Error('Authentification requise');
      }
      const api = createApiInstance();
      const response = await api.get('/classes');
      return handleResponse<Class[]>(response);
    },
    enabled: isAuthenticated(),
  });

  // Récupérer une classe spécifique
  const fetchClassById = useMutation<Class, Error, string>({
    mutationFn: async (classId) => {
      const api = createApiInstance();
      const response = await api.get(`/classes/${classId}`);
      return handleResponse<Class>(response);
    }
  });

  // Créer une nouvelle classe
  const createNewClass = useMutation<Class, Error, Omit<Class, 'id'>>({
    mutationFn: async (newClass) => {
      const api = createApiInstance();
      const response = await api.post('/classes', newClass);
      return handleResponse<Class>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Classe créée avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Mettre à jour une classe
  const updateExistingClass = useMutation<Class, Error, Class>({
    mutationFn: async (updatedClass) => {
      const api = createApiInstance();
      const response = await api.put(`/classes/${updatedClass.id}`, updatedClass);
      return handleResponse<Class>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Classe mise à jour');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Supprimer une classe
  const deleteClass = useMutation<void, Error, string>({
    mutationFn: async (classId) => {
      const api = createApiInstance();
      const response = await api.delete(`/classes/${classId}`);
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Classe supprimée');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // Gestion des étudiants dans une classe
  const fetchStudentsInClass = useMutation<Student[], Error, string>({
    mutationFn: async (classId) => {
      const api = createApiInstance();
      const response = await api.get(`/classes/${classId}/students`);
      return handleResponse<Student[]>(response);
    }
  });

  const addStudentToClass = useMutation<Class, Error, { classId: string; studentId: string }>({
    mutationFn: async ({ classId, studentId }) => {
      const api = createApiInstance();
      const response = await api.post(`/classes/${classId}/students`, { studentId });
      return handleResponse<Class>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Étudiant ajouté');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const removeStudentFromClass = useMutation<void, Error, { classId: string; studentId: string }>({
    mutationFn: async ({ classId, studentId }) => {
      const api = createApiInstance();
      const response = await api.delete(`/classes/${classId}/student/${studentId}`);
      return handleResponse<void>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Étudiant retiré');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    fetchAllClasses,
    fetchClassById,
    createNewClass,
    updateExistingClass,
    deleteClass,
    fetchStudentsInClass,
    addStudentToClass,
    removeStudentFromClass
  };
};