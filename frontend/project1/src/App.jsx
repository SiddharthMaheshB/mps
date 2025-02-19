import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Layout from "./pages/Layout.jsx"
import Home from "./pages/Home.jsx"
import Login from './pages/login.jsx'
import Box2 from './pages/Box2.jsx'
import Notfound from './pages/Notfound.jsx'
import "./pages/styles.css"
function App(props) {
 const loginb = false;
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Layout login = {loginb} />}>
    <Route index element={<Home login={loginb} />}/>
    <Route path = "login" element = {<Login/>}/>
    <Route path = "box" element  = {<Box2/>}/>
    <Route path = "*" element = {<Notfound/>}/>
    </Route>
    
    </Routes>
    </BrowserRouter>
    
  )
}

export default App
