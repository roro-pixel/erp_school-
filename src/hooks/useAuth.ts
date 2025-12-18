import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect } from 'react';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;  // Changé de "token" à "accessToken"
  refreshToken: string;
  email?: string;
  role?: string;
}

interface ApiLoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  exp: number;
  email?: string;
  role?: string;
}

const AUTH_KEY = 'auth';
const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Fonction pour valider le format du token
const isValidTokenFormat = (token: string | null): boolean => {
  if (!token) return false;
  // Un token JWT valide a 3 parties séparées par des points
  const parts = token.split('.');
  return parts.length === 3;
};

// Fonction pour vérifier si le token est valide (non expiré)
const isTokenValid = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || !isValidTokenFormat(token)) return false;
  
  try {
    const decodedToken = jwtDecode<JwtPayload>(token);
    // Vérifier si le token est expiré avec une marge de sécurité de 1 minute
    return (decodedToken.exp * 1000) > (Date.now() + 60000);
  } catch (error) {
    console.error('Erreur lors du décodage du token:', error);
    // Si le token est invalide, le nettoyer
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return false;
  }
};

// Intercepteur pour inclure automatiquement le token dans les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && isValidTokenFormat(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs 401 (token expiré ou invalide)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // Tentative de rafraîchissement du token
          const response = await api.post('/sni/api/v1/auth/refresh', {
            refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Stocker les nouveaux tokens
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          
          // Mettre à jour l'en-tête de la requête originale
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          // Rejouer la requête originale
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError);
      }
      
      // Si le rafraîchissement échoue, déconnecter l'utilisateur
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'état depuis localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const authData = localStorage.getItem(AUTH_KEY);
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (authData && token && isValidTokenFormat(token)) {
          const parsedData = JSON.parse(authData);
          // Vérifier que le token correspond à celui stocké
          if (parsedData.accessToken === token) {
            setAuthState(parsedData);
          } else {
            // Tokens incohérents, nettoyer
            localStorage.removeItem(AUTH_KEY);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Mettre à jour l'état et le localStorage
  const setAuthData = (data: LoginResponse | null): void => {
    if (data && data.accessToken && isValidTokenFormat(data.accessToken)) {
      setAuthState(data);
      localStorage.setItem(AUTH_KEY, JSON.stringify(data));
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      }
    } else {
      console.error('Token invalide reçu:', data?.accessToken);
      setAuthState(null);
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log("Tentative de connexion avec:", credentials.email);
      const response = await api.post<ApiLoginResponse>('/sni/api/v1/auth/login', credentials);
      const apiData = response.data;
      
      console.log("Réponse de l'API - accessToken reçu:", apiData.accessToken ? 'OUI' : 'NON');
      console.log("accessToken:", apiData.accessToken?.substring(0, 50) + '...');
      
      if (!apiData.accessToken) {
        throw new Error('Aucun accessToken reçu de l\'API');
      }
      
      if (!isValidTokenFormat(apiData.accessToken)) {
        console.error('AccessToken reçu avec format invalide:', apiData.accessToken);
        throw new Error('AccessToken reçu avec format invalide');
      }
      
      // Créer l'objet authData avec les données supplémentaires si disponibles
      const authData: LoginResponse = {
        accessToken: apiData.accessToken,
        refreshToken: apiData.refreshToken,
        email: credentials.email,
        role: 'admin' // À adapter selon la réponse de votre API
      };
      
      setAuthData(authData);
      return authData;
    },
    onSuccess: (data) => {
      console.log("Connexion réussie, accessToken stocké:", data.accessToken.substring(0, 20) + '...');
      toast.success('Connexion réussie', {
        autoClose: 1500,
        onClose: () => {
          // Redirection après connexion
          navigate('/dashboard', { replace: true });
        }
      });
    },
    onError: (error: any) => {
      console.error("Erreur de connexion détaillée:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message ||
                          'Échec de la connexion : email ou mot de passe incorrect';
      toast.error(errorMessage, { autoClose: 4000 });
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = getToken();
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (token && isValidTokenFormat(token)) {
        try {
          await api.post('/auth/logout', {
            refreshToken
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        }
      }
      setAuthData(null);
      return true;
    },
    onSuccess: () => {
      toast.success('Déconnexion réussie');
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error('Erreur lors de la déconnexion');
    }
  });

  // Fonction pour obtenir le token
  const getToken = (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && isValidTokenFormat(token) ? token : null;
  };
  
  // Fonction pour obtenir les données d'authentification
  const getAuthData = (): LoginResponse | null => {
    try {
      const authData = localStorage.getItem(AUTH_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (authData && token && isValidTokenFormat(token)) {
        const parsedData = JSON.parse(authData);
        // Vérifier la cohérence
        if (parsedData.accessToken === token) {
          return parsedData;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données d\'authentification:', error);
    }
    return null;
  };
  
  // Fonction pour vérifier si l'utilisateur est authentifié
  const isAuthenticated = (): boolean => {
    return isTokenValid();
  };

  // Fonction pour obtenir le rôle de l'utilisateur
  const getUserRole = (): string | null => {
    const authData = getAuthData();
    return authData?.role || null;
  };

  // Fonction pour rafraîchir le token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await api.post<ApiLoginResponse>('/sni/api/v1/auth/refresh', {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      if (accessToken && isValidTokenFormat(accessToken)) {
        // Mettre à jour le token dans localStorage
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        
        // Mettre à jour authState
        const currentAuth = getAuthData();
        if (currentAuth) {
          const updatedAuth = {
            ...currentAuth,
            accessToken,
            refreshToken: newRefreshToken
          };
          localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth));
          setAuthState(updatedAuth);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
    }
    return false;
  };

  return {
    login: loginMutation,
    logout: logoutMutation,
    getToken,
    getAuthData,
    clearAuth: () => setAuthData(null),
    isAuthenticated,
    getUserRole,
    isTokenValid,
    isLoading,
    refreshToken
  };
};

export default api;