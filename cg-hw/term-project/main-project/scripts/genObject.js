import { createCube, createCylinder, createSphere, createCube2, createCylinder2, createSphere2 } from "./createPrimitive.js";
import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';

const textureLoader = new THREE.TextureLoader();
const defaultColor = 0xffffff;

function calcTextureRepeats(size) {
    // 1. size 값에서 가장 작은 축 구하기
    const minAxis = Math.min(size.x, size.y, size.z);

    // 2. 면을 이루는 두 축 구하기
    let repeatX = 1, repeatY = 1;

    if (minAxis === size.x) {
        // x축이 가장 짧다면, 벽은 y-z 평면
        repeatX = size.z;
        repeatY = size.y;
    } else if (minAxis === size.y) {
        // y축이 가장 짧다면, 벽은 x-z 평면
        repeatX = size.x;
        repeatY = size.z;
    } else {
        // z축이 가장 짧다면, 벽은 x-y 평면
        repeatX = size.x;
        repeatY = size.y;
    }
    return {repeatX, repeatY};
}

export function genWall1({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/wall1.jpg')

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/4);

    const res =  createCube({
        location: location,
        size: size,
        rotation: rotation,
        isFixed: true,
        texture: texture,
        color: defaultColor,
        mass: 0},
        world, scene);
    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export function genWall2({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/wall2.jpg')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/4);

    const res = createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);
    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export function genWall3({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/wall3.jpg')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/4);

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);

    const metalMaterial = new THREE.MeshStandardMaterial({
        map: texture,         // 색상 텍스처
        metalness: 0.6,         // 금속성 1.0 = 완전 금속
        roughness: 0.6,         // 낮을수록 반짝임이 강함
        envMapIntensity: 1.0    // 환경 맵이 있을 경우 반사 강도
    });

    res.mesh.material.dispose();
    res.mesh.material = metalMaterial;

    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export function genWall4({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/wall3.jpg')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/8);

    const res = createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);

    const metalMaterial = new THREE.MeshStandardMaterial({
        map: texture,         // 색상 텍스처
        metalness: 0.6,         // 금속성 1.0 = 완전 금속
        roughness: 0.6,         // 낮을수록 반짝임이 강함
        envMapIntensity: 1.0    // 환경 맵이 있을 경우 반사 강도
    });

    res.mesh.material.dispose();
    res.mesh.material = metalMaterial;

    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export function genWall5({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/wall4.jpg')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/4);

    const res = createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);

    const metalMaterial = new THREE.MeshStandardMaterial({
        map: texture,         // 색상 텍스처
        metalness: 0.6,         // 금속성 1.0 = 완전 금속
        roughness: 0.6,         // 낮을수록 반짝임이 강함
        envMapIntensity: 1.0    // 환경 맵이 있을 경우 반사 강도
    });

    res.mesh.material.dispose();
    res.mesh.material = metalMaterial;

    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export async function genCube1({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/cube.glb',
        isFixed: false,
        mass: 5*scale*scale,
    }, world, scene);
    return {body: res.body, mesh: res.mesh};
}

export async function genLight1({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/light1.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);
    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export async function genGelBlue({location, scale, rotation}, world, scene) {
    const res = await createCylinder2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/gel_blue.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);

    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export function genFloor1({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/floor1.jpg')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/4);

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);
    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export function genFloor2({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/floor2.jpg')
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let {repeatX, repeatY} = calcTextureRepeats(size);

    texture.repeat.set(repeatX/4, repeatY/4);

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);

    const metalMaterial = new THREE.MeshStandardMaterial({
        map: texture,         // 색상 텍스처
        metalness: 0.6,         // 금속성 1.0 = 완전 금속
        roughness: 0.6,         // 낮을수록 반짝임이 강함
        envMapIntensity: 1.0    // 환경 맵이 있을 경우 반사 강도
    });

    res.mesh.material.dispose();
    res.mesh.material = metalMaterial;

    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export async function genPlate1({location, scale, rotation}, world, scene) {
    const res = await createCylinder2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/button_weight.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);
    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export async function genDoor1({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/door1.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);

    res.mesh.position.y -= 2.8*res.body.shapes[0].halfExtents.y;

    return {body: res.body, mesh: res.mesh, isFixed: true, animations: res.animations};
}

export async function genGunPlate({location, scale, rotation}, world, scene) {
    const res = await createCylinder2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/pellet_catcher.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);

    return {body: res.body, mesh: res.mesh, isFixed: true};
}

export async function genPortalGun({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/hd_portal_gun3.glb',
        isFixed: false,
        mass: 0,
    }, world, scene);

    return res;
}

export function genConeLight({ location, destination, radius }, world, scene) {
    // 1. 거리 및 방향 계산
    const from = new THREE.Vector3(location.x, location.y, location.z);
    const to = new THREE.Vector3(destination.x, destination.y, destination.z);
    const direction = new THREE.Vector3().subVectors(to, from);
    const distance = direction.length();
    direction.normalize();

    // 2. SpotLight 생성
    const spotLight = new THREE.SpotLight(0xffdd99, 1, distance, Math.atan(radius / distance));
    spotLight.position.copy(from);

    // Spotlight의 target을 목적지로 설정
    const targetObject = new THREE.Object3D();
    targetObject.position.copy(to);
    scene.add(targetObject);
    spotLight.target = targetObject;

    scene.add(spotLight);

    // 3. Cone Mesh 생성
    const coneGeometry = new THREE.ConeGeometry(1, 1, 32, 1, true); // 정규화된 원뿔
    const coneMaterial = new THREE.MeshBasicMaterial({
        color: 0xffdd99,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        side: THREE.DoubleSide,
    });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);

    // 스케일 적용 (실제 크기 반영)
    coneMesh.scale.set(radius, distance, radius);

    // 위치 및 방향 설정
    coneMesh.position.copy(from.clone().add(to).multiplyScalar(0.5)); // 중간 지점
    coneMesh.lookAt(to); // 방향 맞추기
    coneMesh.rotateX(-Math.PI / 2); // Y축이 위이므로 X축 회전 필요

    scene.add(coneMesh);

    // 4. 반환
    return {
        mesh: coneMesh,
        light: spotLight
    };
}