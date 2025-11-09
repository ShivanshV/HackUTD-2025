'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface ModelLoaderProps {
  url: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

export default function ModelLoader({ url, onLoadStart, onLoadEnd }: ModelLoaderProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isFBX = url.toLowerCase().endsWith('.fbx');
  const isGLTF = url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf');

  useEffect(() => {
    if (onLoadStart) onLoadStart();
  }, [url, onLoadStart]);

  let model: any;
  
  try {
    if (isFBX) {
      model = useLoader(FBXLoader, url);
    } else if (isGLTF) {
      const gltf = useLoader(GLTFLoader, url);
      model = gltf.scene;
    }
  } catch (error) {
    console.error('Error loading model:', error);
    if (onLoadEnd) onLoadEnd();
    return null;
  }

  useEffect(() => {
    if (model && onLoadEnd) {
      onLoadEnd();
    }
  }, [model, onLoadEnd]);

  useEffect(() => {
    if (model && groupRef.current) {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model
      model.position.x = -center.x;
      model.position.y = -box.min.y;
      model.position.z = -center.z;

      // Scale to fit (max dimension = 4 units)
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 4 / maxDim;
      groupRef.current.scale.set(scale, scale, scale);

      // Enable shadows
      model.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [model]);

  // Optional: Add gentle rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

