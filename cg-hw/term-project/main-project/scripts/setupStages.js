import {
    genCherryLeaf,
    genCherryLog,
    genCobblestone,
    genConeLight, genCraftingTable,
    genCube1, genDirt, genDoor1,
    genFloor1,
    genFloor2, genGrass, genGunPlate, genLazer, genLazerField,
    genLight1,
    genPlate1, genPortalGun, genPoster1, genPoster2, genTransparentWall,
    genWall1,
    genWall2,
    genWall3,
    genWall4,
    genWall5,
    genSmallRoom,
    genRubixsCube,
} from "./genObject.js";
import {enterToMCWorld, exitFromMCWorld, setupSimpleMCWorld} from "./setupSimpleMC.js";
import { setupToyStory } from "./setupToyStory.js";
import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

let cubes;
let lazer;

export async function setupStage1(objects, camera, playerBody, mixers, world, scene) {
    let prev_length = objects.length;
    let obj = genFloor2({
        location: { x: 0, y: 0.05, z: 0 },
        size: {x: 40, y:0.1, z: 20},
        rotation: { x: 0, y: 0, z: 0 },
    }, world, scene);
    obj.inStage1 = true;
    objects.push(obj);

    obj = genFloor2({
        location: { x: 0, y: 8.1, z: 0 },
        size: {x: 40, y:0.1, z: 20},
        rotation: { x: 0, y: 0, z: 0 },
    }, world, scene);
    obj.inStage1 = true;
    objects.push(obj);

    obj = await genLight1({
        location: { x: 8, y: 8, z: 0 },
        scale: 1,
        rotation: { x: Math.PI, y: 0, z: 0 },
    }, world, scene);
    obj.inStage1 = true;
    objects.push(obj);

    const pointLight1 = new THREE.PointLight(0xffffff, 2.5, 10); // (색상, 밝기, 거리)
    pointLight1.position.set(8, 7.5, 0);
    scene.add(pointLight1);
    objects.push({mesh: pointLight1, body: null, inStage1: true});

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

    objects.push(genWall2({location:{x:32.05, y:4.1, z:16}, size:{x:0.1, y:8, z:12}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall1({location:{x:19.95, y:4.1, z:16}, size:{x:0.1, y:8, z:12}, rotation:{x:0, y:0, z:0}}, world, scene));
    const plate = await genPlate1({location:{x:26, y:0.15, z:16}, scale:2, rotation:{x:0, y:0, z:0}}, world, scene)
    objects.push(plate);

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

    setupAutoDoor(res, playerBody, mixers);

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
            location: { x: 27, y: 8, z: 0 },
            scale: 1,
            rotation: { x: Math.PI, y: 0, z: 0 },
        }, world, scene)
    );

    const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 10); // (색상, 밝기, 거리)
    pointLight2.position.set(27, 7.1, 0);
    scene.add(pointLight2);
    objects.push({mesh: pointLight2});

    objects.push(
        await genLight1({
            location: { x: 26, y: 8, z: 16 },
            scale: 1,
            rotation: { x: Math.PI, y: 0, z: 0 },
        }, world, scene)
    );

    const pointLight3 = new THREE.PointLight(0xffffff, 1.2, 10); // (색상, 밝기, 거리)
    pointLight3.position.set(26, 7.1, 16);
    scene.add(pointLight3);
    objects.push({mesh: pointLight3});

    objects.push(genConeLight({
        location: { x: 8, y: -1, z: 0 },
        destination: { x: 8, y: 8, z: 0 },
        radius: 1.2
    }, world, scene));

    let res2 = await genDoor1({
        location: { x: 26, y: 2.15, z: 22.5 },
        rotation: { x: Math.PI/2, y: 0, z: 0 },
        scale: 5,
    }, world, scene);
    objects.push(res2);

    setupPlateDoorInteraction(plate, res2, playerBody, mixers, world, scene, objects);

    objects.push(await genLazerField({location:{x:26, y:7.8, z:8}, scale:4, rotation:{x:0, y:0, z:Math.PI}}, world, scene));
    objects.push(genLazer({location:{x:26, y:4.1, z:8}, size:{x:4,y:8,z:0.1}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(genFloor2({location:{x:26, y:0.05, z:24}, size:{x:4, y:0.1, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall2({location:{x:26, y:6.1, z:24}, size:{x:4, y:4, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall1({location:{x:30, y:4.1, z:24}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genWall2({location:{x:22, y:4.1, z:24}, size:{x:4, y:8, z:4}, rotation:{x:0, y:0, z:0}}, world, scene));

    for(let i = prev_length; i < objects.length-4; i++) {
        objects[i].inStage1 = true;
    }
    res2.inStage1 = false;
}

export async function setupStage2(objects, playerBody, world, scene, camera, controls) {
    const offset = { x: 26, y: 0, z: 46 };
    const yRotation = -Math.PI / 2;

    function rotateAndTranslate(pos) {
        // y축 기준 -90도 회전 후 평행이동
        return {
            x: pos.z + offset.x,
            y: pos.y + offset.y,
            z: -pos.x + offset.z,
        };
    }

// 회전 및 이동된 바닥 생성
    objects.push(
        genFloor2({
            location: rotateAndTranslate({ x: 0, y: 0.05, z: 0 }),
            size: { x: 40, y: 0.1, z: 20 },
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene)
    );
    objects.push(
        genFloor2({
            location: rotateAndTranslate({ x: 0, y: 8.1, z: 0 }),
            size: { x: 40, y: 0.1, z: 20 },
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene)
    );

// 회전 및 이동된 조명 생성
    objects.push(
        await genLight1({
            location: rotateAndTranslate({ x: 8, y: 8, z: 0 }),
            scale: 1,
            rotation: { x: Math.PI, y: yRotation, z: 0 },
        }, world, scene)
    );

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 10);
    const lightPos = rotateAndTranslate({ x: 8, y: 7.5, z: 0 });
    pointLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    scene.add(pointLight);

// 벽 정의 배열
    const wallDefs = [
        { location: {x:2, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:2, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:-2, y:4.1, z:-2.05}, size:{x:4, y:8, z:0.1} },
        { location: {x:-2, y:4.1, z:2.05}, size:{x:4, y:8, z:0.1} },
        // { location: {x:-4.05, y:4.1, z:0}, size:{x:0.1, y:8, z:4} },
        { location: {x:8, y:4.1, z:-6.05}, size:{x:8, y:8, z:0.1} },
        { location: {x:8, y:4.1, z:6.05}, size:{x:8, y:8, z:0.1} },
        { location: {x:14, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:14, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:18, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:18, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:19.95, y:6.1, z:0}, size:{x:0.1, y:4, z:4} },
    ];

// 회전 및 이동된 벽들 생성
    for (const wall of wallDefs) {
        const loc = rotateAndTranslate(wall.location);
        objects.push(genWall3({
            location: loc,
            size: wall.size,
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene));
    }

    let res3 = genPoster1({location:{x:31.95, y:4, z:38}, scale:2, rotation:{x:0,y:-Math.PI/2,z:0}}, world, scene);
    objects.push(res3);
    setupSimpleMCWorld({x:345.5, y:2.5, z:345.5}, objects, world, scene, camera, playerBody, controls);

    genTransparentWall({location:{x: 350, y:0, z:350}, size:{x:10, y:4, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 350, y:16.5, z:350}, size:{x:10, y:1, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 344, y:9, z:350}, size:{x:2, y:14, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 356, y:9, z:350}, size:{x:2, y:14, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 350, y:9, z:356}, size:{x:10, y:14, z:2}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 350, y:9, z:344}, size:{x:10, y:14, z:2}, rotation:{x:0,y:0,z:0}}, world, scene);
    objects.push(genWall1({location:{x:20, y:4.1, z:38}, size:{x:0.2,y:8,z:4}, rotation:{x:0, y:0, z:Math.PI}}, world, scene));

    let res4 = genPoster2({location:{x:350, y:7, z:354.95}, scale:2, rotation:{x:0,y:Math.PI,z:0}}, world, scene);
    objects.push(res4);

    objects.push(genCobblestone({location:{x:28-2/3,y:0.1+2/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genCobblestone({location:{x:28-6/3,y:0.1+2/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genCobblestone({location:{x:28-10/3,y:0.1+2/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(genCobblestone({location:{x:28-2/3,y:0.1+6/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genCobblestone({location:{x:28-6/3,y:0.1+6/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genCobblestone({location:{x:28-10/3,y:0.1+6/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(genCobblestone({location:{x:28-2/3,y:0.1+10/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genCobblestone({location:{x:28-6/3,y:0.1+10/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));
    objects.push(genCobblestone({location:{x:28-10/3,y:0.1+10/3,z:49}, size:{x:4/3, y:4/3, z:4/3}, rotation:{x:0, y:0, z:0}}, world, scene));

    objects.push(genWall3({location:{x:26,y:6.1,z:48}, rotation:{x:0,y:0,z:0}, size:{x:4,y:4,z:4}}, world, scene));
}

export async function setupStage3(objects, playerBody, world, scene, camera, controls, mixers) {

    const offset = { x: 26, y: 0, z: 70 };
    const yRotation = -Math.PI / 2;

    function rotateAndTranslate(pos) {
        // y축 기준 -90도 회전 후 평행이동
        return {
            x: pos.z + offset.x,
            y: pos.y + offset.y,
            z: -pos.x + offset.z,
        };
    }

// 회전 및 이동된 바닥 생성
    objects.push(
        genFloor2({
            location: rotateAndTranslate({ x: 0, y: 0.05, z: 0 }),
            size: { x: 40, y: 0.1, z: 20 },
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene)
    );
    objects.push(
        genFloor2({
            location: rotateAndTranslate({ x: 0, y: 8.1, z: 0 }),
            size: { x: 40, y: 0.1, z: 20 },
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene)
    );

// 회전 및 이동된 조명 생성
    objects.push(
        await genLight1({
            location: rotateAndTranslate({ x: 8, y: 8, z: 0 }),
            scale: 1,
            rotation: { x: Math.PI, y: yRotation, z: 0 },
        }, world, scene)
    );

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 10);
    const lightPos = rotateAndTranslate({ x: 8, y: 7.5, z: 0 });
    pointLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    scene.add(pointLight);

// 벽 정의 배열
    const wallDefs = [
        { location: {x:2, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:2, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:-2, y:4.1, z:-2.05}, size:{x:4, y:8, z:0.1} },
        { location: {x:-2, y:4.1, z:2.05}, size:{x:4, y:8, z:0.1} },
        { location: {x:3.95, y:4.1, z:0}, size:{x:0.1, y:8, z:4} },
        { location: {x:8, y:4.1, z:-6.05}, size:{x:8, y:8, z:0.1} },
        { location: {x:8, y:4.1, z:6.05}, size:{x:8, y:8, z:0.1} },
        { location: {x:14, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:14, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:18, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:18, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:19.95, y:6.1, z:0}, size:{x:0.1, y:4, z:4} },
    ];


// 회전 및 이동된 벽들 생성
    for (const wall of wallDefs) {
        const loc = rotateAndTranslate(wall.location);
        objects.push(genWall3({
            location: loc,
            size: wall.size,
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene));
    }

    genTransparentWall({location:{x: 350, y:0, z:350}, size:{x:10, y:4, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 350, y:16.5, z:350}, size:{x:10, y:1, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 344, y:9, z:350}, size:{x:2, y:14, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 356, y:9, z:350}, size:{x:2, y:14, z:10}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 350, y:9, z:356}, size:{x:10, y:14, z:2}, rotation:{x:0,y:0,z:0}}, world, scene);
    genTransparentWall({location:{x: 350, y:9, z:344}, size:{x:10, y:14, z:2}, rotation:{x:0,y:0,z:0}}, world, scene);

    objects.push(genWall3({location:{x:26,y:6.1,z:48}, rotation:{x:0,y:0,z:0}, size:{x:4,y:4,z:4}}, world, scene));

    // Add small room
    objects.push(genSmallRoom({
        location: { x: 26, y: 0.2, z: 62 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: 2
    }, world, scene));

    const size = { x: 1.5, y: 0.3, z: 1.5 };

    const toyRoomTrigger = {
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


    toyRoomTrigger.mesh.position.set(26, 1.5, 62);
    toyRoomTrigger.body.position.copy(toyRoomTrigger.mesh.position);
    scene.add(toyRoomTrigger.mesh);
    world.addBody(toyRoomTrigger.body);
    objects.push(toyRoomTrigger);

    // setupToyStory(objects, playerBody, world, scene, camera, controls);
    let toyStoryLoaded = false;
    // 콜리전 이벤트로 setupToyStory 호출
    toyRoomTrigger.body.addEventListener('collide', async function(e) {
        if (e.body === playerBody && !toyStoryLoaded) {
            await setupToyStory(objects, playerBody, world, scene, camera, controls);
            toyStoryLoaded = true;
            playerBody.position.set(8, 7, -4); 
            playerBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
        
        }
    });

    let res7 = await genDoor1({
        location: { x: 26, y: 2.15, z: 74 },
        rotation: { x: Math.PI/2, y: 0, z: -Math.PI },
        scale: 5,
    }, world, scene);
    objects.push(res7);

    setupAutoDoor(res7, playerBody, mixers, true);

}

export async function setupEnd(objects, playerBody, world, scene, camera, controls) {
    const offset = { x: 26, y: 0, z: 94 };
    const yRotation = -Math.PI / 2;

    function rotateAndTranslate(pos) {
        // y축 기준 -90도 회전 후 평행이동
        return {
            x: pos.z + offset.x,
            y: pos.y + offset.y,
            z: -pos.x + offset.z,
        };
    }

// 회전 및 이동된 바닥 생성
    objects.push(
        genFloor2({
            location: rotateAndTranslate({ x: 0, y: 0.05, z: 0 }),
            size: { x: 40, y: 0.1, z: 20 },
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene)
    );
    objects.push(
        genFloor2({
            location: rotateAndTranslate({ x: 0, y: 8.1, z: 0 }),
            size: { x: 40, y: 0.1, z: 20 },
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene)
    );

// 회전 및 이동된 조명 생성
    objects.push(
        await genLight1({
            location: rotateAndTranslate({ x: 8, y: 8, z: 0 }),
            scale: 1,
            rotation: { x: Math.PI, y: yRotation, z: 0 },
        }, world, scene)
    );

    const pointLight = new THREE.PointLight(0xffffff, 2.5, 10);
    const lightPos = rotateAndTranslate({ x: 8, y: 7.5, z: 0 });
    pointLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    scene.add(pointLight);

// 벽 정의 배열
    const wallDefs = [
        { location: {x:2, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:2, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:-2, y:4.1, z:-2.05}, size:{x:4, y:8, z:0.1} },
        { location: {x:-2, y:4.1, z:2.05}, size:{x:4, y:8, z:0.1} },
        { location: {x:3.95, y:4.1, z:0}, size:{x:0.1, y:8, z:4} },
        { location: {x:8, y:4.1, z:-6.05}, size:{x:8, y:8, z:0.1} },
        { location: {x:8, y:4.1, z:6.05}, size:{x:8, y:8, z:0.1} },
        { location: {x:14, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:14, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:18, y:4.1, z:-4}, size:{x:4, y:8, z:4} },
        { location: {x:18, y:4.1, z:4}, size:{x:4, y:8, z:4} },
        { location: {x:19.95, y:6.1, z:0}, size:{x:0.1, y:4, z:4} },
    ];

// 회전 및 이동된 벽들 생성
    for (const wall of wallDefs) {
        const loc = rotateAndTranslate(wall.location);
        objects.push(genWall3({
            location: loc,
            size: wall.size,
            rotation: { x: 0, y: yRotation, z: 0 },
        }, world, scene));
    }

    objects.push(genWall3({location:{x:26,y:6.1,z:48}, rotation:{x:0,y:0,z:0}, size:{x:4,y:4,z:4}}, world, scene));
}

export function setupInteract(camera, controls, objects) {
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
            if (!obj || !obj.mesh) continue;

            const objectPosition = new THREE.Vector3().copy(obj.mesh.position);
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

function setupAutoDoor(res, playerBody, mixers, reverse=false) {
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

        res.mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -Math.PI/2);
        res.mesh.rotateOnAxis(new THREE.Vector3(0, 0, -1), -Math.PI/2);
        const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(res.mesh.quaternion).normalize();
        res.mesh.rotateOnAxis(axis, +Math.PI / 2);

            openAction.reset().setLoop(THREE.LoopOnce);
            openAction.clampWhenFinished = true;
            openAction.play();

            res.body.collisionResponse = false;
        }

        // 🔒 문 닫기: 앞에서 접근 & 이미 열렸고 아직 닫히지 않음
        if (!reverse && facing < 0 && !isClosed && isOpen && distance > 3) {
            isClosed = true;

            openAction.stop();
            closeAction.reset().setLoop(THREE.LoopOnce);
            closeAction.clampWhenFinished = true;
            closeAction.play();

            res.body.collisionResponse = true;
        } else if (reverse && facing > 0 && !isClosed && isOpen && distance > 3) {
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

function setupPlateDoorInteraction(plate, door, playerBody, mixers, world, scene, objects) {
    const mixer = new THREE.AnimationMixer(door.mesh);
    const openAction = mixer.clipAction(door.animations[12]); // 문 열기
    const closeAction = mixer.clipAction(door.animations[11]); // 문 닫기

    let isOpen = false;
    let isRot = false;
    let isDone = false;

    const plateSize = 1.0; // 감지 범위 (plate 중심에서 좌우로 얼마나 체크할지)
    const doorForward = new THREE.Vector3(0, 1, 0).applyQuaternion(door.mesh.quaternion).normalize();

    function update(delta) {
        mixer.update(delta);
        if(isDone) return;

        const doorPos = door.body.position;
        const playerPos = playerBody.position;

        const toPlayer = new THREE.Vector3(
            playerPos.x - doorPos.x,
            playerPos.y - doorPos.y,
            playerPos.z - doorPos.z
        );

        const distance = toPlayer.length();
        const direction = toPlayer.clone().normalize();
        const facing = doorForward.dot(direction); // >0: 앞, <0: 뒤

        // plate 위에 물체가 있는지 검사
        const platePos = plate.body.position;

        // 🔒 문 닫기: 앞에서 접근 & 이미 열렸고 아직 닫히지 않음
        if (facing > 0  && isOpen && distance > 3) {
            isDone = true;

            openAction.stop();
            closeAction.reset().setLoop(THREE.LoopOnce);
            closeAction.clampWhenFinished = true;
            closeAction.play();

            door.body.collisionResponse = true;
            for (let i = objects.length - 1; i >= 0; i--) {
                if (objects[i].inStage1) {
                    scene.remove(objects[i].mesh);
                    if(objects[i].body) world.removeBody(objects[i].body);
                    objects.splice(i, 1);
                }
            }
        }

        // 전역에서 접근 가능한 모든 물리 객체 중 plate 위에 있는지 검사
        // 단순 예시로 `world.bodies`를 사용한다고 가정
        let objectOnPlate = false;
        for (const body of world.bodies) {
            if (body === plate.body || body === door.body) continue;

            const pos = body.position;
            const dx = pos.x - platePos.x;
            const dz = pos.z - platePos.z;
            const dy = pos.y - platePos.y;

            // plate 위 일정 범위 내에 있고, 약간 위에 있는 경우
            if (Math.abs(dx) < plateSize && Math.abs(dz) < plateSize && dy > 0 && dy < 1.5) {
                objectOnPlate = true;
                break;
            }
        }

        if (objectOnPlate && !isOpen) {
            isOpen = true;
            if(!isRot) {
                door.mesh.rotation.x -= Math.PI/2;
                isRot = true;
            }
            closeAction.stop();
            openAction.reset().setLoop(THREE.LoopOnce);
            openAction.clampWhenFinished = true;
            openAction.play();
            door.body.collisionResponse = false;
        }

        if (!objectOnPlate && isOpen) {
            isOpen = false;
            openAction.stop();
            closeAction.reset().setLoop(THREE.LoopOnce);
            closeAction.clampWhenFinished = true;
            closeAction.play();
            door.body.collisionResponse = true;
        }
    }

    // animate 루프에서 호출될 수 있도록 등록
    mixers.push({ update });
}

export function setupClickMarker(scene, camera, controls) {
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

export function setupCubeEliminator(objects) {
    cubes = objects.filter(obj => obj && obj.mesh && obj.mesh.name === "cube");
    lazer = objects.filter(obj => obj && obj.mesh && obj.mesh.name === "lazer");
}

export function eliminateCube() {
    cubes.forEach(cube => {
        const cubeBox = new THREE.Box3().setFromObject(cube.mesh);
        const lazerBox = new THREE.Box3().setFromObject(lazer[0].mesh);

        if(cubeBox.intersectsBox(lazerBox)) cube.body.position.set(30, 7, -4);
    });
}