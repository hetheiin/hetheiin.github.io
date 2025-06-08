import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');
gltfLoader.setDRACOLoader(dracoLoader);
const loader = new THREE.TextureLoader();
const defaultColor = 0xdddddd;

function resolveMaterial({ texture, color }) {
    if (texture) {
        return new THREE.MeshLambertMaterial({
            map: typeof texture === 'string' ? loader.load(texture) : texture
        });
    }
    return new THREE.MeshLambertMaterial({ color: color ?? defaultColor });
}

export function createCube({ location, size, rotation, texture, color, isFixed, mass }, world, scene) {
    const halfExtents = new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2);
    const shape = new CANNON.Box(halfExtents);
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    return createMeshAndBody({ shape, geometry, location, rotation, texture, color, isFixed, mass }, world, scene);
}

export function createSphere({ location, size, rotation, texture, color, isFixed, mass }, world, scene) {
    const shape = new CANNON.Sphere(size.x);
    const geometry = new THREE.SphereGeometry(size.x, 32, 32);
    return createMeshAndBody({ shape, geometry, location, rotation, texture, color, isFixed, mass }, world, scene);
}

export function createCylinder({ location, size, rotation, texture, color, isFixed, mass }, world, scene) {
    const shape = new CANNON.Cylinder(size.x, size.x, size.y, 32);
    const geometry = new THREE.CylinderGeometry(size.x, size.x, size.y, 32);
    return createMeshAndBody({ shape, geometry, location, rotation, texture, color, isFixed, mass }, world, scene);
}

function createMeshAndBody({ shape, geometry, location, rotation, texture, color, isFixed, mass }, world, scene) {
    const mat = resolveMaterial({ texture, color });
    const fixedMass = isFixed ? 0 : (mass ?? 1);

    const body = new CANNON.Body({ mass: fixedMass });
    body.addShape(shape);
    body.position.set(location.x, location.y, location.z);
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(location.x, location.y, location.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    return { body, mesh };
}

export async function createCube2({ location, scale, rotation, texture, isFixed, mass }, world, scene) {
    // 1. GLB 로드
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(texture, resolve, undefined, reject);
    });

    const model = gltf.scene;

    // 2. 원본 크기 계산
    const originalBox = new THREE.Box3().setFromObject(model);
    const originalSize = new THREE.Vector3();
    originalBox.getSize(originalSize);

    // 3. 전체 스케일 비율 계산
    const maxAxis = Math.max(originalSize.x, originalSize.y, originalSize.z);
    const uniformScale = scale / maxAxis;
    model.scale.setScalar(uniformScale);

    // 4. 위치, 회전, 그림자 처리
    model.position.set(location.x, location.y, location.z);
    model.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    scene.add(model);

    // 5. 스케일 적용 후 실제 크기 계산
    const finalBox = new THREE.Box3().setFromObject(model);
    const finalSize = new THREE.Vector3();
    finalBox.getSize(finalSize);

    // 6. 물리 shape과 body 생성
    const shape = new CANNON.Box(new CANNON.Vec3(
        finalSize.x / 2,
        finalSize.y / 2,
        finalSize.z / 2
    ));

    const body = new CANNON.Body({
        mass: isFixed ? 0 : (mass ?? 1),
        position: new CANNON.Vec3(location.x, location.y, location.z)
    });
    body.addShape(shape);
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    let res = { mesh: model, body };

    if(gltf.animations && gltf.animations.length) {
        res.animations = gltf.animations;
    }

    return res;
}

export async function createCylinder2({ location, scale, rotation, texture, isFixed, mass }, world, scene) {
    // 1. GLB 로드
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(texture, resolve, undefined, reject);
    });

    const model = gltf.scene;

    // 2. 원본 크기 계산
    const originalBox = new THREE.Box3().setFromObject(model);
    const originalSize = new THREE.Vector3();
    originalBox.getSize(originalSize);

    // 3. 전체 스케일 비율 계산
    const maxAxis = Math.max(originalSize.x, originalSize.y, originalSize.z);
    const uniformScale = scale / maxAxis;
    model.scale.setScalar(uniformScale);

    // 4. 위치, 회전, 그림자 처리
    model.position.set(location.x, location.y, location.z);
    model.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    scene.add(model);

    // 5. 스케일 적용 후 실제 크기 계산
    const finalBox = new THREE.Box3().setFromObject(model);
    const finalSize = new THREE.Vector3();
    finalBox.getSize(finalSize);

    // 6. 물리 shape과 body 생성 (Cylinder는 높이: y축, 반지름: x,z 평균)
    const radiusTop = (finalSize.x + finalSize.z) / 4;
    const radiusBottom = radiusTop;
    const height = finalSize.y;

    // model location 보정
    model.position.set(location.x, location.y - height/2, location.z);

    const shape = new CANNON.Cylinder(radiusTop, radiusBottom, height, 32);

    const body = new CANNON.Body({
        mass: isFixed ? 0 : (mass ?? 1),
        position: new CANNON.Vec3(location.x, location.y, location.z)
    });
    body.addShape(shape);
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);

    world.addBody(body);

    return { mesh: model, body };
}

export async function createSphere2({ location, scale, rotation, texture, isFixed, mass }, world, scene) {
    // 1. GLB 로드
    const gltf = await new Promise((resolve, reject) => {
        gltfLoader.load(texture, resolve, undefined, reject);
    });

    const model = gltf.scene;

    // 2. 원본 크기 계산
    const originalBox = new THREE.Box3().setFromObject(model);
    const originalSize = new THREE.Vector3();
    originalBox.getSize(originalSize);

    // 3. 전체 스케일 비율 계산
    const maxAxis = Math.max(originalSize.x, originalSize.y, originalSize.z);
    const uniformScale = scale / maxAxis;
    model.scale.setScalar(uniformScale);

    // 4. 위치, 회전, 그림자 처리
    model.position.set(location.x, location.y, location.z);
    model.traverse(obj => {
        if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    scene.add(model);

    // 5. 스케일 적용 후 실제 크기 계산
    const finalBox = new THREE.Box3().setFromObject(model);
    const finalSize = new THREE.Vector3();
    finalBox.getSize(finalSize);

    // 6. 구 반지름 계산 (가장 큰 축의 절반)
    const radius = Math.max(finalSize.x, finalSize.y, finalSize.z) / 2;

    // 7. Cannon 구 생성
    const shape = new CANNON.Sphere(radius);

    const body = new CANNON.Body({
        mass: isFixed ? 0 : (mass ?? 1),
        position: new CANNON.Vec3(location.x, location.y, location.z)
    });

    body.addShape(shape);
    body.quaternion.setFromEuler(rotation.x, rotation.y, rotation.z);
    model.rotation.set(rotation.x, rotation.y, rotation.z);
    world.addBody(body);

    return { mesh: model, body };
}