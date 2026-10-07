import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login_pge from '../pages/Login_pge'
import Form_pge from '../pages/Form_pge'
import Gallery_pge from '../pages/Gallery_pge'
const Routers = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login_pge />} />
          <Route path="/forms" element={<Form_pge />} />
          <Route path="/gallery" element={<Gallery_pge />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default Routers
