import { createCube, createCylinder, createSphere, createCube2, createCylinder2, createSphere2 } from "./createPrimitive.js";
import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

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

    const metalMaterial = new THREE.MeshStandardMaterial({
        map: texture,         // 색상 텍스처
        metalness: 0.4,         // 금속성 1.0 = 완전 금속
        roughness: 0.6,         // 낮을수록 반짝임이 강함
        envMapIntensity: 1.0    // 환경 맵이 있을 경우 반사 강도
    });

    res.mesh.material.dispose();
    res.mesh.material = metalMaterial;

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

    const metalMaterial = new THREE.MeshStandardMaterial({
        map: texture,         // 색상 텍스처
        metalness: 0.4,         // 금속성 1.0 = 완전 금속
        roughness: 0.6,         // 낮을수록 반짝임이 강함
        envMapIntensity: 1.0    // 환경 맵이 있을 경우 반사 강도
    });

    res.mesh.material.dispose();
    res.mesh.material = metalMaterial;

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
    res.mesh.name = "wall_black";

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
    res.mesh.name = "wall_black";

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
    res.mesh.name = "wall_black";

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
    res.mesh.name = "cube";
    return {body: res.body, mesh: res.mesh};
}

export async function genSmallRoom({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/smallRoom.glb',
        isFixed: true,
        mass: 5*scale*scale,
    }, world, scene);
    res.mesh.name = "cube";
    return {body: res.body, mesh: res.mesh};
}

export async function genRubixsCube({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/rubixsCube.glb',
        isFixed: false,
        mass: 5*scale*scale,
    }, world, scene);
    res.mesh.name = "cube";
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
    res.mesh.name = "wall_black";

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

export function genPoster1({ location, scale, rotation }, world, scene) {
    const textureLoader = new THREE.TextureLoader();
    const posterTexture = textureLoader.load('assets/poster1.jpg'); // 네 포스터 이미지 경로

    const posterMaterial = new THREE.MeshBasicMaterial({ map: posterTexture });
    const posterGeometry = new THREE.PlaneGeometry(2, 3);

    const poster = new THREE.Mesh(posterGeometry, posterMaterial);

    poster.scale.set(scale, scale);
    poster.rotation.set(rotation.x, rotation.y, rotation.z);
    poster.name = "minecraft_poster";
    poster.position.set(location.x, location.y, location.z);
    scene.add(poster);

    return {mesh:poster};
}

export function genPoster2({ location, scale, rotation }, world, scene) {
    const textureLoader = new THREE.TextureLoader();
    const posterTexture = textureLoader.load('assets/poster2.jpg'); // 네 포스터 이미지 경로

    const posterMaterial = new THREE.MeshBasicMaterial({ map: posterTexture });
    const posterGeometry = new THREE.PlaneGeometry(2, 3);

    const poster = new THREE.Mesh(posterGeometry, posterMaterial);

    poster.scale.set(scale, scale);
    poster.rotation.set(rotation.x, rotation.y, rotation.z);
    poster.name = "portal_poster";
    poster.position.set(location.x, location.y, location.z);
    scene.add(poster);

    return {mesh:poster};
}

