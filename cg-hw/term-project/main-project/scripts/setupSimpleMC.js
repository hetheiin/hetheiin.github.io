import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';
import {genCherryLeaf, genCherryLog, genCherryPlank, genCraftingTable, genDirt, genGrass, genWoodenPickaxe, genWoodenStick} from "./genObject.js";
import {getPointerLockChange} from "../main.js";

let world_global;
let scene_global;

const textureLoader = new THREE.TextureLoader();
const destroyStages = [];

let isDone = false;

let breaking = false;
let breakTarget = null;
let breakOverlay = null;
let breakProgress = 0;
let breakTimer = 0;

let objects = [];

const light = new THREE.DirectionalLight(0xffffff, 1); // 색상, 세기
light.position.set(350, 100, 500); // 빛의 방향 결정
light.castShadow = true;

light.shadow.camera.left = -15;
light.shadow.camera.right = 15;
light.shadow.camera.top = 15;
light.shadow.camera.bottom = -15;

light.shadow.bias = -0.00015;

const targetObject = new THREE.Object3D();
targetObject.position.set(350, 10, 350); // 원하는 위치로 설정

light.target = targetObject;

let hotbarUI = null;
let currentHotbarIndex = 0;
let enablePlace = false;
let enableBreak = true;

const pickupDistance = 1.5; // 거리 기준
const hotbarSize = 9;
const hotbarObjects = Array.from({ length: hotbarSize }, () => []);


const craftingSlots = Array.from({ length: 9 }, () => []);
let craftingResult = null;

const iconMap = {
    "cobblestone": "assets/cobblestone.png",
    "dirt": "assets/dirt.png",
    "grass": "assets/grass_block_side.png",
    "cherry_log": "assets/cherry_log.png",
    "cherry_leaf": "assets/cherry_leaves.png",
    "cherry_plank": "assets/cherry_planks.png",
    "crafting_table": "assets/crafting_table_front.png",
    "wooden_stick": "assets/stick.png",
    "wooden_pickaxe": "assets/wooden_pickaxe.png",
};

const craftMap = {
    "wooden_stick": [
        null, null, null,
        null, "cherry_plank", null,
        null, "cherry_plank", null,
        genWoodenStick, 4
    ],
    "wooden_pickaxe": [
        "cherry_plank", "cherry_plank", "cherry_plank",
        null, "wooden_stick", null,
        null, "wooden_stick", null,
        genWoodenPickaxe, 1
    ],
    "cherry_plank": [
        null, null, null,
        null, "cherry_log", null,
        null, null, null,
        genCherryPlank, 4
    ],
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
    scene.add(targetObject);
    playerBody.position.set(350,6,354);
    showHotbar();
    enablePlace = true;
}

