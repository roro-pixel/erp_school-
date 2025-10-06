import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { Document, Student, Parent } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useDocuments = () => {
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

  const getDocument = useMutation({
    mutationFn: async (documents: Document) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher un document.');
      }

      const api = createApiInstance();
      const response = await api.get<Document>(`/document/${documents.id}`);
      return handleResponse<Document>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de afficher du document: ${errorMessage}`);
    },
  });

  const getDocumentAllStudents = useMutation({
    mutationFn: async ({student}: {student: Student}) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher un document.');
      }

      const api = createApiInstance();
      const response = await api.get<Document>(`/document/student/${student.id}`);
      return handleResponse<Document>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de afficher du document: ${errorMessage}`);
    },
  });

  const getDocumentAllParents = useMutation({
    mutationFn: async ({parent}: {parent: Parent}) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour afficher un document.');
      }

      const api = createApiInstance();
      const response = await api.get<Document>(`/document/student/${parent.id}`);
      return handleResponse<Document>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Utilisation d'un objet
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de afficher du document: ${errorMessage}`);
    },
  });



  const updateDocument = useMutation({
    mutationFn: async (documents: Document) => {
      if (!isAuthenticated()) {
        throw new Error('Vous devez être connecté pour modifier un document.');
      }

      const api = createApiInstance();
      const response = await api.post<Document>(`/document`, documents);
      return handleResponse<Document>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] }); // Utilisation d'un objet
      toast.success('Document mis à jour avec succès.');
    },
    onError: (error: Error | unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la mise à jour du document: ${errorMessage}`);
    },
  });

  

  return {
   getDocument,
   getDocumentAllParents,
   getDocumentAllStudents,
   updateDocument
  };
};