import { BrowserRouter, Route, Routes } from "react-router-dom"
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
import Cart from "./pages/Cart"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/promos" element={<ProductPromos />} />
        <Route path="/product-category/brands/:slug" element={<ProductBrands />} />
        <Route path="/product-category/:slug" element={<ProductCategory />} />
        <Route path="/product-category/:category/:slug" element={<ProductSubCategory />} />
        <Route path="/product-category/:category/:subcategory/:slug" element={<ProductTagCategory />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/calore-kamado-jan" element={<Fireplaces />} />
        <Route path="/stiles-terms-and-conditions-of-sale" element={<TermsAndConditions />} />
        <Route path="/privacy-policy-popi-compliance" element={<PrivacyPolicy />} />
        <Route path="/product-disclaimer" element={<ProductDisclaimer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
