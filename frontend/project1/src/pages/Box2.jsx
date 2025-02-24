import Box from './Box'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import './styles.css'
import {OrbitControls, useGLTF, useAnimations} from "@react-three/drei";
function Model(){
  const {scene,animations} = useGLTF("models/scene.gltf")
  const {actions,names} = useAnimations(animations,scene)
   console.log(names)
  useFrame(()=>{
    if(actions["Walk"])actions["Walk"].play()
  })
  return <primitive position={[0,0,0]}object={scene} scale={5}/>
}

function Model2(){
  const {scene,animations} = useGLTF("models/eve.glb")
  const {actions,names} = useAnimations(animations,scene)
   console.log(names)
   names.forEach((name)=>{
    useFrame(()=>{actions[name].play()})
   })
  
  return <primitive position={[0,0,0]}object={scene} scale={5}/>
}
const myStyle = {
  margin:"25%",
  backgroundColor: "blue",
  height:"75vh",
  padding:"5%",
}
export default function Box2(){
    return (
      <div style = {myStyle}>
    <Canvas>
    <ambientLight intensity={Math.PI / 2} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
    <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
    
    <Model/>
    <OrbitControls/>
  </Canvas>
    </div>
    )
}