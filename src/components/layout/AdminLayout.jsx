import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    <div className="grid min-h-screen bg-stone-100 text-stone-900 lg:grid-cols-[240px_1fr]">
      <div className="relative">
        <Sidebar />
      </div>
      <main className="px-5 py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
