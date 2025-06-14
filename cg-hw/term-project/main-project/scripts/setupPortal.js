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

export function checkRenderPortalView(renderer, scene) {
    // --- 포탈 뷰 렌더링 ---
    if (bluePortal && orangePortal) {
        renderPortalView(renderer, scene, bluePortal, orangePortal, portalRenderTargetA, 1);
        renderPortalView(renderer, scene, orangePortal, bluePortal, portalRenderTargetB, 1);
    }
}

export function setupPortal(renderer, scene, camera) {
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
            const portalGeometry = new THREE.PlaneGeometry(2, 3);
            const portalMaterial = new THREE.MeshBasicMaterial({
                color: event.key === "z" ? 0x00a8ff : 0xff6b00, // 좌클릭: 파란색, 우클릭: 주황색
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
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
            portalPosition.addScaledVector(normal, 0.01);
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
            const exitPos = orangePortalData.position.clone();
            const exitNormal = orangePortalData.normal.clone().normalize();

            // 출구 위치: 포탈 앞쪽으로 약간 이동
            exitPos.addScaledVector(exitNormal, 2.5);
            body.position.copy(exitPos);

            // 포탈 통과 전에 속도 크기 구함
            const preVelocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
            const speed = preVelocity.length(); // 스칼라 크기만 추출

            // 속도를 포탈 normal 방향으로 재설정 (크기는 유지)
            const newVelocity = exitNormal.clone().multiplyScalar(speed);
            body.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);

            if(portalToMC[1]) {
                enterToMCWorld(body, scene);
            } else if(MCToPortal[1]) {
                exitFromMCWorld(body, scene);
            }
        }
        if (distToOrange < 1.5) {
            // 파란 포탈로 텔레포트
            const exitPos = bluePortalData.position.clone();
            const exitNormal = bluePortalData.normal.clone().normalize();

            // 출구 위치: 포탈 앞쪽으로 약간 이동
            exitPos.addScaledVector(exitNormal, 2.5);
            body.position.copy(exitPos);

            // 포탈 통과 전 속도 크기 계산
            const preVelocity = new THREE.Vector3(body.velocity.x, body.velocity.y, body.velocity.z);
            const speed = preVelocity.length(); // 속도 크기만 추출

            // 속도를 출구 포탈 normal 방향으로 재설정 (크기 유지)
            const newVelocity = exitNormal.multiplyScalar(speed);
            body.velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);

            if(portalToMC[0]) {
                enterToMCWorld(body, scene);
            } else if(MCToPortal[0]) {
                exitFromMCWorld(body, scene);
            }
        }
    }
}

function renderPortalView(renderer, scene, entryPortal, exitPortal, renderTarget, recursion = 0) {
    if (!entryPortal || !exitPortal || recursion > 2) return;

    // 1. 출구 포탈의 위치/방향에 맞게 카메라 설정
    portalCamera.position.copy(exitPortal.position);
    portalCamera.quaternion.copy(exitPortal.quaternion);

    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(exitPortal.quaternion);
    portalCamera.position.addScaledVector(normal, 0.05);

    const wasVisible = entryPortal.visible;
    entryPortal.visible = false;

    // 2. 렌더타겟에 렌더링
    renderer.setRenderTarget(renderTarget);
    renderer.clear(); // 렌더타겟 초기화 (안하면 잔상 생길 수 있음)
    renderer.render(scene, portalCamera);
    renderer.setRenderTarget(null);

    entryPortal.visible = wasVisible;

    // 3. 입구 포탈 머티리얼에 텍스처 적용
    entryPortal.material.map = renderTarget.texture;
    entryPortal.material.needsUpdate = true;
}