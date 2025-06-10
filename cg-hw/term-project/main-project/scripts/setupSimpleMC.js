import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import {genCherryLeaf, genCherryLog, genCraftingTable, genDirt, genGrass} from "./genObject.js";
import {getPointerLockChange} from "../main.js";

const textureLoader = new THREE.TextureLoader();
const destroyStages = [];

let breaking = false;
let breakTarget = null;
let breakOverlay = null;
let breakProgress = 0;
let breakTimer = 0;

let objects = [];

const light = new THREE.DirectionalLight(0xffffff, 0.6); // 색상, 세기
light.position.set(0, 10, 20); // 빛의 방향 결정
light.castShadow = true;

let hotbarUI = null;
let currentHotbarIndex = 0;
let enablePlace = false;

const pickupDistance = 1.5; // 거리 기준
const hotbarSize = 9;
const hotbarObjects = Array.from({ length: hotbarSize }, () => []);

const iconMap = {
    "cobblestone": "assets/cobblestone.png",
    "dirt": "assets/dirt.png",
    "grass": "assets/grass_block_side.png",
    "cherry_log": "assets/cherry_log.png",
    "cherry_leaf": "assets/cherry_leaves.png",
    "cherry_plank": "assets/cherry_planks.png",
    "crafting_table": "assets/crafting_table_front.png",
};

for (let i = 0; i <= 9; i++) {
    const tex = textureLoader.load(`assets/destroy_stage_${i}.png`);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    destroyStages.push(tex);
}

export function enterToMCWorld(playerBody, scene) {
    const loader = new THREE.CubeTextureLoader();
    const skybox = loader.load([
        'assets/px.png',
        'assets/nx.png',
        'assets/py.png',
        'assets/ny.png',
        'assets/pz.png',
        'assets/nz.png'
    ]);
    scene.background = skybox;
    scene.add(light);
    playerBody.position.set(347,8,347);
    showHotbar();
    enablePlace = true;
}

export function exitFromMCWorld(playerBody, scene) {
    scene.background = null;
    scene.remove(light);
    playerBody.position.set(26,5,36);
    hideHotbar();
    enablePlace = false;
}

function showHotbar() {
    hotbarUI.style.display = "flex";
    selectHotbarSlot(0);
}

function hideHotbar() {
    hotbarUI.style.display = "none";
}

export function selectHotbarSlot(index) {
    document.querySelectorAll('.hotbar-slot').forEach((slot, i) => {
        if (i === index) slot.classList.add('selected');
        else slot.classList.remove('selected');
    });
}

function raycastToBlock(camera, controls, maxDistance = 5) {
    let blocks = objects.filter(object => object.isBreakable);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const raycaster = new THREE.Raycaster();
    raycaster.set(controls.getObject().position, direction);

    // 블럭들의 THREE.Mesh 배열만 추출
    const meshes = blocks.map(block => block.mesh);

    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length === 0) return null;

    const first = intersects[0];

    if (first.distance > maxDistance) return null;

    // 해당 블럭 정보 반환 (mesh 기준으로 blocks에서 검색)
    const target = blocks.find(block => block.mesh === first.object);

    return target || null;
}

