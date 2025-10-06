import { Outlet } from 'react-router-dom';
import { Header2 } from './Header2';
import AdminSidebar from './AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header2 />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}