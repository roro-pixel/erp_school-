// import { Link } from 'react-router-dom';
// import {UserProfileDropdown} from './UserProfileDropDwon'
// import { Settings } from 'lucide-react';

// export const Header = () => {
//   return (
//     <header className="bg-red-600 p-4 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
//         <h1 className="text-xl text-white font-bold">Complexe Scolaire Allegra</h1>
        
//         <div className="flex items-center gap-4">
//           <Link
//             to="/settings"
//             className="flex items-center text-white hover:text-gray-200"
//             title="Paramètres"
//           >
//             <Settings />
//           </Link>

//           <UserProfileDropdown />
//         </div>
//       </div>
//     </header>
//   );
// };
// export default Header;
import { Link } from 'react-router-dom';
import { UserProfileDropdown } from './UserProfileDropDwon';
import { Settings } from 'lucide-react';

export const Header = () => {
  const disableSettings = true;

  return (
    // <header className="bg-schoolOrange shadow-md">
    <header className="bg-green-400 shadow-md">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl text-white font-bold tracking-tight">C.S Allegra management</h1>
          <span className="bg-white text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">DEMO</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            to={disableSettings ? "#" : "/settings"}
            className={`flex items-center text-white hover:text-gray-200 transition-colors ${
              disableSettings ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={disableSettings ? "Non disponible" : "Paramètres"}
          >
            <Settings className="w-5 h-5" />
          </Link>

          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};