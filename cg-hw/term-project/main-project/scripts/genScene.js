import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js'

const loader = new GLTFLoader()

export async function loadRoom(location, scene, world) {
  const path = './assets/room.glb'
  const objectsToUpdate = [] // 물리 객체 저장 배열

  try {
    const gltf = await loader.loadAsync(path)
    scene.add(gltf.scene)
    gltf.scene.updateMatrixWorld(true)
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.name = "wall_black";
        // 1. Geometry에서 바운딩 박스 계산
        child.geometry.computeBoundingBox()
        const bbox = child.geometry.boundingBox
        const size = new THREE.Vector3()
        bbox.getSize(size)

        // 2. Cannon Box Shape 생성
        const halfExtents = new CANNON.Vec3(
          size.x / 2 * child.scale.x,
          size.y / 2 * child.scale.y,
          size.z / 2 * child.scale.z
        )
        const shape = new CANNON.Box(halfExtents)

        // 3. 물리 바디 생성 및 위치 설정
        const body = new CANNON.Body({
          mass: child.userData.mass || 0, // 기본값 0 (정적 객체)
          material: new CANNON.Material(),
          shape: shape
        })

        const worldPosition = new THREE.Vector3()
        child.getWorldPosition(worldPosition)
        body.position.set(worldPosition.x, worldPosition.y, worldPosition.z)

        const worldQuaternion = new THREE.Quaternion()
        child.getWorldQuaternion(worldQuaternion)
        body.quaternion.set(
          worldQuaternion.x,
          worldQuaternion.y,
          worldQuaternion.z,
          worldQuaternion.w
        )

        world.addBody(body)
        objectsToUpdate.push({ mesh: child, body })

        // 디버그용 wireframe 박스 (Cannon Box 기준)
        const debugGeometry = new THREE.BoxGeometry(
          halfExtents.x * 2,
          halfExtents.y * 2,
          halfExtents.z * 2
        )
        const debugMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true
        })
        const debugMesh = new THREE.Mesh(debugGeometry, debugMaterial)

        debugMesh.position.copy(body.position)
        debugMesh.quaternion.copy(body.quaternion)

        // scene.add(debugMesh)
      }
    })

    return objectsToUpdate // 동기화용 배열 반환

  } catch (error) {
    console.error('Error loading GLB:', error)
    return []
  }
}
