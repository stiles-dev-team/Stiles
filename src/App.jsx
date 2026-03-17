import { BrowserRouter, Route, Routes, Navigate, useSearchParams } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Home from "./pages/Home"
import Wishlist from "./pages/Wishlist"
import Shop from "./pages/Shop"
import Product from "./pages/Product"
import ProductCategory from "./pages/ProductCategory"
import ProductSubCategory from "./pages/ProductSubCategory"
import ProductTagCategory from "./pages/ProductTagCategory"
import Fireplaces from "./pages/Fireplaces"
import TermsAndConditions from "./pages/TermsAndConditions"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import ProductDisclaimer from "./pages/ProductDisclaimer"
import ProductBrands from "./pages/ProductBrands"
import ProductPromos from "./pages/ProductPromos"
import Promo from "./pages/Promo"
import Cart from "./pages/Cart"
import ContactUs from "./pages/ContactUs"
import ContactSingle from "./pages/ContactSingle"
import Search from "./pages/Search"
import Checkout from "./pages/Checkout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
// import TileVisualiser from "./pages/TileVisualiser"
import Blogs from "./pages/Blogs"
import CategoryBlogs from "./pages/CategoryBlogs"
import BlogPost from "./pages/BlogPost"
import Profile from "./pages/Profile"
import Orders from "./pages/Orders"
import Admin from "./pages/Admin"
import Test from "./pages/Test"
import UnderConstruction from "./pages/UnderConstruction"
import Error404 from "./pages/error404"
// Component to handle shop redirect
const ShopRedirect = () => {
  return <Navigate to="/product/zoe-slate-gloss-75x200m" replace />;
};

function App() {

  return (
    <AuthProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shop" element={<ShopRedirect />} />
          <Route path="/shopall" element={<Shop />} />
          <Route path="/promos" element={<ProductPromos />} />
          {/* <Route path="/black-november-promo" element={<Promo />} /> */}
          <Route path="/promo" element={<Promo />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/product-category/brands/:slug" element={<ProductBrands />} />
          <Route path="/product-category/:slug" element={<ProductCategory />} />
          <Route path="/product-category/:category/:slug" element={<ProductSubCategory />} />
          <Route path="/product-category/:category/:subcategory/:slug" element={<ProductTagCategory />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/calore-kamado-jan" element={<Fireplaces />} />
          <Route path="/stiles-blog" element={<Blogs />} />
          <Route path="/stiles-blog/category/:slug" element={<CategoryBlogs />} />
          <Route path="/stiles-blog/:slug" element={<BlogPost />} />
          <Route path="/admin/*" element={<Admin />} />

          <Route path="/promo/:promo" element={<Promo />} />

          <Route path="/stiles-terms-and-conditions-of-sale" element={<TermsAndConditions />} />
          <Route path="/privacy-policy-popi-compliance" element={<PrivacyPolicy />} />
          <Route path="/product-disclaimer" element={<ProductDisclaimer />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/contact/:slug" element={<ContactSingle />} />
          {/* <Route path="/" element={<UnderConstruction />} /> */}
          <Route path="/error" element={<Error404 />} />
          <Route path="*" element={<Error404 />} />

          {/* Testing */}
          {/* <Route path="/test" element={<Test />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;