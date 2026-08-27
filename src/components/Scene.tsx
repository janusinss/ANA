'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree, extend, ReactThreeFiber } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PaintBrush = ({ activeProfileIndex, profileColors, blobPositions }: { activeProfileIndex: React.MutableRefObject<number>, profileColors: string[], blobPositions: number[][] }) => {
  const brushGroupRef = useRef<THREE.Group>(null)
  const brushTipRef = useRef<THREE.Mesh>(null)

  // We set the pivot point of the brush on the right side of the palette
  const pivotX = 0.5
  const pivotY = 0.0

  // Pre-allocate objects to prevent GC pressure in the render loop
  const _targetColor = useMemo(() => new THREE.Color(), [])
  const _idleColor = useMemo(() => new THREE.Color('#d1d1d1'), [])
  const _blackColor = useMemo(() => new THREE.Color(0x000000), [])

  useFrame((state, delta) => {
    if (!brushTipRef.current || !brushGroupRef.current) return
    const material = brushTipRef.current.material as THREE.MeshPhysicalMaterial
    const activeIdx = activeProfileIndex.current
    
    let targetRotZ = 2.5 // Idle angle (pointing between blobs 3 and 4)
    let targetScale = 0.6 // Idle scale
    let targetPosX = 0.7 // Idle Pos X (pulled back slightly)
    let targetPosY = 0.8 // Idle Pos Y (pulled back slightly)

    if (activeIdx >= 0 && activeIdx < profileColors.length) {
      // Profile section: Color matches and glows
      _targetColor.set(profileColors[activeIdx])
      material.color.lerp(_targetColor, 8 * delta)
      material.emissive.lerp(_targetColor, 8 * delta)
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 1.5, 8 * delta)

      // Calculate the angle to the active paint blob (Clock hand math)
      const blobX = blobPositions[activeIdx][0]
      const blobY = blobPositions[activeIdx][1]
      // angle = atan2(dy, dx). Since brush points UP (Y+) at rot 0, we subtract PI/2
      targetRotZ = Math.atan2(blobY - pivotY, blobX - pivotX) - Math.PI / 2
      
      // Dynamically scale the brush so the tip perfectly lands on the blob
      const dist = Math.sqrt(Math.pow(blobX - pivotX, 2) + Math.pow(blobY - pivotY, 2))
      targetScale = dist / 4.15 // 4.15 is the local Y position of the tip
      
      // Move to the Clock Pivot Position
      targetPosX = pivotX
      targetPosY = pivotY
    } else {
      // Hero/Manifesto section: Idle state (Clean/Dry)
      material.color.lerp(_idleColor, 8 * delta)
      material.emissive.lerp(_blackColor, 8 * delta)
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 8 * delta)
    }

    // Smoothly animate Position, Rotation, and Scale
    brushGroupRef.current.position.x = THREE.MathUtils.lerp(brushGroupRef.current.position.x, targetPosX, 5 * delta)
    brushGroupRef.current.position.y = THREE.MathUtils.lerp(brushGroupRef.current.position.y, targetPosY, 5 * delta)
    
    brushGroupRef.current.rotation.z = THREE.MathUtils.lerp(brushGroupRef.current.rotation.z, targetRotZ, 5 * delta)
    
    const currentScale = brushGroupRef.current.scale.x
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 5 * delta)
    brushGroupRef.current.scale.set(newScale, newScale, newScale)
  })

  return (
    <group ref={brushGroupRef} position={[pivotX, pivotY, 0.4]} scale={0.6}>
      {/* Wooden Handle (Red, tapered at bottom) */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.1, 3, 16]} />
        <meshStandardMaterial color="#c62828" roughness={0.4} metalness={0.1} />
      </mesh>
      
      {/* Metal Ferrule (Shiny Silver) */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.4, 16]} />
        <meshStandardMaterial color="#d3d3d3" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Bristles Base Ring (Dark Gray) */}
      <mesh position={[0, 3.45, 0]} castShadow>
        <cylinderGeometry args={[0.20, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
      </mesh>
      
      {/* Bristles (Brown Tapered Cone) */}
      <mesh position={[0, 3.85, 0]} castShadow>
        <coneGeometry args={[0.20, 0.7, 16]} />
        <meshStandardMaterial color="#5c3a21" roughness={0.9} />
      </mesh>
      
      {/* Wet Paint Tip (The glowing part) */}
      <mesh ref={brushTipRef} position={[0, 4.15, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshPhysicalMaterial 
          color="#d1d1d1"
          emissive="#000000"
          emissiveIntensity={0}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
        />
      </mesh>
    </group>
  )
}

const ArtistPalette = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
  const groupRef = useRef<THREE.Group>(null)
  const { viewport } = useThree()
  
  const targetX = useRef(1)
  const currentX = useRef(0)
  const activeProfileIndex = useRef(-1)
  
  // Paint blobs references
  const blobRefs = useRef<(THREE.Mesh | null)[]>([])

  const profileColors = [
    '#4a6b63', // Janus
    '#c15c5a', // Diana
    '#bc4b2e', // Ace
    '#1d3557', // Paolo
    '#b87d10', // Wynry
    '#357a5b', // Carlos
  ]

  // Create the Kidney/Palette Shape
  const paletteShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 2)
    s.bezierCurveTo(2.5, 2.5, 3.5, 1, 3, -1)
    s.bezierCurveTo(2.5, -3, 0.5, -3.5, -1, -2.5)
    s.bezierCurveTo(-2, -1.5, -3, -1, -2.5, 1)
    s.bezierCurveTo(-2, 2.5, -1, 1.5, 0, 2)

    // Thumb hole
    const hole = new THREE.Path()
    hole.absarc(1.8, -1.2, 0.4, 0, Math.PI * 2, false)
    s.holes.push(hole)

    return s
  }, [])

  // Position for the 6 paint blobs arranged in an arc along the top/left edge
  const blobPositions = [
    [-1.2, 1.5, 0.15],
    [-2.2, 0.8, 0.15],
    [-2.4, -0.2, 0.15],
    [-1.6, -1.2, 0.15],
    [-0.5, -1.8, 0.15],
    [0.8, -2.2, 0.15],
  ]

  useEffect(() => {
    const updateState = (val: number, el: HTMLElement | null) => {
      targetX.current = val
      if (el && el.dataset.profileIdx !== undefined) {
        activeProfileIndex.current = parseInt(el.dataset.profileIdx, 10)
      } else {
        activeProfileIndex.current = -1
      }
    }

    const hero = document.getElementById('hero')
    ScrollTrigger.create({
      trigger: hero,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateState(1, hero),
      onEnterBack: () => updateState(1, hero),
    })

    const manifesto = document.getElementById('manifesto')
    ScrollTrigger.create({
      trigger: manifesto,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => updateState(-1, manifesto),
      onEnterBack: () => updateState(-1, manifesto),
    })

    const sections = document.querySelectorAll('.profile-section')
    sections.forEach((section, idx) => {
      const val = idx % 2 === 0 ? 1 : -1
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => updateState(val, section as HTMLElement),
        onEnterBack: () => updateState(val, section as HTMLElement),
      })
    })
  }, [])

  // Pre-allocate to avoid GC pressure
  const _targetScaleVec = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    // Smoothly animate the X position based on active section
    const offset = viewport.width > 6 ? viewport.width / 3.5 : 0
    const finalTargetX = targetX.current * offset
    currentX.current = THREE.MathUtils.lerp(currentX.current, finalTargetX, 5 * delta)

    if (groupRef.current) {
      groupRef.current.position.x = currentX.current
      // Gentle floating animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.4) * 0.1 - 0.2
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1) * 0.2
    }

    // Animate Paint Blobs
    blobRefs.current.forEach((blob, idx) => {
      if (!blob) return
      const material = blob.material as THREE.MeshPhysicalMaterial
      const isActive = activeProfileIndex.current === idx

      // Lerp Scale (Swells up if active)
      const targetScale = isActive ? 1.5 : 1.0
      _targetScaleVec.set(targetScale, targetScale, targetScale)
      blob.scale.lerp(_targetScaleVec, 8 * delta)

      // Lerp Emissive intensity (Glows if active)
      const targetEmissive = isActive ? 1.0 : 0.0
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissive, 8 * delta)
    })
  })

  return (
    <Float 
      speed={prefersReducedMotion ? 0 : 2} 
      rotationIntensity={prefersReducedMotion ? 0 : 1} 
      floatIntensity={prefersReducedMotion ? 0 : 1}
    >
      <group ref={groupRef} scale={0.8} position={[0, -0.5, 0]}>
        {/* The Wooden/Clay Palette Board */}
        <mesh castShadow receiveShadow position={[0, 0, -0.1]}>
          <extrudeGeometry args={[paletteShape, { depth: 0.2, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 }]} />
          <meshStandardMaterial color="#e6ccb8" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* The Paint Blobs */}
        {profileColors.map((color, idx) => (
          <mesh 
            key={color} 
            ref={(el) => { blobRefs.current[idx] = el }}
            position={new THREE.Vector3(...blobPositions[idx])}
            castShadow
          >
            {/* Flattened sphere to look like a thick paint blob */}
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshPhysicalMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0}
              roughness={0.2} 
              metalness={0.3} 
              clearcoat={1}
            />
          </mesh>
        ))}
        
        {/* The 3D Paintbrush */}
        <PaintBrush activeProfileIndex={activeProfileIndex} profileColors={profileColors} blobPositions={blobPositions} />
      </group>
    </Float>
  )
}

