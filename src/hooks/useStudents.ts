import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Student, Class} from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useStudents = () => {
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

  const studentsAll = useQuery({
    queryKey: ['students'], // Clé de requête sous forme de tableau
    queryFn: async () => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité.');
        }

        const api = createApiInstance();
        const response = await api.get<Student[]>('/students');
        return handleResponse<Student[]>(response);
      } catch (error) {
        console.log(error);
        throw new Error('Erreur lors du chargement des élèves. Veuillez réessayer.');
      }
    },
    enabled: isAuthenticated(),
  });

  const getStudent = useMutation({
    mutationFn: async (studentId: string) => {
      if (!isAuthenticated()) {
        throw new Error("Vous devez être connecté pour afficher l'élève.");
      }

      const api = createApiInstance();
      const response = await api.get<Student[]>(`students/${studentId}`);
      return handleResponse<Student>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de l'affichage de l'élève : ${errorMessage}`);
    },
  });

 

  const createStudent = useMutation({
    mutationFn: async (student: Omit<Student, 'id'>) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour créer une famille.');
      }

      const api = createApiInstance();
      const response = await api.post<Student>('/students', student);
      return handleResponse<Student>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Utilisation d'un objet
      toast.success('Elève créé avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la création de l'élève: ${errorMessage}`);
    },
  });

  const updateStudent = useMutation({
    mutationFn: async (student: Student) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour modifier une élève.');
      }

      const api = createApiInstance();
      const response = await api.put<Student>(`students/${student.id}`, student);
      return handleResponse<Student>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Utilisation d'un objet
      toast.success('Elève mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour de l'élève : ${errorMessage}`);
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (studentId: Student) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer un élève.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/students/${studentId.id}`);
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
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Elève supprimé avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression de l'élève : ${errorMessage}`);
      }
    },
  });

  const deleteAllStudents = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer tous les élèves.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/students`);
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
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Elèves supprimés avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression des élèves : ${errorMessage}`);
      }
    },
  });

  const deleteAllStudentsClasses = useMutation({
    mutationFn: async ({classes} : {classes:Class} ) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour supprimer tous les élèves.');
      }
      
      const api = createApiInstance();
      try {
        const response = await api.delete(`/students/classes/${classes.id}`);
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
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Elèves supprimés avec succès.');
    },
    onError: (error: Error | unknown) => {
      // Gérer l'erreur comme avant
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      if (errorMessage.includes('réservé aux superviseurs')) {
        toast.error('Cette action est réservée aux superviseurs.');
      } else {
        toast.error(`Erreur lors de la suppression des élèves : ${errorMessage}`);
      }
    },
  });

  return {
    studentsAll,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    deleteAllStudents,
    deleteAllStudentsClasses
  };
};