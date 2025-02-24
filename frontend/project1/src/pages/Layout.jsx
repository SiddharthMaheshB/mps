import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import { useRef } from "react"
function Layout(props){
  /*const myStyle = {
    backgroundImage : `url(${Background})`,
    height: "100vh",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  }*/
   
  const featuresRef = useRef();
  const footerRef = useRef();
    
  return (
   <div >
    <Navbar login={props.login} ToFooter={footerRef} ToFeatures={featuresRef}/>
    <Outlet context={{featuresRef,footerRef}}/>
   </div>
  )
}

export default Layout