function createDestroyOverlay(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);

    const geometry = new THREE.BoxGeometry(size.x + 0.01, size.y + 0.01, size.z + 0.01);
    const material = new THREE.MeshBasicMaterial({
        map: destroyStages[0],
        transparent: true,
        depthWrite: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 999;  // 항상 위에 보이도록
    return mesh;
}

export function updateBreaking(deltaTime, camera, controls, scene, world) {
    let blocks = objects.filter(object => object.isBreakable);

    deltaTime /= 1000;
    if (!breaking) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const raycaster = new THREE.Raycaster();
    raycaster.set(controls.getObject().position, direction);

    const intersects = raycaster.intersectObjects(blocks.map(b => b.mesh));

    if (intersects.length === 0 || intersects[0].distance > 5) {
        cancelBreaking(scene);
        return;
    }

    const targetMesh = intersects[0].object;
    if (targetMesh !== breakTarget) {
        cancelBreaking(scene);
        return;
    }

    breakTimer += deltaTime;
    if (breakTimer >= 0.2) {
        breakTimer = 0;
        breakProgress++;

        if (breakProgress >= 10) {
            // 파괴
            scene.remove(breakOverlay);
            const object = blocks.find(b => b.mesh === targetMesh);
            dropItem(object, world, scene);
            cancelBreaking(scene);
            return;
        }

        breakOverlay.material.map = destroyStages[breakProgress];
        breakOverlay.material.needsUpdate = true;
    }
}

function startBreaking(target, scene) {
    breaking = true;
    breakTarget = target.mesh;
    breakProgress = 0;
    breakTimer = 0;

    breakOverlay = createDestroyOverlay(target.mesh);
    breakOverlay.position.copy(target.mesh.position);
    scene.add(breakOverlay);
}

function cancelBreaking(scene) {
    breaking = false;
    breakProgress = 0;
    breakTimer = 0;
    breakTarget = null;
    if (breakOverlay) {
        scene.remove(breakOverlay);
        breakOverlay = null;
    }
}

export function setupBreakingBlock(camera, controls, objects_origin, scene) {
    objects = objects_origin;
    window.addEventListener('mousedown', (event) => {
        if (event.button !== 0) return;
        const intersect = raycastToBlock(camera, controls);
        if (intersect) {
            startBreaking(intersect, scene);
        }
    });

    window.addEventListener('mouseup', (event) => {
        if (event.button !== 0) return;
        cancelBreaking(scene);
    });
}

function dropItem(object, world, scene) {
    const { mesh, body } = object;

    // 메쉬 스케일 줄이기
    const shrinkFactor = 0.3;
    mesh.scale.set(shrinkFactor, shrinkFactor, shrinkFactor);

    // 위치 계산 (축소된 메쉬에 맞춰서)
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // 새 물리 바디 만들기
    const shape = new CANNON.Box(
        new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    );
    const newBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(center.x, center.y, center.z),
        shape: shape
    });

    // 랜덤 회전과 튀는 힘 부여
    newBody.velocity.set(
        (Math.random() - 0.5),
        2,
        (Math.random() - 0.5)
    );

    // 그림자 유지
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // 새 바디와 메쉬 연결

    // 기존 물리 바디 제거
    world.removeBody(body);
    world.addBody(newBody);
    object.body = newBody;
    object.isFixed = false;
    object.isBreakable = false;
    object.isDropped = true;
}

function setupHotbar() {
    hotbarUI = document.createElement('div');
    hotbarUI.id = 'hotbar';

    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'hotbar-slot';
        slot.dataset.index = i;

        const item = document.createElement('img');
        item.className = 'hotbar-item';
        item.style.display = 'none'; // 아이템 없을 때는 안 보이게
        slot.appendChild(item);

        hotbarUI.appendChild(slot);
    }

    document.body.appendChild(hotbarUI);

    document.addEventListener('wheel', (e) => {
        const delta = Math.sign(e.deltaY);
        if (delta > 0) {
            // 휠 아래 → 다음 슬롯
            currentHotbarIndex = (currentHotbarIndex + 1) % 9;
        } else if (delta < 0) {
            // 휠 위 → 이전 슬롯
            currentHotbarIndex = (currentHotbarIndex + 8) % 9;  // -1의 mod 9
        }
        selectHotbarSlot(currentHotbarIndex);
    });

    document.addEventListener('keydown', e => {
        if (e.key >= '1' && e.key <= '9') {
            selectHotbarSlot(parseInt(e.key) - 1);
        }
    });
}