const Particles = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
  const count = 300
  const positions = new Float32Array(count * 3)
  
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20
  }

  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && !prefersReducedMotion) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="#4a4a4a" transparent opacity={0.3} />
      </points>
    </group>
  )
}

// ──────────── ⚡ OVERDRIVE: Liquid Background ─────────────
const LiquidBackground = ({ prefersReducedMotion }: { prefersReducedMotion: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport } = useThree()
  const mouseRef = useRef({ x: 0, y: 0 })
  const prevIndexRef = useRef(-2)

  // Profile colors matching the palette blobs
  const profileColors = [
    new THREE.Color('#4a6b63'),
    new THREE.Color('#c15c5a'),
    new THREE.Color('#bc4b2e'),
    new THREE.Color('#1d3557'),
    new THREE.Color('#b87d10'),
    new THREE.Color('#357a5b'),
  ]
  const idleColor = new THREE.Color('#fff5f5')

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#fff5f5') },
    uTargetColor: { value: new THREE.Color('#fff5f5') },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uPulse: { value: 0.0 },
    uPulseCenter: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) },
  }), [])

  // Track mouse
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const _mouseVec = useMemo(() => new THREE.Vector2(), [])

  useFrame((state, delta) => {
    if (!materialRef.current) return
    const mat = materialRef.current

    if (!prefersReducedMotion) {
      mat.uniforms.uTime.value += delta * 0.4
    }
    
    _mouseVec.set(mouseRef.current.x, mouseRef.current.y)
    mat.uniforms.uMouse.value.lerp(
      _mouseVec,
      prefersReducedMotion ? 1 : 4 * delta
    )
    mat.uniforms.uResolution.value.set(viewport.width, viewport.height)

    // Always use the idle warm-white color
    mat.uniforms.uColor.value.copy(idleColor)

    // Decay the pulse
    mat.uniforms.uPulse.value = THREE.MathUtils.lerp(mat.uniforms.uPulse.value, 0, 2 * delta)
  })

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = `
    precision highp float;
    
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec2 uMouse;
    uniform float uPulse;
    uniform vec2 uPulseCenter;
    uniform vec2 uResolution;
    
    varying vec2 vUv;
    
    // Simplex-style noise helpers
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    // Fractal Brownian Motion
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Domain warping: use noise to distort the UV coordinates themselves
      float t = uTime;
      vec2 q = vec2(fbm(uv + t * 0.3), fbm(uv + vec2(1.7, 9.2) + t * 0.2));
      vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + t * 0.15),
                     fbm(uv + 4.0 * q + vec2(8.3, 2.8) + t * 0.126));
      
      float f = fbm(uv + 4.0 * r);
      
      // Mouse interaction: create a swirl displacement near the cursor
      vec2 mouseUV = uMouse;
      float mouseDist = distance(uv, mouseUV);
      float mouseInfluence = smoothstep(0.35, 0.0, mouseDist);
      f += mouseInfluence * 0.3 * sin(t * 2.0 + mouseDist * 20.0);
      
      // Pulse explosion from the paint blob
      float pulseDist = distance(uv, uPulseCenter);
      float pulseWave = sin(pulseDist * 15.0 - uPulse * 8.0) * uPulse;
      f += pulseWave * 0.4;
      
      // Color mixing: blend between the base (warm white) and the profile color
      vec3 baseColor = vec3(1.0, 0.96, 0.96); // #fff5f5
      float colorMix = clamp(f * 0.5 + 0.5, 0.0, 1.0);
      
      // Soft milky pigment layers
      vec3 pigment1 = uColor * 0.9;
      vec3 pigment2 = mix(uColor, vec3(1.0), 0.6);
      
      vec3 finalColor = mix(baseColor, pigment1, colorMix * 0.35);
      finalColor = mix(finalColor, pigment2, (1.0 - colorMix) * 0.15);
      
      // Add mouse glow
      finalColor += mouseInfluence * 0.08 * uColor;
      
      // Add pulse brightness
      finalColor += pulseWave * 0.15 * uColor;
      
      // Subtle grain for the matte canvas texture
      float grain = snoise(uv * 300.0 + t) * 0.015;
      finalColor += grain;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `

  return (
    <mesh ref={meshRef} position={[0, 0, -8]} renderOrder={-1}>
      <planeGeometry args={[viewport.width * 3, viewport.height * 3]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}

const PostProcessingEffects = () => {
  return (
    <EffectComposer multisampling={4}>
      <Noise opacity={0.06} blendFunction={BlendFunction.OVERLAY} />
      <Vignette eskil={false} offset={0.1} darkness={0.4} blendFunction={BlendFunction.NORMAL} />
    </EffectComposer>
  )
}

export default function Scene() {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    
    // Check reduced motion (disabled for now to ensure animations run)
    setPrefersReducedMotion(false)
    /*
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionMediaQuery.matches)
    
    const motionCheck = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    motionMediaQuery.addEventListener('change', motionCheck)
    */
    
    return () => {
      window.removeEventListener('resize', check)
      // motionMediaQuery.removeEventListener('change', motionCheck)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#fff5f5']} />
        <fog attach="fog" args={['#fff5f5', 5, 20]} />
        
        {/* ⚡ OVERDRIVE: Liquid Canvas Background (always visible) */}
        <LiquidBackground prefersReducedMotion={prefersReducedMotion} />
        
        {/* 3D Scene — hidden on mobile for readability */}
        {!isMobile && (
          <>
            {/* Lights for the MeshStandardMaterials */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
            <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#b56576" />
            
            <ArtistPalette prefersReducedMotion={prefersReducedMotion} />
            <Particles prefersReducedMotion={prefersReducedMotion} />
          </>
        )}
        
        <PostProcessingEffects />
      </Canvas>
    </div>
  )
}
