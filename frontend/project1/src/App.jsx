import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Layout from "./pages/Layout.jsx"
import Home from "./pages/Home.jsx"
import Login from './pages/login.jsx'
import Register from './pages/Register.jsx'
import Box2 from './pages/Box2.jsx'
import Notfound from './pages/Notfound.jsx'
import "./pages/styles.css"
import FarmScene from './pages/Social.jsx'
function App(props) {
 const loginb = true;
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Layout login = {loginb} />}>
    <Route index element={<Home login={loginb} />}/>
    
    <Route path = "box" element  = {<Box2/>}/>
    <Route path = "*" element = {<Notfound/>}/>
    <Route path = "social" element = {<FarmScene/>}/>
    </Route>
    <Route path = "login" element = {<Login/>}/>
    <Route path = "register" element={<Register/>}/>
    </Routes>
    </BrowserRouter>
    
  )
}

export default App
