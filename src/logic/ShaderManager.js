export default class ShaderManager {
    constructor(context) {
        this.context = context;
    }
    //
    // Initialize a shader program, so WebGL knows how to draw our data
    //
    initShaderProgram(vsSource, fsSource) {
        let gl = this.context;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);
        // Create the shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            throw 'error linking program';
        }
        return {
            program: shaderProgram,
            attributes: {
                position: gl.getAttribLocation(shaderProgram, 'position'),
                hsl: gl.getAttribLocation(shaderProgram, 'hsl'),
            },
            uniforms: {},
        };
    }
    //
    // creates a shader of the given type, uploads the source and
    // compiles it.
    //
    loadShader(type, source) {
        let gl = this.context;
        const shader = gl.createShader(type);
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            throw 'error compiling shader';
        }
        return shader;
    }
}
//# sourceMappingURL=ShaderManager.js.map