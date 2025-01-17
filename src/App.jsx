import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Wishlist from "./pages/Wishlist"
import Shop from "./pages/Shop"
import Product from "./pages/Product"
import ProductCategory from "./pages/ProductCategory"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product-category/:slug" element={<ProductCategory />} />
        <Route path="/product/:id" element={<Product />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
