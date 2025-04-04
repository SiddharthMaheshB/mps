import "./fc.css"
import { Outlet,Link,useLocation } from "react-router-dom"

export default function FCLayout({login}){
    const location = useLocation();
    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }
    const tabs = [
        {path:"/farmercorner/pest-disease-detection" ,label:"Disease-Detection"},
        {path:"/farmercorner/fertilizer-recommendation"  ,label:"Fertiliser-Recommendation"},
        {path:"/farmercorner/organic-farming-tutorials"  ,label:"Tutorials"},
        {path:"/farmercorner/crop-recommendation", label:"Crop-Recommendation"},
        
        
        
    ]
    return(
        <>
        <div className="link-container">
           {tabs.map((tab,index)=>(
                <Link key={index} to={tab.path} className={`links ${location.pathname.includes(tab.path)?"active":""}`}>{tab.label}</Link>
           ))}
        </div>
        <Outlet/>
        </>
    )
}