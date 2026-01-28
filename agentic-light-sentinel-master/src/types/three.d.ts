// Three.js type extensions for React Three Fiber
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

// Extend JSX elements with Three.js objects
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any
      mesh: any
      sphereGeometry: any
      meshStandardMaterial: any
      ambientLight: any
      pointLight: any
      directionalLight: any
    }
  }
}

// Extend React Three Fiber with Three.js objects
extend(THREE)

export {}