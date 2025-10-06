import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import Slider from './Sidebar';

export function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Slider />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 bg-white">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}