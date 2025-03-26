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
import Profile from './pages/Profile.jsx'
import Shop from './pages/Shop.jsx'
import FCLayout from './pages/FCLayout.jsx'
import Pest from './pages/farmercorner/Pest.jsx'
import Fertiliser from './pages/farmercorner/Fertiliser.jsx'
import Tutorials from './pages/farmercorner/Tutorials.jsx'
import FCIndex from './pages/farmercorner/FCIndex.jsx'
import img from "./frontimages/onlyplant.jpg"
function App(props) {
 const loginb = true;
 const user = {
  name: "John Doe",
  avatar: img, // Replace with an actual image URL
  role: "Farmer", // Can be "Farmer" or any other role
};
  return (
    <BrowserRouter>
    <Routes>
    <Route path="/" element={<Layout login = {loginb} />}>
    <Route index element={<Home login={loginb} />}/>
    
    <Route path = "box" element  = {<Box2/>}/>
    <Route path = "*" element = {<Notfound/>}/>
    <Route path = "social" element = {<FarmScene  login={loginb}/>}/>
    <Route path="profile" element={<Profile login={loginb} user = {user}/>}/>
    <Route path="shop" element={<Shop login={loginb}/>}/>
        <Route path="/farmercorner" element={<FCLayout login={loginb}/>}>
          <Route index element = {<FCIndex login = {loginb}/>}/>
          <Route path="pest-disease-detection" element={<Pest login={loginb}/>}/>
          <Route path="fertilizer-recommendation" element={<Fertiliser login={loginb}/>}/>
          
          <Route path="organic-farming-tutorials" element={<Tutorials login={loginb}/>}/>
        </Route>
    </Route>
    <Route path = "login" element = {<Login login={loginb}/>}/>
    <Route path = "register" element={<Register login={loginb}/>}/>
   
    </Routes>
    </BrowserRouter>
    
  )
}

export default App
