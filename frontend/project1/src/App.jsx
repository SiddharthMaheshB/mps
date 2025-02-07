import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Layout from "./pages/Layout.jsx"
import Home from "./pages/Home.jsx"
import Nofound from "./pages/Nofound.jsx"

import './App.css'

function App(props) {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Layout />}/>
    <Route index element={<Home />}/>
    <Route path = "*" element = {<Nofound />}/>
    </Routes>
    </BrowserRouter>
    
  )
}

export default App
