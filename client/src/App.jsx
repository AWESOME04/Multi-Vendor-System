import HomeView from "./views/HomeView";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "@/components/NavBar/NavBar";
import ShopFooter from "@/components/Footer/ShopFooter";
import ErrorView from "./views/ErrorView";
import CartView from "./views/CartView";
import OrdersView from "./views/OrdersView";
import ProfileView from "./views/ProfileView";
import SellerProducts from "@/components/Seller/SellerProducts";
import "react-loading-skeleton/dist/skeleton.css";
import { GlobalContextProvider } from "@/components/GlobalContext/GlobalContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <GlobalContextProvider>
        <BrowserRouter>
          <div>
            <header>
              <NavBar />
            </header>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/cart" element={<CartView />} />
              <Route path="/orders" element={<OrdersView />} />
              <Route path="/profile" element={<ProfileView />} />
              <Route path="/seller/products" element={<SellerProducts />} />
              <Route path="*" element={<ErrorView />} />
            </Routes>
            <footer>
              <ShopFooter />
            </footer>
          </div>
        </BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
      </GlobalContextProvider>
    </AuthProvider>
  );
}

export default App;
