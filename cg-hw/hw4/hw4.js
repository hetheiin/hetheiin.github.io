/*-------------------------------------------------------------------------
hw4.js

canvas의 중심에 한 edge의 길이가 0.3인 정사각형을 그리고, 
이를 크기 변환 (scaling), 회전 (rotation), 이동 (translation) 하는 예제임.
    T는 x, y 방향 모두 +0.5 만큼 translation
    R은 원점을 중심으로 2초당 1회전의 속도로 rotate
    S는 x, y 방향 모두 0.3배로 scale
이라 할 때, 
    keyboard 1은 TRS 순서로 적용
    keyboard 2는 TSR 순서로 적용
    keyboard 3은 RTS 순서로 적용
    keyboard 4는 RST 순서로 적용
    keyboard 5는 STR 순서로 적용
    keyboard 6은 SRT 순서로 적용
    keyboard 7은 원래 위치로 돌아옴
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText, Axes } from './util/util.js';
import { Shader, readShaderFile } from './util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axesVAO;
let cubeVAO;
let finalTransform;
let lastTime = 0;
let sunVAO;
let earthVAO;
let moonVAO;



document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

function setupAxesBuffers(shader) {
    axesVAO = gl.createVertexArray();
    gl.bindVertexArray(axesVAO);

    const axesVertices = new Float32Array([
        -1, 0.0, 1, 0.0,  // x축
        0.0, -1, 0.0, 1   // y축
    ]);

    const axesColors = new Float32Array([
        1.0, 0.3, 0.0, 1.0, 1.0, 0.3, 0.0, 1.0,  // x축 색상
        0.0, 1.0, 0.5, 1.0, 0.0, 1.0, 0.5, 1.0   // y축 색상
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupCubeBuffers(shader, colorType) {
    const cubeVertices = new Float32Array([
        -0.05,  0.05,  // 좌상단
        -0.05, -0.05,  // 좌하단
         0.05, -0.05,  // 우하단
         0.05,  0.05   // 우상단
    ]);

    const indices = new Uint16Array([
        0, 1, 2,    // 첫 번째 삼각형
        0, 2, 3     // 두 번째 삼각형
    ]);

    let cubeColors;
    switch(colorType) {
        case "sun" :
            cubeColors = new Float32Array([
                1.0, 0.0, 0.0, 1.0,  // 빨간색
                1.0, 0.0, 0.0, 1.0,
                1.0, 0.0, 0.0, 1.0,
                1.0, 0.0, 0.0, 1.0
            ]);
            break;
        case "earth" :
            cubeColors = new Float32Array([
                0.0, 1.0, 1.0, 1.0,  // Cyan
                0.0, 1.0, 1.0, 1.0,
                0.0, 1.0, 1.0, 1.0,
                0.0, 1.0, 1.0, 1.0
            ]);
            break;
        case "moon" :
            cubeColors = new Float32Array([
                1.0, 1.0, 0.0, 1.0,  // Yellow
                1.0, 1.0, 0.0, 1.0,
                1.0, 1.0, 0.0, 1.0,
                1.0, 1.0, 0.0, 1.0
            ]);
            break;
    }

    cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeColors, gl.STATIC_DRAW);
    shader.setAttribPointer("a_color", 4, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    return cubeVAO;
}

function getTranslationMatrix(deltaX, deltaY) {
    const result = mat4.create();

    mat4.translate(result, result, [deltaX, deltaY, 0]);

    return result;
}

function getScaleMatrix(scale) {
    const result = mat4.create();

    mat4.scale(result, result, [scale, scale, 1]);

    return result;
}

function getRotationMatrix(angle) {
    const result = mat4.create();

    mat4.rotate(result, result, angle * Math.PI / 180.0, [0, 0, 1]);

    return result;
}

function compositeMatrix(...matrices) {
    let result = mat4.create();
    matrices.forEach((matrix) => {
        mat4.multiply(result, matrix, result);
    });
    return result;
}

function getSunMatrix(t) {
    const rotationMat = getRotationMatrix(45*t);
    const scaleMat = getScaleMatrix(2);

    return compositeMatrix(rotationMat, scaleMat);
}

function getEarthMatrix(t) {
    const rotationMat = getRotationMatrix(180*t);
    const revolutionMat = getRotationMatrix(30*t);
    const translationMat = getTranslationMatrix(0.7, 0);

    return compositeMatrix(rotationMat, translationMat, revolutionMat);
}

function getMoonMatrix(t) {
    const scaleMat = getScaleMatrix(0.5);
    const rotationMat = getRotationMatrix(180*t);
    const translationMat1 = getTranslationMatrix(0.2, 0);
    const revolutionMat1 = getRotationMatrix(360*t);
    const translationMat2 = getTranslationMatrix(0.7, 0);
    const revolutionMat2 = getRotationMatrix(30*t);

    return compositeMatrix(scaleMat, rotationMat, translationMat1, revolutionMat1, translationMat2, revolutionMat2);
}

function render(t) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    shader.use();

    // 축 그리기
    shader.setMat4("u_transform", mat4.create());
    gl.bindVertexArray(axesVAO);
    gl.drawArrays(gl.LINES, 0, 4);

    // 정사각형 그리기
    shader.setMat4("u_transform", getSunMatrix(t));
    gl.bindVertexArray(sunVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    shader.setMat4("u_transform", getEarthMatrix(t));
    gl.bindVertexArray(earthVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    shader.setMat4("u_transform", getMoonMatrix(t));
    gl.bindVertexArray(moonVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    render(currentTime / 1000);
    requestAnimationFrame(animate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        finalTransform = mat4.create();
        
        shader = await initShader();
        setupAxesBuffers(shader);

        sunVAO = setupCubeBuffers(shader, "sun");
        earthVAO = setupCubeBuffers(shader, "earth");
        moonVAO = setupCubeBuffers(shader, "moon");

        shader.use();
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
