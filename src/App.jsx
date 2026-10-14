
import { Navigate, Route, Routes } from "react-router-dom";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetails";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
    </Routes>
  );
}
