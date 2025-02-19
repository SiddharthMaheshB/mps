import Navbar from "./Navbar"
import { Outlet } from "react-router-dom"
import { useState,useRef } from "react";

function Layout(props){
  /*const myStyle = {
    backgroundImage : `url(${Background})`,
    height: "100vh",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  }*/
    const featuresRef = useRef(null);
    const footerRef = useRef(null);
  
    const scrollToFooter = () => {
      footerRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  
    const scrollToFeatures = () => {
      featuresRef.current?.scrollIntoView({ behavior: "smooth" });
    };
  return (
   <div >
    <Navbar login={props.login} scrollToFooter={scrollToFooter} scrollToFeatures={scrollToFeatures}/>
    <Outlet/>
   </div>
  )
}

export default Layout
