import AdminSidebar from '@/components/admin/AdminSidebar';
import ToastContainer from '@/components/admin/Toast';

export const metadata = {
  title: 'Admin - Praxia Insights',
  description: 'Praxia Insights Admin Dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
