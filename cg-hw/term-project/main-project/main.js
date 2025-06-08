import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { createCube, createCube2 } from "./scripts/createPrimitive.js";
import {createCylinder2} from "./scripts/createPrimitive.js";
import {createSphere2} from "./scripts/createPrimitive.js";
import {
    genWall1,
    genWall2,
    genWall3,
    genWall4,
    genWall5,
    genCube1,
    genGelBlue,
    genFloor1,
    genFloor2,
    genLight1,
    genPlate1, genDoor1, genGunPlate, genPortalGun, genConeLight
} from "./scripts/genObject.js";
import {PointerLockControls} from "./scripts/PointerLockControls.js";
import CannonDebugger from 'https://cdn.jsdelivr.net/npm/cannon-es-debugger@1.0.0/dist/cannon-es-debugger.js';

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

let cannonDebugger;

// functions
function pointerLock() {
    if (havePointerLock) {
        let element = document.body;
        let pointerlockchange = function (event) {

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

        }

        let pointerlockerror = function (event) {
            instructions.style.display = '';
        }

        // Hook pointer lock state change events
        document.addEventListener('pointerlockchange', pointerlockchange, false);
        document.addEventListener('mozpointerlockchange', pointerlockchange, false);
        document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

        document.addEventListener('pointerlockerror', pointerlockerror, false);
        document.addEventListener('mozpointerlockerror', pointerlockerror, false);
        document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

        instructions.addEventListener('click', function (event) {
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

        }, false);

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
    scene.fog = new THREE.Fog( 0x000000, 0, 500 );

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

    await setupStage1();
}

async function setupStage1() {
    objects.push(
        genFloor2({
            location: { x: 0, y: 0.05, z: 0 },
            size: {x: 40, y:0.1, z: 20},
            rotation: { x: 0, y: 0, z: 0 },
        }, world, scene)
    );
    objects.push(
        genFloor2({
            location: { x: 0, y: 8.1, z: 0 },
            size: {x: 40, y:0.1, z: 20},
            rotation: { x: 0, y: 0, z: 0 },
        }, world, scene)
    );
    objects.push(
        await genLight1({
            location: { x: 8, y: 8, z: 0 },
            scale: 1,
            rotation: { x: Math.PI, y: 0, z: 0 },
        }, world, scene)
    );

    const pointLight1 = new THREE.PointLight(0xffffff, 2.5, 10); // (색상, 밝기, 거리)
    pointLight1.position.set(8, 7.5, 0);
    scene.add(pointLight1);

    objects.push(genWall3({location:{x:2, y:4.1, z:-4}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:2, y:4.1, z:4}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:-2, y:4.1, z:-2.05}, size:{x:4, y:8, z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:-2, y:4.1, z:2.05}, size:{x:4, y:8, z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:-4.05, y:4.1, z:0}, size:{x:0.1, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:8, y:4.1, z:-6.05}, size:{x:8, y:8, z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:8, y:4.1, z:6.05}, size:{x:8, y:8, z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:14, y:4.1, z:4}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:14, y:4.1, z:-4}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:18, y:4.1, z:-4}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:18, y:4.1, z:4}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:19.95, y:6.1, z:0}, size:{x:0.1, y:4, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall1({location:{x:30, y:4.1, z:24}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall2({location:{x:22, y:4.1, z:24}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(
        genFloor1({
            location: { x: 30, y: 8.1, z: 0 },
            size: {x: 20, y:0.1, z: 12},
            rotation: { x: 0, y: 0, z: 0 },
        }, world, scene)
    );
    objects.push(
        genFloor1({
            location: { x: 30, y: 0.05, z: 0 },
            size: {x: 20, y:0.1, z: 12},
            rotation: { x: 0, y: 0, z: 0 },
        }, world, scene)
    );

    objects.push(genWall2({location:{x:26, y:4.1, z:-6.05}, size:{x:12, y:8, z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall1({location:{x:30, y:2.1, z:-4}, size:{x:4, y:4, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall2({location:{x:34, y:6.1, z:-4}, size:{x:4, y:4, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall2({location:{x:34, y:4.1, z:0}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall2({location:{x:36.05, y:4.1, z:4}, size:{x:0.1, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall1({location:{x:34, y:4.1, z:6.05}, size:{x:4, y:8, z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall4({location:{x:30, y:4.1, z:8}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall5({location:{x:22, y:2.1, z:8}, size:{x:4, y:4, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall3({location:{x:22, y:6.1, z:8}, size:{x:4, y:4, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(genFloor2({location:{x:26, y:8.1, z:14}, size:{x:12, y:0.1, z:16}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genFloor1({location:{x:26, y:0.05, z:16}, size:{x:12, y:0.1, z:12}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genFloor2({location:{x:26, y:0.05, z:8}, size:{x:4, y:0.1, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genFloor2({location:{x:26, y:0.05, z:24}, size:{x:4, y:0.1, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(genWall2({location:{x:32.05, y:4.1, z:16}, size:{x:0.1, y:8, z:12}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall1({location:{x:19.95, y:4.1, z:16}, size:{x:0.1, y:8, z:12}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(await genPlate1({location:{x:26, y:0.15, z:16}, scale:2, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(await genCube1({
        location: { x: 30, y: 6, z: -4 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
    }, world, scene));

    let res = await genDoor1({
        location: { x: 19.8, y: 2.15, z: 0 },
        rotation: { x: Math.PI/2, y: 0, z: Math.PI/2 },
        scale: 5,
    }, world, scene)
    objects.push(res);

    setupAutoDoor(res, playerBody, scene);

    objects.push(await genGunPlate({
        location: { x: 8, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 2,
    }, world, scene));

    res = await genPortalGun({
        location: { x: 8, y: 2.3, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1,
    }, world, scene);
    res.isPortalGun = true;

    res.interact = function () {
        // 1. objects 배열에서 제거
        const index = objects.indexOf(res);
        if (index !== -1) objects.splice(index, 1);

        // 2. CANNON world에서 body 제거
        if (res.body) {
            world.removeBody(res.body);
        }

        // 3. 메쉬를 씬에서 계속 유지하되 카메라 자식으로 만들어 고정
        if (res.mesh) {
            // 월드 좌표계에서 카메라 상대 좌표로 변환
            camera.add(res.mesh); // 카메라의 자식으로 만들기

            // 위치 설정: 카메라 기준 오른쪽 아래쪽 앞으로 약간
            res.mesh.position.set(0.4, -0.3, -0.5); // 필요시 조정

            // 회전 초기화 또는 고정 회전 설정
            res.mesh.rotation.set(0, 0, 0); // 필요시 조정

            // scale 도 조정 가능 (옵션)
            res.mesh.scale.set(2, 2, 2);
        }
    };
    objects.push(res);
    res.body.collisionResponse = false;

    objects.push(
        await genLight1({
            location: { x: 26, y: 8, z: 8 },
            scale: 1,
            rotation: { x: Math.PI, y: 0, z: 0 },
        }, world, scene)
    );

    const pointLight2 = new THREE.PointLight(0xffffff, 2.5, 10); // (색상, 밝기, 거리)
    pointLight2.position.set(26, 7.5, 8);
    scene.add(pointLight2);

    genConeLight({
        location: { x: 8, y: -1, z: 0 },
        destination: { x: 8, y: 8, z: 0 },
        radius: 1.2
    }, world, scene);
}

function setupInteract() {
    window.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() !== 'e') return;
        if (!controls.enabled) return;

        const playerPosition = new THREE.Vector3().copy(controls.getObject().position);
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);

        let closestObject = null;
        let closestDistance = Infinity;
        const maxDistance = 3; // 예: 상호작용 가능한 최대 거리

        for (const obj of objects) {
            if (!obj || !obj.body) continue;

            const objectPosition = new THREE.Vector3().copy(obj.body.position);
            const directionToObject = new THREE.Vector3().subVectors(objectPosition, playerPosition);
            const distance = directionToObject.length();

            // 플레이어가 object 쪽을 어느 정도 정확하게 보고 있는지 확인
            const angle = cameraDirection.angleTo(directionToObject.clone().normalize());
            const fieldOfViewThreshold = Math.PI / 12; // 약 30도

            if (distance <= maxDistance && angle <= fieldOfViewThreshold) {
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestObject = obj;
                }
            }
        }

        if (closestObject && typeof closestObject.interact === 'function') {
            closestObject.interact();
        }
    });
}

function setupAutoDoor(res, playerBody, scene) {
    const mixer = new THREE.AnimationMixer(res.mesh);
    const openAction = mixer.clipAction(res.animations[12]);
    const closeAction = mixer.clipAction(res.animations[11]);

    const triggerDistance = 5; // 거리 조건
    let isOpen = false;
    let isClosed = false;
    let triggered = false;

    // 문 앞/뒤 방향 계산
    const doorForward = new THREE.Vector3(0, 1, 0).applyQuaternion(res.mesh.quaternion).normalize();

    function update(delta) {
        mixer.update(delta);

        const doorPos = res.body.position;
        const playerPos = playerBody.position;

        const toPlayer = new THREE.Vector3(
            playerPos.x - doorPos.x,
            playerPos.y - doorPos.y,
            playerPos.z - doorPos.z
        );

        const distance = toPlayer.length();
        const direction = toPlayer.clone().normalize();
        const facing = doorForward.dot(direction); // >0: 앞, <0: 뒤

        // 🔓 문 열기: 뒤에서 일정 거리 이하 접근 & 아직 열리지 않음
        if (distance < triggerDistance && !triggered && !isOpen) {
            triggered = true;
            isOpen = true;

            res.mesh.rotation.y -= Math.PI/2;

            openAction.reset().setLoop(THREE.LoopOnce);
            openAction.clampWhenFinished = true;
            openAction.play();

            res.body.collisionResponse = false;
        }

        // 🔒 문 닫기: 앞에서 접근 & 이미 열렸고 아직 닫히지 않음
        if (facing < 0 && !isClosed && isOpen && distance > 3) {
            isClosed = true;

            openAction.stop();
            closeAction.reset().setLoop(THREE.LoopOnce);
            closeAction.clampWhenFinished = true;
            closeAction.play();

            res.body.collisionResponse = true;
        }
    }

    // animate에서 호출되도록 등록
    mixers.push({update});
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    if(controls.enabled){
        world.step(dt);

        for(let object of objects){
            if(object.isFixed) continue;
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
    controls.update( Date.now() - time );
    renderer.render( scene, camera );
    time = Date.now();
}

function setupClickMarker(scene, camera) {
    const raycaster = new THREE.Raycaster();
    const redDotGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const redDotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    window.addEventListener('click', () => {
        if(!controls.enabled) return;
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        raycaster.set(controls.getObject().position, direction);

        // ray와 교차된 물체 찾기
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const hit = intersects[0];

            const redDot = new THREE.Mesh(redDotGeometry, redDotMaterial);
            redDot.position.copy(hit.point);
            scene.add(redDot);

            console.log('🔴 Hit:', hit.object.name || hit.object.type, '@', hit.point.x, hit.point.y, hit.point.z);
        }
    });
}

// main
window.onload = () => {
    pointerLock();
    initCannon();
    init();
    cannonDebugger = CannonDebugger(scene, world);
    setupClickMarker(scene, camera);
    setupInteract();
    animate();
}