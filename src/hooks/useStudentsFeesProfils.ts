import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from './useAuth';
import axios, { AxiosResponse } from 'axios';
import type { 
  StudentFeeProfileResponse,
  
} from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const handleResponse = async <T>(response: AxiosResponse): Promise<T> => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.data?.message || `Erreur: ${response.status}`);
};

export const useStudentsFeeProfiles = () => {
  const queryClient = useQueryClient();
  const { getToken, isAuthenticated } = useAuth();

  const createApiInstance = () => {
    const token = getToken();
    return axios.create({
      baseURL: API_URL,
      headers: token ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        Accept: 'application/json',
      } : undefined,
    });
  };

  // 1. Get all fee profiles (paginated)
  const getAllFeeProfiles = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated()) throw new Error('Authentification requise');
      const api = createApiInstance();
      const response = await api.get<StudentFeeProfileResponse>('/student-fee-profiles');
      return handleResponse<StudentFeeProfileResponse>(response);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // 2. Get specific fee profile by ID
  const getFeeProfileById = useMutation({
    mutationFn: async (profileId: string) => {
      if (!isAuthenticated()) throw new Error('Authentification requise');
      const api = createApiInstance();
      const response = await api.get<StudentFeeProfileResponse>(`/student-fee-profiles/${profileId}`);
      return handleResponse<StudentFeeProfileResponse>(response);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  // 3. Get fee profile for specific student
  const getStudentFeeProfile = useMutation({
    mutationFn: async (studentId: string) => {
      if (!isAuthenticated()) throw new Error('Authentification requise');
      const api = createApiInstance();
      const response = await api.get<StudentFeeProfileResponse>(
        `/student-fee-profiles/students/${studentId}/fee-profile`
      );
      return handleResponse<StudentFeeProfileResponse>(response);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  return {
    getAllFeeProfiles,
    getFeeProfileById,
    getStudentFeeProfile,
  };
};