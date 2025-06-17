import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import {PointerLockControls} from "./scripts/PointerLockControls.js";
import CannonDebugger from 'https://cdn.jsdelivr.net/npm/cannon-es-debugger@1.0.0/dist/cannon-es-debugger.js';
import {checkPickup, setupBreakingBlock, updateBreaking} from "./scripts/setupSimpleMC.js";
import {
    setupInteract,
    setupClickMarker,
    setupCubeEliminator,
    eliminateCube,
    setupStage1,
    setupStage2,
    setupStage3,
    setupEnd
} from "./scripts/setupStages.js";
import {checkRenderPortalView, checkPortalTeleport, setupPortal} from "./scripts/setupPortal.js";

// global variables
let playerShape, playerBody, world, physicsMaterial;

let camera, scene, renderer;
let geometry, material, mesh;
let controls,time = Date.now();

let blocker = document.getElementById( 'blocker' );
let instructions = document.getElementById( 'instructions' );

let havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

let dt = 1/60;

let mixers = [];

let objects = [];
let cubes = [];

let cannonDebugger;
let pointerlockchange;

// main
window.onload = async () => {
    pointerLock();
    initCannon();
    await init();
    cannonDebugger = CannonDebugger(scene, world);
    // setupClickMarker(scene, camera, controls);
    setupInteract(camera, controls, objects);
    setupBreakingBlock(camera, controls, objects, scene);
    setupCubeEliminator(objects);
    cubes = objects.filter(obj => obj && obj.mesh && obj.mesh.name === "cube");
    setupPortal(renderer, scene, camera);
    animate();
}

// functions
function pointerLock() {
    if (havePointerLock) {
        let element = document.body;
        pointerlockchange = function (event) {

            if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

                controls.enabled = true;

                blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        };

        let pointerlockerror = function (event) {
            instructions.style.display = '';
        }

        // Hook pointer lock state change events
        document.onpointerlockchange = pointerlockchange;
        // document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        // document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.onpointerlockerror = pointerlockerror;
        // document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        // document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        instructions.onclick = function (event) {
            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if (/Firefox/i.test(navigator.userAgent)) {

                let fullscreenchange = function (event) {

                    if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

                        document.removeEventListener('fullscreenchange', fullscreenchange);
                        document.removeEventListener('mozfullscreenchange', fullscreenchange);

                        element.requestPointerLock();
                    }

                }

                document.addEventListener('fullscreenchange', fullscreenchange, false);
                document.addEventListener('mozfullscreenchange', fullscreenchange, false);

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                element.requestFullscreen();

            } else {

                element.requestPointerLock();

            }

        };

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }
}
function initCannon(){
    // Setup our world
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    let solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    let split = true;
    if(split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0,-8,0);
    world.broadphase = new CANNON.NaiveBroadphase();

    // Create a slippery material (friction coefficient = 0.0)
    physicsMaterial = new CANNON.Material("slipperyMaterial");
    let physicsContactMaterial = new CANNON.ContactMaterial(
        physicsMaterial,
        physicsMaterial,
        { friction: 0.0, restitution: 0.7}
    );
    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);

    // Create a sphere
    let mass = 5, radius = 1;
    playerShape = new CANNON.Sphere(radius);
    playerBody = new CANNON.Body({ mass: mass });
    playerBody.addShape(playerShape);
    playerBody.position.set(0,5,0);
    world.addBody(playerBody);

    // Create a plane
    let groundShape = new CANNON.Plane();
    let groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(groundBody);
}
async function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x9EABBC, 0, 100 );

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( scene.fog.color, 1 );

    document.body.appendChild( renderer.domElement );

//  AmbientLight (은은하게 전체 조명)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // (색상, intensity)
    scene.add(ambientLight);

    controls = new PointerLockControls( camera , playerBody );
    controls.getObject().name = "playerBody";
    scene.add( controls.getObject() );

    // floor
    geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
    geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );

    mesh = new THREE.Mesh( geometry, material );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add( mesh );

    window.addEventListener( 'resize', onWindowResize, false );

    await setupStage1(objects, camera, playerBody, mixers, world, scene);
    await setupStage2(objects, playerBody, world, scene, camera, controls);
    await setupStage3(objects, playerBody, world, scene, camera, controls, mixers);
    await setupEnd(objects, playerBody, world, scene, camera, controls);
}
export function getPointerLockChange() {
    return pointerlockchange;
}

export { controls };

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    let deltaTime = Date.now() - time;
    if(controls.enabled){
        world.step(1/60);

        eliminateCube();
        for(let object of objects){
            if(object.isFixed || !object.body) continue;
            object.mesh.position.copy(object.body.position);
            object.mesh.quaternion.copy(object.body.quaternion);

            if(object.isPortalGun) {
                const deltaQuat = new CANNON.Quaternion();
                deltaQuat.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), dt);
                object.body.quaternion = object.body.quaternion.mult(deltaQuat);
                object.body.quaternion.normalize();
                object.mesh.quaternion.copy(object.body.quaternion);
            }
        }
    }

    mixers.forEach(mixer => {
        mixer.update(dt/4);
    });

    // cannonDebugger.update();
    controls.update(deltaTime);
    updateBreaking(deltaTime, camera, controls, scene, world);
    checkPickup(playerBody, world, scene);
    // eliminateCube();

    checkPortalTeleport(playerBody, scene);
    cubes.forEach(cube => checkPortalTeleport(cube.body, scene));
    checkRenderPortalView(renderer, scene, camera);

    renderer.render( scene, camera );
    time = Date.now();
}