import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { loadRoom } from './genScene.js';
import {genCube1, genRubixsCube, genLazer2} from "./genObject.js";

export async function setupToyStory(objects, playerBody, world, scene, camera, controls) {

    // Point Light (그림자 포함)
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(20, 50, 0);
    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    scene.add(pointLight);

    // 바닥 생성
    const loader = new THREE.TextureLoader();
    const texture = loader.load('assets/floor-wood.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.encoding = THREE.sRGBEncoding;

    const floorGeo = new THREE.PlaneGeometry(50, 50, 1, 1);
    floorGeo.rotateX(-Math.PI / 2);

    const floorMat = new THREE.MeshStandardMaterial({ map: texture });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.position.y = 0.05;
    scene.add(floorMesh);

    // Room 로딩 (충돌 오브젝트 추가)
    try {
        const results = await loadRoom({ x: 0, y: 0, z: 0 }, scene, world);
        for (const obj of results) {
            objects.push(obj);
        }
    } catch (err) {
        console.error("loadRoom 실패", err);
    }


    const size = { x: 0.3, y: 2, z: 1.5 };
        const goBackTrigger = {
            mesh: new THREE.Mesh(
                new THREE.BoxGeometry(size.x, size.y, size.z),
                new THREE.MeshBasicMaterial({ 
                    color: 0x00ff00,
                    wireframe: true,
                    transparent: true,
                    opacity: 0
                })
            ),
            body: new CANNON.Body({
                mass: 0,
                shape: new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2))
            })
        };

        goBackTrigger.mesh.position.set(-10, 5, -2.5);
        goBackTrigger.body.position.copy(goBackTrigger.mesh.position);
        scene.add(goBackTrigger.mesh);
        world.addBody(goBackTrigger.body);
        objects.push(goBackTrigger);
    
        goBackTrigger.body.addEventListener('collide', async function(e) {
            if (e.body === playerBody) {
                playerBody.position.set(25.5, 7, 90);
                playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    
            }
        });


// 침대
objects.push(genLazer2({
    location: { x: 9, y: 5, z: -11 },
    size: { x: 0.1, y: 5, z: 3 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: -9, y: 9, z: -7 },
    size: { x: 0.1, y: 4, z: 3 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }
}, world, scene));

// 천장
objects.push(genLazer2({
    location: { x: -3, y: 12, z: 0 },
    size: { x: 5, y: 0.1, z: 7 },
    rotation: { x: 0, y: 0, z: -Math.PI / 6 }
}, world, scene));

objects.push(genLazer2({
    location: { x: -8, y: 13, z: 3 },
    size: { x: 2, y: 0.1, z: 5 },
    rotation: { x: 0, y: 0, z: Math.PI / 4 }
}, world, scene));

// 바닥
objects.push(genLazer2({
    location: { x: -0.5, y: 5, z: 0 },
    size: { x: 4, y: 0.1, z: 3 },
    rotation: { x: 0, y: 0, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: 9, y: 9, z: 2 },
    size: { x: 0.1, y: 4, z: 3 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: 9, y: 3, z: 5 },
    size: { x: 0.1, y: 8, z: 3 },
    rotation: { x: 0, y: Math.PI / 4, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: -10, y: 6, z: 5 },
    size: { x: 0.1, y: 4, z: 3 },
    rotation: { x: 0, y: Math.PI / 4, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: 7, y: 8, z: 11 },
    size: { x: 0.1, y: 5, z: 4 },
    rotation: { x: 0, y: -Math.PI / 4, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: -4, y: 9, z: -11 },
    size: { x: 0.1, y: 5, z: 4 },
    rotation: { x: 0, y: -Math.PI / 4, z: 0 }
}, world, scene));

objects.push(genLazer2({
    location: { x: -1, y: 5, z: 12 },
    size: { x: 0.1, y: 4, z: 3 },
    rotation: { x: 0, y: Math.PI / 2, z: Math.PI / 6 }
}, world, scene));
    try {
        const results = await loadRoom({ x: 0, y: 0, z: 0 }, scene, world);
        for (const obj of results) {
            objects.push(obj);
        }
    } catch (err) {
        console.error("loadRoom 실패", err);
    }

    // 텍스트 출력
    const infoText = document.getElementById("infoText");
    infoText.innerText = "Portals can only be placed on GREEN!";
    infoText.style.display = "block";

    setTimeout(() => {
        infoText.style.display = "none";
    }, 3000);

    console.log("ToyStory scene loaded successfully.");
}