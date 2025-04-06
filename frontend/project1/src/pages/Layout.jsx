import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import { useRef } from "react"

function Layout({ login, user, setLogin, setUser }) {
  /*const myStyle = {
    backgroundImage : `url(${Background})`,
    height: "100vh",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  }*/
   
  const featuresRef = useRef();
  const footerRef = useRef();
    
  return (
   <div>
    <Navbar 
      login={login} 
      user={user} 
      setLogin={setLogin} 
      setUser={setUser} 
      ToFooter={footerRef} 
      ToFeatures={featuresRef}
    />
    <Outlet context={{ featuresRef, footerRef, login, user }}/>
   </div>
  )
}

export default Layout
