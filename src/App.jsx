import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// Assuming you have a thunk to fetch the initial user state


import AdminLayout from "./components/layout/AdminLayout";
import RequireAuth from "./components/layout/RequireAuth";
import AdminSkeleton from "./components/AdminSkeleton"; // Import the skeleton
import Login from './Pages/Login';
import Dashboard from "./Pages/Dashboard";
import Inventory from "./Pages/Inventory";
import ProductEditor from "./Pages/ProductEditor";
import OrdersList from "./Pages/OrdersList";
import CategoriesEditor from "./Pages/CategoriesEditor";
import CollectionsEditor from "./Pages/CollectionsEditor";
import CategoriesList from "./Pages/CategoriesList";
import CollectionsList from "./Pages/CollectionsList";
import SiteDataEditor from "./Pages/SiteDataEditor";
import Settings from "./Pages/Settings";
import OrderDetails from "./Pages/OrderDetails";
import OrderEdit from "./Pages/OrderEdit";
import OrderRefund from "./Pages/OrderRefund";
import RefundSuccess from "./Pages/RefundSuccess";
import OrderInvoice from "./Pages/OrderInvoice";
import OrderEmailPreview from "./Pages/OrderEmailPreview";
import OrderCreate from "./Pages/OrderCreate";
import OrderStatusUpdated from "./Pages/OrderStatusUpdated";
import CustomersList from "./Pages/CustomersList";
import CustomerDetails from "./Pages/CustomerDetails";
import Coupons from "./Pages/Coupons";
import Offers from "./Pages/Offers";
import Subscribers from "./Pages/Subscribers";
import Support from "./Pages/Support";
import Models from "./Pages/Models";
import { getAdminMe } from "./redux/Controller/crudUser";

function App() {
  const dispatch = useDispatch();
  
  // 1. Pull auth state from Redux
  // Adjust these state selectors based on your actual userSlice structure
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth || state.user);
  
  // 2. Local state to track if the initial auth check has completed
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // 3. Fire the initial auth check when the app mounts
  useEffect(() => {
    const initAuth = async () => {
      // Dispatch your thunk to check if the user has a valid session
      await dispatch(getAdminMe());
      // Once the request finishes (success or fail), we stop showing the skeleton
      setInitialCheckDone(true);
    };

    initAuth();
  }, [dispatch]);

  // 4. Show the Skeleton if Redux is actively fetching OR if the initial check isn't done
  if (!initialCheckDone || isLoading) {
    return <AdminSkeleton />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Route (Login) --- */}
        {/* If they go to /login but are already authenticated, send them to Dashboard */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
        />

        {/* --- Protected Admin Routes --- */}
        <Route element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/new" element={<ProductEditor />} />
          <Route path="/models" element={<Models />} />
          <Route path="/inventory/:productId/edit" element={<ProductEditor />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/orders/create" element={<OrderCreate />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/orders/:orderId/edit" element={<OrderEdit />} />
          <Route path="/orders/:orderId/refund" element={<OrderRefund />} />
          <Route path="/orders/:orderId/refund/success" element={<RefundSuccess />} />
          <Route path="/orders/:orderId/invoice" element={<OrderInvoice />} />
          <Route path="/orders/:orderId/email" element={<OrderEmailPreview />} />
          <Route path="/orders/:orderId/status-updated" element={<OrderStatusUpdated />} />
          <Route path="/categories" element={<CategoriesList />} />
          <Route path="/categories/new" element={<CategoriesEditor />} />
          <Route path="/categories/:categoryId/edit" element={<CategoriesEditor />} />
          <Route path="/collections" element={<CollectionsList />} />
          <Route path="/collections/new" element={<CollectionsEditor />} />
          <Route path="/collections/:collectionId/edit" element={<CollectionsEditor />} />
          <Route path="/site-data" element={<SiteDataEditor />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/subscribers" element={<Subscribers />} />
          <Route path="/support" element={<Support />} />
          <Route path="/customers" element={<CustomersList />} />
          <Route path="/customers/:userId" element={<CustomerDetails />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Fallback for unknown protected routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;