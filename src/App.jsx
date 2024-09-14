import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Wishlist from "./pages/Wishlist"


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
