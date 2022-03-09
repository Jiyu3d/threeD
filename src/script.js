import "./style.css";
import gsap from "gsap";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Side } from "three";

// const gui = new dat.GUI();
// const world = {
//   plane: {
//     width: 19,
//   },
// };
// gui.add(world.plane, "width", 1, 500).onChange(() => {
//   planeMesh.geometry.dispose();
//   planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, 10, 10, 10);
// });

const raycaster = new THREE.Raycaster();
// Scene
const scene = new THREE.Scene();

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);

document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);

camera.position.z = 50;

//GEOMETRY
const planeGeometry = new THREE.PlaneGeometry(400, 400, 50, 50);

//MATERIAL
const planeMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true,
});

//MESH
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(planeMesh);

//vartice position randomization
const { array } = planeMesh.geometry.attributes.position;

const randomValues = [];
for (let i = 0; i < array.length; i++) {
  if (i % 3 === 0) {
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i] = x + (Math.random() - 0.5) * 3;
    array[i + 1] = y + (Math.random() - 0.5) * 3;
    array[i + 2] = z + (Math.random() - 0.5) * 3;
  }
  randomValues.push(Math.random() * Math.PI * 2);
}
planeMesh.geometry.attributes.position.randomValues = randomValues;
planeMesh.geometry.attributes.position.originalPosition =
  planeMesh.geometry.attributes.position.array;

//color attribute addition
const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
  colors.push(0, 0.19, 0.4);
}

planeMesh.geometry.setAttribute(
  "color",
  new THREE.BufferAttribute(new Float32Array(colors), 3)
);

//LIGHT
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1);
scene.add(light);
const backLight = new THREE.DirectionalLight(0xffffff, 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const mouse = {
  x: undefined,
  y: undefined,
};

let frame = 0;

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  raycaster.setFromCamera(mouse, camera);

  frame += 0.01;
  const { array, originalPosition, randomValues } =
    planeMesh.geometry.attributes.position;
  for (let i = 0; i < array.length; i += 3) {
    //x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003;

    //y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.003;
  }
  planeMesh.geometry.attributes.position.needsUpdate = true;

  const intersects = raycaster.intersectObject(planeMesh);
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes;
    //vertice one
    color.setX(intersects[0].face.a, 0.1);
    color.setY(intersects[0].face.a, 0.5);
    color.setZ(intersects[0].face.a, 1);

    //vertice two
    color.setX(intersects[0].face.b, 0.1);
    color.setY(intersects[0].face.b, 0.5);
    color.setZ(intersects[0].face.b, 1);

    //vertice three
    color.setX(intersects[0].face.c, 0.1);
    color.setY(intersects[0].face.c, 0.5);
    color.setZ(intersects[0].face.c, 1);

    intersects[0].object.geometry.attributes.color.needsUpdate = true;

    const initialColor = {
      r: 0,
      g: 0.19,
      b: 0.4,
    };

    const hovorColor = {
      r: 0.1,
      g: 0.5,
      b: 1,
    };
    gsap.to(hovorColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        //vertice one
        color.setX(intersects[0].face.a, hovorColor.r);
        color.setY(intersects[0].face.a, hovorColor.g);
        color.setZ(intersects[0].face.a, hovorColor.b);

        //vertice two
        color.setX(intersects[0].face.b, hovorColor.r);
        color.setY(intersects[0].face.b, hovorColor.g);
        color.setZ(intersects[0].face.b, hovorColor.b);

        //vertice three
        color.setX(intersects[0].face.c, hovorColor.r);
        color.setY(intersects[0].face.c, hovorColor.g);
        color.setZ(intersects[0].face.c, hovorColor.b);
        color.needsUpdate = true;
      },
    });
  }
  //   planeMesh.rotation.x += 0.01;
};

animate();
addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / innerHeight) * 2 + 1;
});
