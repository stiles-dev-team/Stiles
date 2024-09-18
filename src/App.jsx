import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Wishlist from "./pages/Wishlist"
import Shop from "./pages/Shop"
import Product from "./pages/Product"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product" element={<Product />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
