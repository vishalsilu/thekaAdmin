import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearUserinfo } from '../../Redux/slice/userSlice';
import { clearAdminSession } from '../../config/authApi';

const Topbar = ({ variant = "dashboard", searchPlaceholder = "Search analytics..." }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isInventory = variant === "inventory";
  
  // ✅ FIX 1: Only select the exact raw value from the store
  const rawUserInfo = useSelector((state) => state.user.userInfo);
  
  // ✅ FIX 2: Apply the fallback outside of the selector
  const userInfo = rawUserInfo || {};

  const name = userInfo.fullName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || userInfo.email || 'Admin User';
  const role = userInfo.role ? userInfo.role.toString().toUpperCase() : 'ADMIN';
  const initials = (userInfo.firstName || userInfo.email || 'A')[0].toUpperCase();

  const handleProfile = () => {
    navigate('/settings');
  };

  return (
    <header className={`flex items-center gap-4 ${isInventory ? "grid grid-cols-[auto_1fr_auto]" : "justify-between"}`}>
      {isInventory ? <span className="text-xs font-extrabold uppercase tracking-[0.14em]">{userInfo?.role}</span> : null}

      <div className={`flex items-center gap-2 border border-stone-200 bg-white px-3 py-2 ${isInventory ? "mx-auto w-full max-w-[520px]" : "w-full max-w-[450px]"}`}>
        <span className="text-sm text-stone-400" aria-hidden>
          ⌕
        </span>
        <input placeholder={searchPlaceholder} aria-label="Search" className="w-full border-0 bg-transparent text-sm outline-none" />
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate('/orders')} className="inline-flex h-9 w-9 items-center justify-center border border-stone-200 bg-white text-sm" aria-label="Notifications">
          📦
        </button>
         <button type="button" onClick={handleProfile} className="inline-flex h-9 w-9 items-center justify-center border border-stone-200 bg-white text-sm">
          ⚙
          </button>
        <div className="flex items-center gap-3 border-l border-stone-200 pl-3">
          <div className="text-right">
            <strong className="block text-sm">{name}</strong>
            <small className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">{role}</small>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 font-bold text-white">{initials}</div>
          
        </div>
      </div>
    </header>
  );
};

export default Topbar;