export function genCobblestone({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/cobblestone.png');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);
    res.mesh.castShadow = true;
    res.mesh.receiveShadow = true;
    res.mesh.name = "cobblestone";
    return {body: res.body, mesh: res.mesh, isFixed: true, isBreakable: false};
}

export function genDirt({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/dirt.png');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);
    res.mesh.castShadow = true;
    res.mesh.receiveShadow = true;
    res.mesh.name = "dirt";
    return {body: res.body, mesh: res.mesh, isFixed: true, isBreakable: true};
}

export function genGrass({ location, size, rotation }, world, scene) {
    const texTop = textureLoader.load('assets/grass_block_top.png');
    const texSide = textureLoader.load('assets/grass_block_side.png');
    const texBottom = textureLoader.load('assets/dirt.png');

    // 픽셀 아트처럼 보이게 설정
    for (const tex of [texTop, texSide, texBottom]) {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
    }

    // 6면에 대한 재질 설정: [right, left, top, bottom, front, back]
    const materials = [
        new THREE.MeshLambertMaterial({ map: texSide }),  // right
        new THREE.MeshLambertMaterial({ map: texSide }),  // left
        new THREE.MeshLambertMaterial({ map: texTop, color: 0x55cc55 }),   // top
        new THREE.MeshLambertMaterial({ map: texBottom }),// bottom
        new THREE.MeshLambertMaterial({ map: texSide }),  // front
        new THREE.MeshLambertMaterial({ map: texSide }),  // back
    ];

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(location.x, location.y, location.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);

    // 물리 바디는 createCube로 생성
    const res = createCube({
        location,
        size,
        rotation,
        isFixed: true,
        texture: null,  // 실제 텍스처는 우리가 수동으로 입혔으므로 null
        color: defaultColor,
        mass: 0
    }, world, scene);

    // 기본 mesh를 우리가 만든 것으로 교체
    res.mesh.geometry = geometry;
    res.mesh.material = materials;

    res.mesh.castShadow = true;
    res.mesh.receiveShadow = true;
    res.mesh.name = "grass";

    return {
        body: res.body,
        mesh: res.mesh,
        isFixed: true, isBreakable: true
    };
}

export function genCherryLog({ location, size, rotation }, world, scene) {
    const texTop = textureLoader.load('assets/cherry_log_top.png');
    const texSide = textureLoader.load('assets/cherry_log.png');

    // 픽셀 아트처럼 보이게 설정
    for (const tex of [texTop, texSide]) {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
    }

    // 6면에 대한 재질 설정: [right, left, top, bottom, front, back]
    const materials = [
        new THREE.MeshLambertMaterial({ map: texSide }),  // right
        new THREE.MeshLambertMaterial({ map: texSide }),  // left
        new THREE.MeshLambertMaterial({ map: texTop }),   // top
        new THREE.MeshLambertMaterial({ map: texTop }),// bottom
        new THREE.MeshLambertMaterial({ map: texSide }),  // front
        new THREE.MeshLambertMaterial({ map: texSide }),  // back
    ];

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(location.x, location.y, location.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);

    // 물리 바디는 createCube로 생성
    const res = createCube({
        location,
        size,
        rotation,
        isFixed: true,
        texture: null,  // 실제 텍스처는 우리가 수동으로 입혔으므로 null
        color: defaultColor,
        mass: 0
    }, world, scene);

    // 기본 mesh를 우리가 만든 것으로 교체
    res.mesh.geometry = geometry;
    res.mesh.material = materials;
    res.mesh.name = "cherry_log";
    res.mesh.receiveShadow = true;
    res.mesh.castShadow = true;

    return {
        body: res.body,
        mesh: res.mesh,
        isFixed: true, isBreakable: true
    };
}

export function genCherryLeaf({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/cherry_leaves.png');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);

    res.mesh.material = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
    });

    res.mesh.castShadow = true;
    res.mesh.receiveShadow = true;
    res.mesh.name = "cherry_leaf";

    return {body: res.body, mesh: res.mesh, isFixed: true, isBreakable: true};
}

export function genCherryPlank({location, size, rotation}, world, scene) {
    const texture = textureLoader.load('assets/cherry_planks.png');
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    const res =  createCube({
            location: location,
            size: size,
            rotation: rotation,
            isFixed: true,
            texture: texture,
            color: defaultColor,
            mass: 0},
        world, scene);

    res.mesh.castShadow = true;
    res.mesh.receiveShadow = true;
    res.mesh.name = "cherry_plank";

    return {body: res.body, mesh: res.mesh, isFixed: true, isBreakable: true};
}

export function genTransparentWall({ location, size, rotation }, world, scene) {
    // 1. THREE.js Mesh 생성
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    const material = new THREE.MeshStandardMaterial({
        color: 0x88ccff,       // 유리 느낌의 옅은 파란색
        transparent: true,
        opacity: 0,          // 투명도 조절 (0 완전 투명 ~ 1 불투명)
        roughness: 0.1,
        metalness: 0.0,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(location.x, location.y, location.z);

    if (rotation) {
        mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    scene.add(mesh);

    // 2. CANNON Body 생성
    const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
    const body = new CANNON.Body({
        mass: 0, // 고정된 벽
        shape: shape,
        position: new CANNON.Vec3(location.x, location.y, location.z),
    });

    if (rotation) {
        const quat = new CANNON.Quaternion();
        quat.setFromEuler(rotation.x, rotation.y, rotation.z, 'XYZ');
        body.quaternion.copy(quat);
    }

    world.addBody(body);

    return {
        mesh: mesh,
        body: body,
        isFixed: true
    };
}

export function genCraftingTable({ location, size, rotation }, world, scene) {
    const texTop = textureLoader.load('assets/crafting_table_top.png');
    const texSide = textureLoader.load('assets/crafting_table_side.png');
    const texFront = textureLoader.load('assets/crafting_table_front.png');

    // 픽셀 아트처럼 보이게 설정
    for (const tex of [texTop, texSide, texFront]) {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
    }

    // 6면에 대한 재질 설정: [right, left, top, bottom, front, back]
    const materials = [
        new THREE.MeshLambertMaterial({ map: texSide }),  // right
        new THREE.MeshLambertMaterial({ map: texSide }),  // left
        new THREE.MeshLambertMaterial({ map: texTop }),   // top
        new THREE.MeshLambertMaterial({ map: texTop }),// bottom
        new THREE.MeshLambertMaterial({ map: texFront }),  // front
        new THREE.MeshLambertMaterial({ map: texSide }),  // back
    ];

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(location.x, location.y, location.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);

    // 물리 바디는 createCube로 생성
    const res = createCube({
        location,
        size,
        rotation,
        isFixed: true,
        texture: null,  // 실제 텍스처는 우리가 수동으로 입혔으므로 null
        color: defaultColor,
        mass: 1
    }, world, scene);

    // 기본 mesh를 우리가 만든 것으로 교체
    res.mesh.geometry = geometry;
    res.mesh.material = materials;

    res.mesh.castShadow = true;
    res.mesh.receiveShadow = true;
    res.mesh.name = "crafting_table";

    return {
        body: res.body,
        mesh: res.mesh,
        isFixed: true, isBreakable: true
    };
}

export async function genWoodenStick({location, size, rotation}, world, scene) {
    const scale = size.x;
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/wooden_stick.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);
    res.mesh.name = "wooden_stick";
    res.body.collisionResponse = false;
    return {body: res.body, mesh: res.mesh};
}

export async function genWoodenPickaxe({location, size, rotation}, world, scene) {
    const scale = size.x;
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/wooden_pickaxe.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);
    res.mesh.name = "wooden_pickaxe";
    res.body.collisionResponse = false;
    return {body: res.body, mesh: res.mesh};
}

export async function genLazerField({location, scale, rotation}, world, scene) {
    const res = await createCube2({
        location: location,
        rotation: rotation,
        scale: scale,
        texture: 'assets/lazer_field.glb',
        isFixed: true,
        mass: 0,
    }, world, scene);

    return {body: res.body, mesh: res.mesh};
}

export function genLazer({ location, size, rotation }, world, scene) {
    // 1. Geometry
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    // 2. Material (붉은색, 약간 투명하게)
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
    });

    // 3. Mesh 생성
    const mesh = new THREE.Mesh(geometry, material);

    // 4. 위치 설정
    mesh.position.set(location.x, location.y, location.z);

    // 5. 회전 설정 (radians 단위)
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);

    // 6. 씬에 추가
    scene.add(mesh);
    mesh.name = "lazer";

    // 7. 반환
    return {
        mesh: mesh,
        body: null,
    };
}

export function genLazer2({ location, size, rotation }, world, scene) {
    // 1. Geometry
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    // 2. First Material (포탈용 흰색)
    const material1 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.01,
    });

    // 3. First Mesh
    const mesh1 = new THREE.Mesh(geometry, material1);
    mesh1.position.set(location.x, location.y, location.z);
    mesh1.rotation.set(rotation.x, rotation.y, rotation.z);
    scene.add(mesh1);

    // 4. Second Material (디버그용 다른 색깔)
    const material2 = new THREE.MeshBasicMaterial({
        color: 0x00ff00, // 원하는 색으로 변경 가능
        transparent: true,
        opacity: 0.3,
    });

    // 5. Second Mesh (겹치는 위치/회전 동일)
    const mesh2 = new THREE.Mesh(geometry.clone(), material2);
    mesh2.position.set(location.x, location.y, location.z);
    mesh2.rotation.set(rotation.x, rotation.y, rotation.z);
    scene.add(mesh2);

    // 6. 반환
    return {
        mesh: mesh1,   // 주 메쉬는 원래대로 반환
        body: null,
    };
}
