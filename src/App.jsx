import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAdminAuth } from "./admin/auth/AdminAuthContext";
import AdminLayout from "./admin/layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireLogin from "./components/RequireLogin";
import NavigationProgress from "./components/NavigationProgress";
import PageLoader from "./components/PageLoader";
import PageTransition from "./layout/PageTransition";
import ScrollToTop from "./layout/ScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Account = lazy(() => import("./pages/account"));
const Faqs = lazy(() => import("./pages/Faqs"));

const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const ProductsPage = lazy(() => import("./admin/pages/ProductsPage"));
const ProductFormPage = lazy(() => import("./admin/pages/ProductFormPage"));
const CategoriesPage = lazy(() => import("./admin/pages/CategoriesPage"));
const OrdersPage = lazy(() => import("./admin/pages/OrdersPage"));
const OrderDetailsPage = lazy(() => import("./admin/pages/OrderDetailsPage"));
const InventoryPage = lazy(() => import("./admin/pages/InventoryPage"));
const CustomersPage = lazy(() => import("./admin/pages/CustomersPage"));
const CustomerDetailsPage = lazy(() => import("./admin/pages/CustomerDetailsPage"));
const ReportsPage = lazy(() => import("./admin/pages/ReportsPage"));
const SettingsPage = lazy(() => import("./admin/pages/SettingsPage"));
const CouponsPage = lazy(() => import("./admin/pages/CouponsPage"));
const ProfilePage = lazy(() => import("./admin/pages/ProfilePage"));
const FaqsPage = lazy(() => import("./admin/pages/FaqsPage"));


function RequireAdmin({ children }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}



export default function App() {
  return (
    <>
      <ScrollToTop />
      <NavigationProgress />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PageTransition />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route
              path="/checkout"
              element={
                <RequireLogin message="Please log in first to continue to checkout.">
                  <Checkout />
                </RequireLogin>
              }
            />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/faqs" element={<Faqs />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route element={<PageTransition />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:id" element={<OrderDetailsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:key" element={<CustomerDetailsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="coupons" element={<CouponsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="faqs" element={<FaqsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </>
  );
}
