export class SquarePyramid {
    constructor(gl) {
        this.gl = gl;

        // VAO, VBO, EBO
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // vertices
        this.vertices = new Float32Array([
            // front
            0.5, 0.0, 0.5,
            0.0, 1.0, 0.0,
            -0.5, 0.0, 0.5,

            // right
            0.5, 0.0, -0.5,
            0.0, 1.0, 0.0,
            0.5, 0.0, 0.5,

            // back
            -0.5, 0.0, -0.5,
            0.0, 1.0, 0.0,
            0.5, 0.0, -0.5,

            // left
            -0.5, 0.0, 0.5,
            0.0, 1.0, 0.0,
            -0.5, 0.0, -0.5,

            // bottom
            0.5, 0.0, 0.5,
            0.5, 0.0, -0.5,
            -0.5, 0.0, -0.5,
            -0.5, 0.0, 0.5,
        ]);

        // colors
        this.colors = new Float32Array([
            // front - red
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,

            // right - yellow
            1, 1, 0, 1,
            1, 1, 0, 1,
            1, 1, 0, 1,

            // back - magenta
            1, 0, 1, 1,
            1, 0, 1, 1,
            1, 0, 1, 1,

            // left - cyan
            0, 1, 1, 1,
            0, 1, 1, 1,
            0, 1, 1, 1,

            // bottom - black
            0, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 1,
            0, 0, 0, 1,
        ]);

        // indices
        this.indices = new Uint16Array([
            // front
            0, 1, 2,

            // right
            3, 4, 5,

            // back
            6, 7, 8,

            // left
            9, 10, 11,

            // bottom
            12, 13, 14, 14, 15, 12,
        ]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        // buffer sizes
        const VERTICES_SIZE = this.vertices.byteLength;
        const COLORS_SIZE = this.colors.byteLength;
        const TOTAL_SIZE = VERTICES_SIZE + COLORS_SIZE;

        gl.bindVertexArray(this.vao);

        // enroll data to vbo
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, TOTAL_SIZE, gl.STATIC_DRAW);

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, VERTICES_SIZE, this.colors);

        // enroll data to ebo
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, VERTICES_SIZE);

        // enable vertex attributes
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);

        // close buffer binding
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}