export function exitFromMCWorld(playerBody, scene) {
    scene.background = null;
    scene.remove(light);
    playerBody.position.set(31,5,38);
    hideHotbar();
    enablePlace = false;
    if(isDone) {
        for (let i = objects.length - 1; i >= 0; i--) {
            if (objects[i].inMC) {
                scene.remove(objects[i].mesh);
                world_global.removeBody(objects[i].body);
                objects.splice(i, 1);
            }
        }
    }
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
    if(!enableBreak) return;
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
    let obj;

    world_global = world;
    scene_global = scene;

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
                    obj = genDirt({ location: blockLocation, size: blockSize, rotation: { x: 0, y: 0, z: 0 } }, world, scene);
                    obj.inMC = true;
                    objects.push(obj);
                } else {
                    obj = genGrass({ location: blockLocation, size: blockSize, rotation: { x: 0, y: 0, z: 0 } }, world, scene);
                    obj.inMC = true;
                    objects.push(obj);
                }
            }
        }
    }

    obj = genCraftingTable({ location: {x:location.x+3,y:location.y+2,z:location.z+5}, size: {x:1,y:1,z:1}, rotation: { x: 0, y: 0, z: 0 } }, world, scene);
    obj.inMC = true;
    objects.push(obj);

    // 2. 나무 생성
    const treeX = 6;
    const treeZ = 3;
    const groundHeight = heightMap[treeX][treeZ];
    const treeBaseY = location.y + groundHeight;
    const treeHeight = 4;

    // 줄기
    for (let y = 0; y < treeHeight; y++) {
        obj = genCherryLog({
            location: {
                x: location.x + treeX,
                y: treeBaseY + y,
                z: location.z + treeZ,
            },
            size: blockSize,
            rotation: { x: 0, y: 0, z: 0 },
        }, world, scene);
        obj.inMC = true;
        objects.push(obj);
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

                obj = genCherryLeaf({
                    location: {
                        x: location.x + treeX + dx,
                        y: leafY,
                        z: location.z + treeZ + dz,
                    },
                    size: blockSize,
                    rotation: { x: 0, y: 0, z: 0 },
                }, world, scene);
                obj.inMC = true;
                objects.push(obj);
            }
        }
    }

    setupHotbar();
    setupCraftUIDragEvent(world, scene);
    window.addEventListener('click', e => {
        if(e.button !== 2) return;
        e.preventDefault();
        placeBlockOnRightClick(camera, playerBody, controls, world, scene);
    });
    document.getElementById("craft-result").addEventListener("click", () => {
        applyCraftingResult(world, scene, camera);
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
            enableBreak = false;
            cancelBreaking(scene);
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
        placedObj.inMC = true;
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
            enableBreak = true;
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

function updateCraftingSlot(index) {
    const slot = document.querySelector(`.craft-slot[data-slot="${index}"]`);
    const stack = craftingSlots[index];
    slot.innerHTML = '';

    if (stack.length > 0) {
        const icon = document.createElement("img");
        icon.src = iconMap[stack[0].mesh.name];
        icon.classList.add("hotbar-item");
        slot.appendChild(icon);

        if (stack.length > 1) {
            const count = document.createElement("div");
            count.classList.add("item-count");
            count.textContent = stack.length;
            slot.appendChild(count);
        }
    }
}

function setupCraftUIDragEvent(world, scene) {
    let draggedObject = null;
    let draggedCount = 0;
    let dragSource = null; // 'hotbar' | 'crafting'
    let dragSourceIndex = -1;
    let isRightClickDrag = false;

    // 공통 드래그 초기화
    function resetDrag() {
        draggedObject = null;
        draggedCount = 0;
        dragSource = null;
        dragSourceIndex = -1;
        isRightClickDrag = false;
        checkCraftingResult(world, scene);
    }

    // Crafting 슬롯 드래그 시작
    document.querySelectorAll(".craft-slot").forEach((slot, index) => {
        slot.addEventListener("mousedown", (e) => {
            const stack = craftingSlots[index];
            if (stack.length === 0) return;

            e.preventDefault();
            dragSource = 'crafting';
            dragSourceIndex = index;
            isRightClickDrag = (e.button === 2);
            draggedObject = stack[0];
            draggedCount = isRightClickDrag ? Math.ceil(stack.length / 2) : stack.length;
        });

        slot.addEventListener("mouseup", (e) => {
            if (!draggedObject) return;
            e.preventDefault();

            const targetStack = craftingSlots[index];

            if (dragSource === 'crafting') {
                if (dragSourceIndex === index) return;
                const sourceStack = craftingSlots[dragSourceIndex];
                for (let i = 0; i < draggedCount && sourceStack.length > 0; i++) {
                    targetStack.push(sourceStack.pop());
                }
                updateCraftingSlot(dragSourceIndex);
                updateCraftingSlot(index);
            } else if (dragSource === 'hotbar') {
                const sourceStack = hotbarObjects[dragSourceIndex];
                for (let i = 0; i < draggedCount && sourceStack.length > 0; i++) {
                    targetStack.push(sourceStack.pop());
                }
                updateHotbarSlot(dragSourceIndex);
                updateCraftingSlot(index);
            }

            resetDrag();
        });

        slot.addEventListener("contextmenu", (e) => e.preventDefault());
    });

    // Hotbar 슬롯 드래그 시작
    document.querySelectorAll(".hotbar-slot").forEach((slot, index) => {
        slot.addEventListener("mousedown", (e) => {
            const stack = hotbarObjects[index];
            if (stack.length === 0) return;

            e.preventDefault();
            dragSource = 'hotbar';
            dragSourceIndex = index;
            isRightClickDrag = (e.button === 2);
            draggedObject = stack[0];
            draggedCount = isRightClickDrag ? Math.ceil(stack.length / 2) : stack.length;
        });

        slot.addEventListener("mouseup", (e) => {
            if (!draggedObject) return;
            e.preventDefault();

            const targetStack = hotbarObjects[index];

            if (dragSource === 'crafting') {
                const sourceStack = craftingSlots[dragSourceIndex];
                for (let i = 0; i < draggedCount && sourceStack.length > 0; i++) {
                    targetStack.push(sourceStack.pop());
                }
                updateCraftingSlot(dragSourceIndex);
                updateHotbarSlot(index);
            }

            resetDrag();
        });

        slot.addEventListener("contextmenu", (e) => e.preventDefault());
    });
}

async function checkCraftingResult(world, scene) {
    const currentPattern = craftingSlots.map(slot => slot.length > 0 ? slot[0].mesh.name : null);

    let found = false;
    craftingResult = null;

    for (const [key, pattern] of Object.entries(craftMap)) {
        const expectedPattern = pattern.slice(0, 9);
        const genFunction = pattern[9];
        const quantity = pattern[10] || 1;

        const matches = expectedPattern.every((expected, i) => expected === currentPattern[i]);

        if (matches) {
            // 기존 결과 제거
            if (Array.isArray(craftingResult)) {
                craftingResult.forEach(obj => {
                    scene.remove(obj.mesh);
                    if(obj.body) world.removeBody(obj.body);
                });
            }

            // 결과 생성
            const resultArray = [];
            for (let i = 0; i < quantity; i++) {
                const obj = await genFunction(
                    { location: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 } },
                    world,
                    scene
                );
                scene.remove(obj.mesh);
                if(obj.body) world.removeBody(obj.body);
                resultArray.push(obj);
            }

            craftingResult = resultArray;

            // UI에 첫 번째 아이콘만 표시
            const iconSrc = iconMap[resultArray[0].mesh.name];
            if (iconSrc) {
                const img = document.createElement("img");
                img.src = iconSrc;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.imageRendering = "pixelated";

                const countDiv = document.createElement("div");
                countDiv.className = "item-count";
                countDiv.textContent = quantity;

                const resultDiv = document.getElementById("craft-result");
                resultDiv.innerHTML = "";
                resultDiv.appendChild(img);
                resultDiv.appendChild(countDiv);
            }

            found = true;
            break;
        }
    }

    // 일치하는 조합 없음 → UI 초기화
    if (!found) {
        craftingResult = null;
        const resultDiv = document.getElementById("craft-result");
        resultDiv.innerHTML = "";
    }
}

function applyCraftingResult(world, scene, camera) {
    if (!craftingResult || craftingResult.length === 0) return;

    // hotbar에 넣을 공간 찾기
    const firstObj = craftingResult[0];
    const targetIndex = hotbarObjects.findIndex(arr =>
        arr.length > 0 && arr[0].mesh.name === firstObj.mesh.name
    );

    let emptyIndex = -1;
    if (targetIndex === -1) {
        emptyIndex = hotbarObjects.findIndex(arr => arr.length === 0);
        if (emptyIndex === -1) return; // 빈 공간 없음, crafting 취소
    }

    // hotbarObjects에 추가
    const insertIndex = (targetIndex !== -1) ? targetIndex : emptyIndex;
    craftingResult.forEach(obj => hotbarObjects[insertIndex].push(obj));
    updateHotbarSlot(insertIndex); // UI 반영

    // craftingSlots에서 각 slot의 첫 번째 object 제거
    for (let i = 0; i < craftingSlots.length; i++) {
        if (craftingSlots[i].length > 0) {
            const obj = craftingSlots[i].shift();

            scene.remove(obj.mesh);
            if(obj.body) world.removeBody(obj.body);

            // DOM도 제거
            const slotElem = document.querySelector(`.craft-slot[data-slot="${i}"]`);
            if (slotElem) {
                const img = slotElem.querySelector("img");
                const count = slotElem.querySelector(".item-count");

                if (craftingSlots[i].length > 0) {
                    const nextObj = craftingSlots[i][0];
                    if (img) img.src = iconMap[nextObj.mesh.name];
                    if (count) count.textContent = craftingSlots[i].length;
                } else {
                    slotElem.innerHTML = "";
                }
            }
        }
    }

    if(firstObj.mesh.name === "wooden_pickaxe") {
        getPickaxe(firstObj, camera);
    }

    // 결과 제거
    craftingResult = null;
    const resultDiv = document.getElementById("craft-result");
    resultDiv.innerHTML = "";

    // crafting UI 다시 검사
    checkCraftingResult(world, scene);
}

function getPickaxe(res, camera) {

    // 3. 메쉬를 씬에서 계속 유지하되 카메라 자식으로 만들어 고정
    if (res.mesh) {
        // 월드 좌표계에서 카메라 상대 좌표로 변환
        camera.add(res.mesh); // 카메라의 자식으로 만들기

        // 위치 설정: 카메라 기준 오른쪽 아래쪽 앞으로 약간
        res.mesh.position.set(-0.4, -0.3, -0.6); // 필요시 조정

        // 회전 초기화 또는 고정 회전 설정
        res.mesh.rotation.set(0, Math.PI/2, 0); // 필요시 조정
        res.mesh.scale.set(0.5, 0.5, 0.5);
    }
    objects.forEach(obj => {
        if(obj.mesh && obj.mesh.name && obj.mesh.name === "cobblestone") obj.isBreakable = true;
    });
    isDone = true;
}