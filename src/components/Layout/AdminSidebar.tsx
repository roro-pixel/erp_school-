import { UserCheck, Wallet, PieChart, ChevronDown, ChevronUp, ArrowLeftRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import mapleLeafLogo from '../../assets/logo.jpg';

// Définition des types
type SubMenuItem = {
  path: string;
  label: string;
};

type MenuItem = {
  path?: string;
  icon: React.ReactNode;
  label: string;
  submenu?: SubMenuItem[];
};

const AdminSidebar = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  // Liste des sous-éléments désactivés
  const disabledSubItems = [
    'Versements',
    'Rapports',
  ];

  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: <PieChart size={18} className="text-gray-500" />,
      path: '/paiement/dashboardpayments'
    },
    {
      label: 'Gestion des Présences',
      icon: <UserCheck size={18} className="text-gray-500" />,
      submenu: [
        { path: '/paiement/presences', label: 'Suivi des présences' }
      ]
    },
    {
      label: 'Paiements',
      icon: <Wallet size={18} className="text-gray-500" />,
      submenu: [
        { path: '/paiement/paye', label: 'Versements' },
        { path: '/paiement/rapports', label: 'Rapports' }
      ]
    },
    {
      label: 'Mouvement',
      icon: <ArrowLeftRight size={18} className="text-gray-500" />,
      submenu: [
        { path: '/paiement/recettes', label: 'Recettes' },
        { path: '/paiement/depenses', label: 'Dépenses' }
      ]
    },
  ];

  const renderMenuItem = (item: MenuItem) => {
    if (item.submenu) {
      const isActive = item.submenu.some(sub => location.pathname === sub.path);
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleSubmenu(item.label)}
            className={`flex items-center justify-between w-full gap-3 p-3 rounded-lg transition-colors ${
              isActive ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {openSubmenu === item.label ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          {openSubmenu === item.label && (
            <div className="ml-8 mt-1 space-y-1">
              {item.submenu.map((subItem) => {
                const isDisabled = disabledSubItems.includes(subItem.label);
                return (
                  <Link
                    key={subItem.path}
                    to={!isDisabled ? subItem.path : "#"}
                    className={`block px-3 py-2 rounded text-sm ${
                      location.pathname === subItem.path ? "bg-red-50 text-red-600" : "text-gray-700"
                    } ${isDisabled ? "opacity-50 pointer-events-none cursor-not-allowed" : "hover:bg-gray-100"}`}
                  >
                    {subItem.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path || '#'}
        className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
          location.pathname === item.path
            ? 'bg-red-50 text-red-600'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        {item.icon}
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-center items-center">
        <img src={mapleLeafLogo} alt="Logo de l'école" className="h-8 w-auto" />
      </div>

      <nav className="space-y-1 flex-1 mt-4">
        {menuItems.map(renderMenuItem)}
      </nav>
    </div>
  );
};

export default AdminSidebar;