export function setupSimpleMCWorld(location, objects, world, scene, camera, playerBody, controls) {
    const worldWidth = 10;
    const worldDepth = 10;
    const blockSize = { x: 1, y: 1, z: 1 };
    const baseHeight = 1;

    const heightMap = [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 2],
        [3, 3, 3, 3, 3, 3, 3, 2, 2, 2],
        [3, 3, 3, 3, 2, 2, 2, 2, 2, 1],
        [3, 3, 3, 2, 2, 2, 2, 2, 1, 1],
        [3, 2, 2, 2, 2, 2, 2, 1, 1, 1],
        [3, 2, 2, 2, 2, 1, 1, 1, 1, 1],
        [3, 2, 2, 2, 2, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 1, 1, 1, 1, 1, 1, 1],
    ];

    for (let x = 0; x < worldWidth; x++) {
        for (let z = 0; z < worldDepth; z++) {
            const height = heightMap[x][z];
            for (let y = 0; y < height; y++) {
                const blockLocation = {
                    x: location.x + x * blockSize.x,
                    y: location.y + y * blockSize.y,
                    z: location.z + z * blockSize.z,
                };

                if (y < height - 1) {
                    objects.push(genDirt({ location: blockLocation, size: blockSize, rotation: { x: 0, y: 0, z: 0 } }, world, scene));
                } else {
                    objects.push(genGrass({ location: blockLocation, size: blockSize, rotation: { x: 0, y: 0, z: 0 } }, world, scene));
                }
            }
        }
    }

    objects.push(genCraftingTable({ location: {x:location.x+3,y:location.y+2,z:location.z+5}, size: {x:1,y:1,z:1}, rotation: { x: 0, y: 0, z: 0 } }, world, scene));

    // 2. 나무 생성
    const treeX = 6;
    const treeZ = 3;
    const groundHeight = heightMap[treeX][treeZ];
    const treeBaseY = location.y + groundHeight;
    const treeHeight = 4;

    // 줄기
    for (let y = 0; y < treeHeight; y++) {
        objects.push(genCherryLog({
            location: {
                x: location.x + treeX,
                y: treeBaseY + y,
                z: location.z + treeZ,
            },
            size: blockSize,
            rotation: { x: 0, y: 0, z: 0 },
        }, world, scene));
    }

    // 잎
    const leafLayerOffsets = [
        { dy: 0, radius: 2, skipCenter: true },  // 줄기 최상단 레벨 (중앙은 줄기니까 제외)
        { dy: 1, radius: 2, skipCenter: false }, // 그 위
        { dy: 2, radius: 1, skipCenter: false }, // 그 위
        { dy: 3, radius: 1, skipCenter: false }, // 맨 위
    ];

    for (const { dy, radius, skipCenter } of leafLayerOffsets) {
        const leafY = treeBaseY + treeHeight - 1 + dy;
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                if (skipCenter && dx === 0 && dz === 0) continue;

                objects.push(genCherryLeaf({
                    location: {
                        x: location.x + treeX + dx,
                        y: leafY,
                        z: location.z + treeZ + dz,
                    },
                    size: blockSize,
                    rotation: { x: 0, y: 0, z: 0 },
                }, world, scene));
            }
        }
    }

    setupHotbar();
    window.addEventListener('click', e => {
        if(e.button !== 2) return;
        e.preventDefault();
        placeBlockOnRightClick(camera, playerBody, controls, world, scene);
    });
}

export function checkPickup(playerBody, world, scene) {
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        if (!obj.isDropped) continue;

        const dist = playerBody.position.distanceTo(obj.body.position);
        if (dist <= pickupDistance) {
            // 핫바 슬롯 찾기 (같은 종류가 있으면 같은 슬롯에, 없으면 빈 슬롯)
            let slot = -1;

            // 같은 종류 찾기 (기본은 메쉬의 이름 기반)
            for (let j = 0; j < hotbarObjects.length; j++) {
                if (
                    hotbarObjects[j].length > 0 &&
                    hotbarObjects[j][0].mesh.name === obj.mesh.name
                ) {
                    slot = j;
                    break;
                }
            }

            // 없다면 빈 슬롯 찾기
            if (slot === -1) {
                for (let j = 0; j < hotbarObjects.length; j++) {
                    if (hotbarObjects[j].length === 0) {
                        slot = j;
                        break;
                    }
                }
            }

            // 슬롯이 있으면 획득
            if (slot !== -1) {
                // 1. 제거
                world.removeBody(obj.body);
                scene.remove(obj.mesh);
                objects.splice(i, 1);

                // 2. 등록
                hotbarObjects[slot].push(obj);

                // 3. UI 반영
                updateHotbarSlot(slot);

                // 4. 로그(디버그용)
                console.log(`Block picked up into slot ${slot}`);
            } else {
                // 슬롯이 없으면 무시
                console.log("No space in hotbar.");
            }
        }
    }
}

