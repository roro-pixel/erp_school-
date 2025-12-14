import { Link, useLocation } from 'react-router-dom';
import Logo from '../../assets/minimes-logo.jpg';
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Users,
  School,
  Layers,
  Book,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Pencil,
  CalculatorIcon,
  FolderArchive,
  InfoIcon,
  GraduationCap
} from 'lucide-react';
import { useState } from 'react';

type MenuItem = {
  path?: string;
  icon: React.ReactNode;
  label: string;
  submenu?: SubMenuItem[];
  disabled?: boolean;
};

type SubMenuItem = {
  path: string;
  label: string;
  disabled?: boolean;
};

type MenuSection = {
  title: string | null;
  items: MenuItem[];
};

const Sidebar = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Liste des éléments désactivés
  const disabledLabels = [
    "Matières", 
    "Notes", 
    "Bulletins", 
    "Emplois", 
    "Documents", 
    "Discipline", 
    "Emplois du temps" 
  ];

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  // Structure des menus avec sections
  const menuSections: MenuSection[] = [
    {
      title: null,
      items: [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tableau de Bord' }
      ]
    },
    {
      title: 'Gestion Financière',
      items: [
        { 
          label: 'Paiements',
          icon: <DollarSign size={20} />,
          submenu: [
            { path: '/payments', label: 'Mensuels / annuels' },
            { path: '/registration', label: 'Inscription' },
            { path: '/re-registration', label: 'Réinscription', disabled: true },
            { path: '/frais-annexes', label: 'Frais Annexes' }
          ]
        },
        { path: '/invoices', icon: <FileText size={20} />, label: 'Factures' },
        { path: '/fees', icon: <CalculatorIcon size={20} />, label: 'Gestion des Frais' },
        { path: '/rapports-financiers', icon: <BarChart2 size={20} />, label: 'Rapports financiers' }
      ]
    },
    {
      title: 'Gestion Scolaire',
      items: [
        { path: '/students', icon: <Users size={20} />, label: 'Élèves' },
        { path: '/levels', icon: <Layers size={20} />, label: 'Niveaux' },
        { path: '/classes', icon: <School size={20} />, label: 'Classes' },
        { path: '/infoFP', icon: <InfoIcon size={20} />, label: 'Informations Familles/Parents' },
        { path: '/enseignants', icon: <Users size={20} />, label: 'Enseignants'},
        { path: '/matieres', icon: <Book size={20} />, label: 'Matières', disabled: true },
        { path: '/notes', icon: <Pencil size={20} />, label: 'Notes', disabled: true },
        { path: '/bulletins', icon: <FileText size={20} />, label: 'Bulletins', disabled: true },
        { path: '/emplois', icon: <Book size={20} />, label: 'Emplois du temps', disabled: true },
        { path: '/documents', icon: <FolderArchive size={20} />, label: 'Documents', disabled: true }
      ]
    },
    {
      title: 'Gestion Pédagogique',
      items: [
        { 
          label: 'Discipline',
          icon: <GraduationCap size={20} />,
          disabled: true,
          submenu: [
            { path: '/discipline-abscences', label: 'Gestion des abscences', disabled: true },
            { path: '/discipline-esclusions', label: 'Gestion des exclusions', disabled: true }
          ]
        }
      ]
    }
  ];

  const renderMenuItem = (item: MenuItem) => {
    const isDisabled = item.disabled || disabledLabels.includes(item.label);

    if (item.submenu) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => !isDisabled && toggleSubmenu(item.label)}
            className={`flex items-center justify-between w-full gap-3 p-3 rounded-lg transition-colors ${
              item.submenu.some((sub) => location.pathname === sub.path)
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-gray-100 text-gray-700'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {!isDisabled && (openSubmenu === item.label ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
          </button>

          {openSubmenu === item.label && (
            <div className="ml-8 mt-1 space-y-1">
              {item.submenu.map((subItem) => {
                const isSubDisabled = subItem.disabled || disabledLabels.includes(item.label);
                return (
                  <Link
                    key={subItem.path}
                    to={!isSubDisabled ? subItem.path : "#"}
                    className={`block px-3 py-2 rounded text-sm ${
                      location.pathname === subItem.path 
                        ? "bg-green-50 text-green-600" 
                        : "text-gray-700"
                    } ${
                      isSubDisabled 
                        ? "opacity-50 pointer-events-none cursor-not-allowed" 
                        : "hover:bg-gray-100"
                    }`}
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
        to={!isDisabled ? item.path ?? "#" : "#"}
        className={`flex items-center gap-3 p-3 rounded-lg mb-1 transition-colors ${
          location.pathname === item.path 
            ? "bg-green-100 text-green-600" 
            : "hover:bg-gray-100 text-gray-700"
        } ${
          isDisabled 
            ? "opacity-50 pointer-events-none cursor-not-allowed" 
            : ""
        }`}
      >
        <span className="text-gray-500">{item.icon}</span>
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="relative">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-col h-screen w-64 bg-white text-gray-800 border-r">
        <div className="p-2 border-b flex justify-center items-center">
          {/* <img src={Logo} alt="Logo du school" className="h-14 w-auto" /> */}
          <h3 className="font-bold text-green-400 p-5">Complexe Scolaire Allegra</h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-4">
            {menuSections.map((section, index) => (
              <div key={index}>
                {section.title && (
                  <h3 className="px-2 py-3 text-xs font-semibold text-gray-500 uppercase">
                    {section.title}
                  </h3>
                )}
                {section.items.map(renderMenuItem)}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;