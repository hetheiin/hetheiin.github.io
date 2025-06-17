import * as THREE from 'https://unpkg.com/three@0.125.0/build/three.module.js';
import {enterToMCWorld, exitFromMCWorld} from "./setupSimpleMC.js";

// 포탈 관련 변수
let bluePortal = null;
let orangePortal = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// --- 포탈 렌더링 관련 전역 변수 추가 ---
let portalRenderTargetA = new THREE.WebGLRenderTarget(512, 512);
let portalRenderTargetB = new THREE.WebGLRenderTarget(512, 512);
let portalCamera = new THREE.PerspectiveCamera(75, 2/3, 0.1, 1000); // 포탈 비율에 맞게

let portalToMC = [false, false];
let MCToPortal = [false, false];

export function checkRenderPortalView(renderer, scene, camera) {
    // --- 포탈 뷰 렌더링 ---
    if (bluePortal && orangePortal) {
        // 연결된 경우: 투명도 0, 색상 없이 내부에만 렌더타겟 텍스처
        setPortalTransparent(bluePortal);
        setPortalTransparent(orangePortal);
        renderPortalView(renderer, scene, bluePortal, orangePortal, portalRenderTargetA, 1, camera);
        renderPortalView(renderer, scene, orangePortal, bluePortal, portalRenderTargetB, 1, camera);
    } else {
        // 연결 안 된 경우: 채워진 포탈로
        setPortalFill(bluePortal, 0x00a8ff);
        setPortalFill(orangePortal, 0xff6b00);
    }
}

export function setupPortal(renderer, scene, camera) {

    document.addEventListener('keypress', event => {
        if(!(event.key === "c")) return;
        if(bluePortal) scene.remove(bluePortal);
        if(orangePortal) scene.remove(orangePortal);
        bluePortal = null;
        orangePortal = null;
    })

    // 포탈 설치 이벤트
    document.addEventListener('keypress', (event) => {
        if(!(event.key === "z" || event.key === "x"))
            return;

        // 화면 중심 좌표 사용
        mouse.x = 0;
        mouse.y = 0;

        // 레이캐스터 설정
        raycaster.setFromCamera(mouse, camera);

        // 충돌 검사 (모든 표면 검사)
        const targetObjects = [];
        scene.traverse((object) => {
            if (object.isMesh && object.material) {
                // material이 배열인 경우 처리
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                for (const material of materials) {
                    if (material.color && (material.color.getHex() === 0xdddddd || material.color.getHex() === 0xffffff)) {
                        targetObjects.push(object);
                        break;
                    }
                }
            }
        });

        const intersects = raycaster.intersectObjects(targetObjects, true);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            if(intersect.object.name === "wall_black") return;
            const portalGeometry = new THREE.PlaneGeometry(2, 3);
            const portalMaterial = new THREE.MeshBasicMaterial({
                color: event.key === "z" ? 0x00a8ff : 0xff6b00,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                // map: null  // map은 나중에 동적으로 할당됨
            });

            const portal = new THREE.Mesh(portalGeometry, portalMaterial);

            // 포탈의 방향을 표면의 법선 벡터에 맞춤
            const normal = intersect.face.normal.clone();
            normal.transformDirection(intersect.object.matrixWorld);

            // up 벡터는 법선이 Y축과 거의 평행하면 X축 사용
            let up = new THREE.Vector3(0, 1, 0);
            if (Math.abs(normal.dot(up)) > 0.99) {
                up = new THREE.Vector3(1, 0, 0);
            }

            // lookAt 행렬로 쿼터니언 생성
            const matrix = new THREE.Matrix4();
            matrix.lookAt(
                new THREE.Vector3(0, 0, 0), // from
                normal,                     // to (법선 방향)
                up                          // up
            );
            const portalQuaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);

            // 포탈 위치를 표면에서 약간 띄움
            const portalPosition = intersect.point.clone();
            portalPosition.addScaledVector(normal, 0.03);
            portal.position.copy(portalPosition);
            portal.quaternion.copy(portalQuaternion);

            // 저장
            portal.userData = {
                position: portalPosition.clone(),
                quaternion: portalQuaternion.clone(),
                normal: normal.clone()
            };

            // 기존 포탈 제거 및 scene에 추가
            if (event.key === "z") {
                if (bluePortal) scene.remove(bluePortal);
                bluePortal = portal;

                if(intersect.object.name === "minecraft_poster") {
                    portalToMC[0] = true;
                    MCToPortal[0] = false;
                } else if (intersect.object.name === "portal_poster") {
                    portalToMC[0] = false;
                    MCToPortal[0] = true;
                } else {
                    portalToMC[0] = false;
                    MCToPortal[0] = false;
                }
            } else {
                if (orangePortal) scene.remove(orangePortal);
                orangePortal = portal;

                if(intersect.object.name === "minecraft_poster") {
                    portalToMC[1] = true;
                    MCToPortal[1] = false;
                } else if (intersect.object.name === "portal_poster") {
                    portalToMC[1] = false;
                    MCToPortal[1] = true;
                } else {
                    portalToMC[1] = false;
                    MCToPortal[1] = false;
                }
            }
            scene.add(portal);
        } else {
            console.log("충돌하는 객체가 없습니다");
        }
    });
}

