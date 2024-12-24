import "./style.css";
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from "gsap";
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25, 
  window.innerWidth / window.innerHeight, 
  0.1,
  1000);
camera.position.z = 7;

const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);





const radius = 1;
const segments = 128;
const textures = [
  "./csilla/color.png", 
  "./earth/map.jpg", 
  "./venus/map.jpg", 
  "./volcanic/color.png"
];
const spheres= new THREE.Group();


let hdriLoader = new RGBELoader();
hdriLoader.load(
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonlit_golf_2k.hdr",
    function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    },  
);

const starTexture = new THREE.TextureLoader().load('./stars.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial(
  { map: starTexture,
    opacity: 0.075,
    side: THREE.BackSide }
  );
const star = new THREE.Mesh(starGeometry, starMaterial);
scene.add(star);


for(let i=0; i<4; i++){
  
  const textureloader = new THREE.TextureLoader(); 
  const tex= textureloader.load(textures[i]);
  tex.colorSpace = THREE.SRGBColorSpace;
  
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({map: tex});
  const sphere = new THREE.Mesh(geometry, material);
  
  
  const angle = i * (Math.PI / 2);
  sphere.position.x = 3 * Math.cos(angle);
  sphere.position.z = 3 * Math.sin(angle);
  spheres.add(sphere);
}

spheres.rotation.x = 0.1;
spheres.position.x = 0;
spheres.position.y = -0.7;
scene.add(spheres);


// const controls = new OrbitControls(camera, renderer.domElement);

setInterval(() => {
  gsap.to(spheres.rotation, 
    {
    duration: 2,
    y:`+=${Math.PI/2}`,
    ease: "expo.easeInOut"}
  );
}, 4000);


function animate() {
  requestAnimationFrame(animate);
  // controls.update();
  renderer.render(scene, camera);

}
animate();


// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


let lastScrollTime = 0;
const throttleDelay = 4000;
let scrollCount = 0;

const throttleScrollHandler = (direction) => {
    const currentTime = Date.now();
    if (currentTime - lastScrollTime >= throttleDelay) {
        lastScrollTime = currentTime;
        scrollCount = (scrollCount + 1) % 4;
        const headings = document.querySelectorAll(".heading");

        gsap.to(headings, {
            duration: 1,
            y: `-=${100}%`,
            ease: "power2.inOut",
        });

        gsap.to(spheres.rotation, {
            y: `-=${Math.PI / 2}`,
            duration: 2,
        });

        if (scrollCount === 0) {
            gsap.to(headings, {
                y: 0,
                duration: 1,
                ease: "power2.inOut",
            });
        }
    }
};

// Event listeners for scrolling
const wheelHandler = (event) => {
    const direction = event.deltaY > 0 ? "down" : "up";
    throttleScrollHandler(direction);
};

let lastTouchY = null;
const touchStartHandler = (event) => {
    lastTouchY = event.touches[0].clientY;
};

const touchMoveHandler = (event) => {
    if (lastTouchY !== null) {
        const currentTouchY = event.touches[0].clientY;
        const direction = currentTouchY > lastTouchY ? "down" : "up";
        throttleScrollHandler(direction);
        lastTouchY = currentTouchY; // Update last touch position
    }
};

const touchEndHandler = () => {
    lastTouchY = null; // Reset on touch end
};

window.addEventListener("wheel", wheelHandler);
window.addEventListener("touchstart", touchStartHandler);
window.addEventListener("touchmove", touchMoveHandler);
window.addEventListener("touchend", touchEndHandler);