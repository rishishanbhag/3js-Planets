const canvas = document.getElementById("canvas");
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
});

// Resize handling
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 9;

// Throttle scroll handling
let lastScrollTime = 0;
const throttleDelay = 2000;
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

// Three.js scene setup
const scene = new THREE.Scene();
const spheres = new THREE.Group();

const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const textures = [
  "./csilla/color.png", 
  "./earth/map.jpg", 
  "./venus/map.jpg", 
  "./volcanic/color.png"
];

const rgbeLoader = new THREE.RGBELoader().load(
    "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/moonlit_golf_1k.hdr",
    function (texture) {
        texture.mapping = THREE.EquirectangularRefractionMapping;
        scene.environment = texture;
    }
);

const starTexture = new THREE.TextureLoader().load("./public/stars.jpg");
starTexture.colorSpace = THREE.SRGBColorSpace;
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
    map: starTexture,
    transparent: true,
    opacity: 0.4,
    side: THREE.BackSide,
});

const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

for (let i = 0; i < 4; i++) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textures[i]);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const angle = (i / 4) * (Math.PI * 2);
    sphere.position.x = orbitRadius * Math.cos(angle);
    sphere.position.z = orbitRadius * Math.sin(angle);
    spheres.add(sphere);
}

spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    spheres.children.forEach(
        (element) => (element.rotation.y = clock.getElapsedTime() * 0.01)
    );
}

animate();