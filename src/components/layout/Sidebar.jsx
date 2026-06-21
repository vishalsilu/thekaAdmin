import { NavLink, useNavigate } from "react-router-dom";
import { sidebarNav } from "../../data/navigation";
import { clearAdminSession } from "../../config/authApi";
import { useDispatch } from "react-redux";
import { clearUserinfo } from "../../redux/slice/userSlice";

const Sidebar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 border border-stone-200 px-3 py-3 text-xs font-bold uppercase tracking-[0.08em] ${
      isActive ? "border-l-4 border-l-black bg-stone-200" : "bg-white hover:bg-stone-50"
    }`;


     const handleLogout = () => {
    clearAdminSession();
    dispatch(clearUserinfo());
    navigate('/login', { replace: true });
  };
  return (
    <aside className="flex flex-col border-r border-stone-200 max-h-screen sticky top-1 bg-stone-50 p-4">
      <div className="flex items-center gap-3">
          <h1 className="m-0 text-sm my-3 font-bold uppercase tracking-loose">Manage Store</h1>
      </div>

      <nav className="mt-7 grid gap-2">
        {sidebarNav.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.to === "/"}
            className={navClass}
          >
            <span className="w-5 text-center opacity-70">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto grid gap-2">
        <button type="button" onClick={() => navigate('/support')} className="flex cursor-pointer items-center gap-3 border border-stone-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-[0.08em] hover:bg-stone-50">
          <span className="w-5 text-center opacity-70">◔</span>
          <span>Support</span>
        </button>
        <button type="button" onClick={handleLogout} className="flex cursor-pointer items-center gap-3 border border-stone-200 bg-white px-3 py-3 text-xs font-bold uppercase tracking-[0.08em] hover:bg-stone-50">
          <span className="w-5 text-center opacity-70">↩</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
