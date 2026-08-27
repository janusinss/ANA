// Scene Setup
const canvas = document.querySelector('#webgl-canvas');
const scene = new THREE.Scene();

// We keep the background transparent in Three.js so the CSS var(--bg-color) shows through
// Or we can set the scene background to the exact color.
scene.background = new THREE.Color('#fff5f5');
scene.fog = new THREE.FogExp2('#fff5f5', 0.05);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 10;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
directionalLight.position.set(5, 5, 2);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xe2b4bd, 5, 20);
pointLight.position.set(-5, 0, 5);
scene.add(pointLight);

// Materials (Using the requested palette)
const material1 = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#f7d6d0'),
  metalness: 0.1,
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  wireframe: true // gives a tech/blueprint feel
});

const material2 = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#e2b4bd'),
  metalness: 0.2,
  roughness: 0.3,
  transmission: 0.5, // glass-like
  thickness: 1.0
});

// Objects (Mixing Logic & Art)
const group = new THREE.Group();
scene.add(group);

// Node-like tech structure
const icosahedron = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2, 1),
  material1
);
icosahedron.position.set(3, 0, 0);
group.add(icosahedron);

// Fluid artistic structure
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32),
  material2
);
torusKnot.position.set(-3, -2, -2);
group.add(torusKnot);

// Particles for atmosphere
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 30;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: '#4a4a4a',
  transparent: true,
  opacity: 0.2
});
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Animation Loop
const clock = new THREE.Clock();
let currentScroll = 0;

window.addEventListener('scroll', () => {
  currentScroll = window.scrollY;
});

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Gentle idle floating
  icosahedron.rotation.x = elapsedTime * 0.1;
  icosahedron.rotation.y = elapsedTime * 0.15;
  
  torusKnot.rotation.x = elapsedTime * 0.2;
  torusKnot.rotation.y = elapsedTime * 0.1;

  // Parallax based on scroll
  // As we scroll down, the group moves up and rotates
  const scrollOffset = currentScroll * 0.005;
  group.position.y = scrollOffset;
  group.rotation.y = scrollOffset * 0.5;

  particlesMesh.rotation.y = -scrollOffset * 0.1;

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();

// Window Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

// --- GSAP Scroll Animations for HTML Elements ---
gsap.registerPlugin(ScrollTrigger);

// Fade in profiles
const profiles = gsap.utils.toArray('.profile-section');

profiles.forEach((profile, i) => {
  const main = profile.querySelector('.profile-main');
  const adv = profile.querySelector('.profile-advocacy');
  const meta = profile.querySelector('.profile-meta');

  // Stagger the elements inside each profile as they scroll into view
  gsap.fromTo([main, adv, meta], 
    { 
      y: 100, 
      opacity: 0 
    },
    {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: profile,
        start: 'top 75%',
      }
    }
  );
});

// Hero text parallax
gsap.to('.hero-content', {
  y: '-30vh',
  opacity: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true
  }
});
