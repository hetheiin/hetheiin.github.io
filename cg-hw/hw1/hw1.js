// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);

// Render loop
function render() {
    gl.enable(gl.SCISSOR_TEST);

    let width = canvas.width / 2;
    let height = canvas.height / 2;

    // left top : red
    gl.scissor(0, height, width, height);
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // right top : green
    gl.scissor(width, height, width, height);
    gl.clearColor(0, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // left bottom : blue
    gl.scissor(0, 0, width, height);
    gl.clearColor(0, 0, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // right bottom : yellow
    gl.scissor(width, 0, width, height);
    gl.clearColor(1, 1, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.SCISSOR_TEST);
}

// Start rendering
render();

// Resize canvas width, height
function resize() {
    minWidth = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
    canvas.width = minWidth;
    canvas.height = minWidth;
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});