// 1. 포탈 텔레포트 체크 함수 분리
export function checkPortalTeleport(body, scene) {
    if (bluePortal && orangePortal) {
        const playerPos = new THREE.Vector3(body.position.x, body.position.y, body.position.z);
        const bluePortalData = bluePortal.userData;
        const orangePortalData = orangePortal.userData;

        const distToBlue = playerPos.distanceTo(bluePortalData.position);
        const distToOrange = playerPos.distanceTo(orangePortalData.position);

        if (distToBlue < 1.5) {
            // 주황 포탈로 텔레포트
            const entryNormal = bluePortalData.normal.clone().normalize();
            const exitNormal = orangePortalData.normal.clone().normalize();
            const exitPos = orangePortalData.position.clone();
            exitPos.addScaledVector(exitNormal, 2.5);
            body.position.copy(exitPos);

            // 운동량(velocity) 회전
            const velocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
            const rotationQuat = new THREE.Quaternion().setFromUnitVectors(entryNormal, exitNormal);
            velocity.applyQuaternion(rotationQuat);
            body.velocity.set(velocity.x, velocity.y, velocity.z);

            // 시야 회전 (controls.getObject())
            if (typeof controls !== 'undefined' && controls.getObject) {
                controls.getObject().quaternion.premultiply(rotationQuat);
            }

            if(portalToMC[1]) {
                enterToMCWorld(body, scene);
            } else if(MCToPortal[1]) {
                exitFromMCWorld(body, scene);
            }
        }
        if (distToOrange < 1.5) {
            // 파란 포탈로 텔레포트
            const entryNormal = orangePortalData.normal.clone().normalize();
            const exitNormal = bluePortalData.normal.clone().normalize();
            const exitPos = bluePortalData.position.clone();
            exitPos.addScaledVector(exitNormal, 2.5);
            body.position.copy(exitPos);

            // 운동량(velocity) 회전
            const velocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
            const rotationQuat = new THREE.Quaternion().setFromUnitVectors(entryNormal, exitNormal);
            velocity.applyQuaternion(rotationQuat);
            body.velocity.set(velocity.x, velocity.y, velocity.z);

            // 시야 회전 (controls.getObject())
            if (typeof controls !== 'undefined' && controls.getObject) {
                controls.getObject().quaternion.premultiply(rotationQuat);
            }

            if(portalToMC[0]) {
                enterToMCWorld(body, scene);
            } else if(MCToPortal[0]) {
                exitFromMCWorld(body, scene);
            }
        }
    }
}

function renderPortalView(renderer, scene, entryPortal, exitPortal, renderTarget, recursion = 0, camera) {
    if (!entryPortal || !exitPortal || recursion > 2) return;

    // 플레이어 오브젝트 가져오기
    const player = scene.getObjectByName("playerBody");
    if (!player) return;

    // 1. 플레이어의 월드 위치
    const playerPosition = player.getWorldPosition(new THREE.Vector3());

    // 2. 입구 포탈 기준 상대 위치 벡터
    const relativeVec = playerPosition.clone().sub(entryPortal.position);

    // 3. 입구 포탈 로컬로 변환
    const entryInvQuat = entryPortal.quaternion.clone().invert();
    relativeVec.applyQuaternion(entryInvQuat);

    // 4. 출구 포탈 회전(법선 포함)으로 변환
    relativeVec.applyQuaternion(exitPortal.quaternion);

    // 5. 방향 반전
    relativeVec.multiplyScalar(1);

    // 6. 카메라 위치는 출구 포탈 위치(혹은 약간 앞쪽)
    const portalNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(exitPortal.quaternion);
    portalCamera.position.copy(exitPortal.position).addScaledVector(portalNormal, 0.05);

    // 7. 카메라가 뒤집힌 벡터 방향을 바라보게
    portalCamera.up.set(0, 1, 0);
    portalCamera.lookAt(portalCamera.position.clone().add(relativeVec));

    // 카메라 파라미터 동기화
    if (camera) {
        portalCamera.fov = camera.fov;
        portalCamera.aspect = camera.aspect;
        portalCamera.near = camera.near;
        portalCamera.far = camera.far;
        portalCamera.updateProjectionMatrix();
    }

    const wasVisible = entryPortal.visible;
    entryPortal.visible = false;

    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, portalCamera);
    renderer.setRenderTarget(null);

    entryPortal.visible = wasVisible;

    entryPortal.material.map = renderTarget.texture;
    entryPortal.material.needsUpdate = true;
}

function setPortalTransparent(portal) {
    if (!portal) return;
    portal.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0,
        map: portal.material.map // 렌더타겟 텍스처는 renderPortalView에서 할당됨
    });
    portal.material.needsUpdate = true;
}

function setPortalFill(portal, color) {
    if (!portal) return;
    // 연결 안 된 경우만 색상 채우기, map은 null
    portal.material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        wireframe: false,
        map: null
    });
    portal.material.needsUpdate = true;
}