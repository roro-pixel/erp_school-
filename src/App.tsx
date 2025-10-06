import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MainLayout } from './components/Layout/MainLayout';
import { AdminLayout } from './components/Layout/AdminLayout';

// Dashboard principal 
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

// Module de gestion financière
const Payments = React.lazy(() => import('./pages/gestion_financiere/paiements/Payments'));
const Invoices = React.lazy(() => import('./pages/gestion_financiere/Invoices'));
const Fees = React.lazy(() => import('./pages/gestion_financiere/Fees'));
const RapportsFinanciers = React.lazy(() => import('./pages/gestion_financiere/RapportsFinanciers'));
const Reinscription = React.lazy(() => import('./pages/gestion_financiere/paiements/re-registration'));
const Inscription = React.lazy(() => import('./pages/gestion_financiere/paiements/Registration'));
const AnnexFees = React.lazy(() => import('./pages/gestion_financiere/paiements/FraisAnnexes'));

// Module de gestion scolaire
const Students = React.lazy(() => import('./pages/gestion_scolaire/Students'));
const FamilyDashboard = React.lazy(() => import('./pages/gestion_scolaire/InfoFamilleParent'));
const Classes = React.lazy(() => import('./pages/gestion_scolaire/Classes'));
const Levels = React.lazy(() => import('./pages/gestion_scolaire/Levels'));
const Notes = React.lazy(() => import('./pages/gestion_scolaire/Notes'));
const Bulletins = React.lazy(() => import('./pages/gestion_scolaire/Bulletin'));
const Documents = React.lazy(() => import('./pages/gestion_scolaire/Documents'));
const EmploisDuTemps = React.lazy(() => import('./pages/gestion_scolaire/Emplois'));
const Enseignants = React.lazy(() => import('./pages/gestion_scolaire/Enseignants'));
const SubjectsPage = React.lazy(() => import('./pages/gestion_scolaire/Matieres'));

// Module de gestion paiement et comptabilité
const DashboardPayment = React.lazy(() => import('./pages/gestion_paiementEtCompta/DashboardPayment'));
const TeacherAttendance = React.lazy(() => import('./pages/gestion_paiementEtCompta/TeacherAttendance'));
const TeacherPayments = React.lazy(() => import('./pages/gestion_paiementEtCompta/TeacherPayments'));
const RapportPaiements = React.lazy(() => import('./pages/gestion_paiementEtCompta/RapportPaiments'));
const Recettes = React.lazy(() => import('./pages/gestion_paiementEtCompta/Recettes'));
const Depenses = React.lazy(() => import('./pages/gestion_paiementEtCompta/Depenses'));

// Module pédagogique
const GestionAbscences = React.lazy(() => import('./pages/gestions_pedagogique/GestionAbscences'));
const GestionExclusions = React.lazy(() => import('./pages/gestions_pedagogique/GestionExclusions'));

// Module d'administration
const Settings = React.lazy(() => import('./pages/administration/Settings'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));

// Page 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-screen text-center">
    <h1 className="text-6xl font-bold text-gray-600 mb-4">404</h1>
    <p className="text-xl text-gray-500 mb-8">Page non trouvée</p>
    <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
      Retour à l'accueil
    </a>
  </div>
);

// Composant de chargement réutilisable
const LoadingComponent = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-2">Chargement...</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
      <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Suspense fallback={<LoadingComponent />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="payments" element={<Payments />} />
              <Route path="fees" element={<Fees />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="registration" element={<Inscription />} />
              <Route path="re-registration" element={<Reinscription />} />
              <Route path="frais-annexes" element={<AnnexFees />} />
              <Route path="rapports-financiers" element={<RapportsFinanciers />} />
              <Route path="students" element={<Students />} />
              <Route path="enseignants" element={<Enseignants />} />
              <Route path="infoFP" element={<FamilyDashboard />} />
              <Route path="classes" element={<Classes />} />
              <Route path="levels" element={<Levels />} />
              <Route path="notes" element={<Notes />} />
              <Route path="matieres" element={<SubjectsPage />} />
              <Route path="bulletins" element={<Bulletins />} />
              <Route path="emplois" element={<EmploisDuTemps />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="documents" element={<Documents />} />
              <Route path="discipline-abscences" element={<GestionAbscences />} />
              <Route path="discipline-esclusions" element={<GestionExclusions />} />
            </Route>

            <Route path="/paiement" element={<AdminLayout />}>
              <Route index element={<DashboardPayment />} />
              <Route path="dashboardpayments" element={<DashboardPayment />} />
              <Route path="presences" element={<TeacherAttendance />} />
              <Route path="paye" element={<TeacherPayments />} />
              <Route path="rapports" element={<RapportPaiements />} />
              <Route path="recettes" element={<Recettes />} />
              <Route path="depenses" element={<Depenses />} />
            </Route>

            {/* Route catch-all pour les 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;