import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { UserCircle, Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirection si déjà authentifié
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
      // La redirection est gérée dans onSuccess du hook useAuth
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Carte de connexion avec ombre plus prononcée */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête avec dégradé */}
          <div className="bg-green-400 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Connexion</h1>
          </div>

          {/* Formulaire */}
          <div className="p-8">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Champ Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-emerald-600" />
                    Adresse Email
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email')}
                    className={`
                      w-full px-4 py-3 pl-11 rounded-lg
                      bg-gray-50
                      focus:outline-none focus:bg-white
                      transition-all duration-200
                      ${errors.email 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                      }
                      placeholder:text-gray-400
                    `}
                    placeholder="admin@ecole.com"
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-emerald-600" />
                    Mot de passe
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`
                      w-full px-4 py-3 pl-11 rounded-lg
                      bg-gray-50
                      focus:outline-none focus:bg-white
                      transition-all duration-200
                      ${errors.password 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                      }
                      placeholder:text-gray-400
                    `}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={login.isPending}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold 
                  flex items-center justify-center gap-2
                  transition-all duration-200 transform hover:scale-[1.02]
                  ${login.isPending 
                    ? 'bg-emerald-400 cursor-not-allowed' 
                    : 'bg-green-400 hover:bg-green-500'
                  }
                  text-white shadow-lg hover:shadow-xl
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                `}
              >
                {login.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Se connecter
                  </>
                )}
              </button>

              {/* Lien d'aide */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Besoin d'aide ?{' '}
                  <a 
                    href="mailto:contact@sni-cg.com" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200"
                  >
                    Contactez le support
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;