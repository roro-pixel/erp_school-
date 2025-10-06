import { User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function UserProfileDropdown2() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-white p-2 rounded hover:bg-gray-100 transition-colors border border-gray-200"
            >
                <User size={20} className="text-gray-600" />
                <span className="text-sm font-medium">Profil</span>
            </button>
            
            {isOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg w-48 z-50">
                    <ul className="py-1">
                        <li>
                            <Link 
                                to="/profile" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setIsOpen(false)}
                            >
                                Mon Profil
                            </Link>
                        </li>
                        <li>
                            <Link
                              to="/dashboard" 
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                              onClick={() => setIsOpen(false)}
                             >
                             Gestion (Financière/Scolaire)
                            </Link>
                        </li>
                        <li className="border-t border-gray-100">
                            <button 
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                                onClick={() => {
                                    // Gérer la déconnexion ici
                                    setIsOpen(false);
                                }}
                            >
                                Déconnexion
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}