import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetails"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/shop" : "/login"} replace />;
}

function pageLoader() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={pageLoader()}>
    <Routes>
      
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/shop" element={ <ProtectedRoute><Shop /></ProtectedRoute>}/>
      <Route path="/products/:slug" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>}/>
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/shop" replace />} />
    </Routes>
      </Suspense>
  );
}