function updateHotbarSlot(index) {
    const slot = hotbarUI.childNodes[index];
    slot.innerHTML = "";

    const stack = hotbarObjects[index];
    if (stack.length === 0) return;

    const blockName = stack[0].mesh.name;
    const iconSrc = iconMap[blockName];

    if (!iconSrc) {
        console.warn(`No icon found for ${blockName}`);
        return;
    }

    const icon = document.createElement("img");
    icon.src = iconSrc;
    icon.className = "hotbar-item";
    slot.appendChild(icon);

    if (stack.length > 1) {
        const count = document.createElement("div");
        count.className = "hotbar-count";
        count.innerText = stack.length;
        slot.appendChild(count);
    }
}

function placeBlockOnRightClick(camera, playerBody, controls, world, scene) {
    if(!enablePlace) return;

    let blocks = objects.filter(object => object.isBreakable);
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const raycaster = new THREE.Raycaster();
    raycaster.set(controls.getObject().position, direction);

    // 블럭들의 THREE.Mesh 배열만 추출
    const meshes = blocks.map(block => block.mesh);

    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
        const intersect = intersects.find(i => i.object.name && i.object.name !== 'player');
        if (!intersect) return;

        const targetMesh = intersect.object;
        const targetPos = intersect.point;
        const targetNormal = intersect.face.normal;

        // 플레이어와 거리 제한
        const distance = playerBody.position.distanceTo(targetPos);
        if (distance > 4) return;
        if (intersect.object.name === "crafting_table") {
            document.onpointerlockchange = null;
            controls.enabled = false;
            unlockPointer(); // 마우스 포인터 해제
            displayCraftUI(controls); // 제작 UI 표시
            return; // 블럭 설치는 하지 않음
        }

        // 설치 위치 계산 (face normal 기준 offset)
        const offset = targetNormal.clone().multiplyScalar(1);
        const newPos = new THREE.Vector3().copy(targetMesh.position).add(offset);

        // 설치할 오브젝트 꺼내기
        const stack = hotbarObjects[currentHotbarIndex];
        if (!stack || stack.length === 0) return;

        const placedObj = stack.pop();

        // 위치 설정
        placedObj.mesh.position.copy(newPos);
        placedObj.mesh.scale.set(1, 1, 1); // scale 복원
        placedObj.mesh.rotation.set(0, 0, 0);

        // 실제 mesh 크기 계산
        const box = new THREE.Box3().setFromObject(placedObj.mesh);
        const size = new THREE.Vector3();
        box.getSize(size);

        // CANNON body도 다시 만들어야 정확
        world.removeBody(placedObj.body);
        placedObj.body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(newPos.x, newPos.y, newPos.z),
            shape: new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2))
        });
        world.addBody(placedObj.body);

        scene.add(placedObj.mesh);

        // objects 배열에 다시 등록
        placedObj.isDropped = false;
        objects.push(placedObj);

        // hotbar UI 갱신
        updateHotbarSlot(currentHotbarIndex);

        placedObj.isFixed = true;
        placedObj.isBreakable = true;

        console.log("Block placed!");
    }
}

function displayCraftUI(controls) {
    const ui = document.getElementById('crafting-ui');
    if (!ui) return;
    ui.style.display = 'block';

    // ESC 키를 누르면 UI 닫고 포인터 재잠금
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            hideCraftUI();
            document.removeEventListener('keydown', escHandler);
            document.onpointerlockchange = getPointerLockChange()
            controls.enabled = true;
        }
    };
    document.addEventListener('keydown', escHandler);
}

function hideCraftUI() {
    const ui = document.getElementById('crafting-ui');
    if (!ui) return;
    ui.style.display = 'none';

    // 다시 포인터 잠금
    const canvas = document.body;
    if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
    }
}

function unlockPointer() {
    if (document.exitPointerLock) {
        document.exitPointerLock();
    }
}