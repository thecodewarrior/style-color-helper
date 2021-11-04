import {filterRegistry} from "@/logic/Filters";
import {hsl2rgb_glsl, rgb2hsl_glsl} from "@/logic/math/hsl";

export default class SpectrumShader {
  program!: WebGLProgram
  positionAttribute!: number
  hslAttribute!: number
  paramUniform!: WebGLUniformLocation
  visibilityUniform!: WebGLUniformLocation
  shaderText!: string

  private _filterIds: string[] = []
  private pendingRebuild: boolean = true

  constructor(private context: WebGLRenderingContext) {
  }
  
  public get filterIds(): string[] {
    return this._filterIds
  }
  public set filterIds(value) {
    let modified = false
    if(value.length === this._filterIds.length) {
      for (let i = 0; i < value.length; i++) {
        if(value[i] != this._filterIds[i]) {
          modified = true
          break
        }
      }
    } else {
      modified = true
    }

    if(modified) {
      this._filterIds = value
      this.pendingRebuild = true
    }
  }

  public rebuildIfNeeded() {
    if(this.pendingRebuild)
      this.rebuildShader(this._filterIds)
  }

  private rebuildShader(filterIds: string[]) {
    this.pendingRebuild = false
    const vertex = `
attribute vec4 position;
attribute vec3 hsl;

varying vec3 vHsl;

void main(void) {
    gl_Position = position;
    vHsl = hsl;
}`
    const fragment = SpectrumShader.generateFragmentSource(filterIds)
    this.shaderText = fragment
    if(this.program)
      this.context.deleteProgram(this.program);
    this.program = this.createProgram(vertex, fragment);
    this.positionAttribute = this.context.getAttribLocation(this.program, 'position');
    this.hslAttribute = this.context.getAttribLocation(this.program, 'hsl');
    this.paramUniform = this.context.getUniformLocation(this.program, '_p')!;
    this.visibilityUniform = this.context.getUniformLocation(this.program, '_v')!;
  }

  private static generateFragmentSource(filterIds: string[]): string {
    const filterTypes = filterIds.map(it => filterRegistry[it])
    let parameterCount = 0
    let filterCount = 0
    const body = filterTypes.map(filter => {
      const baseIndex = parameterCount;
      let body = filter.glsl.replaceAll(/\$(\d+)/g, (substring, indexString) => {
        let index = baseIndex + parseInt(indexString);
        parameterCount = Math.max(parameterCount, index + 1);
        return `_p[${index}]`;
      });
      return `    if (_v[${filterCount++}]) { // ${filter.id}\n` +
          body.split('\n').map(line => `        ${line}\n`).join("") +
          "    }\n" +
          "    color = clamp(color, 0., 1.);\n"
    }).join("");

    // language=GLSL
    return `precision lowp float;

uniform vec4 _p[${Math.max(parameterCount, 1)}];
uniform bool _v[${Math.max(filterCount, 1)}];

varying vec3 vHsl;

${rgb2hsl_glsl}
${hsl2rgb_glsl}

void main() {
    vec3 color = hsl2rgb(vHsl);

${body}
    gl_FragColor = vec4(color, 1.0);
}`
  }

  private createProgram(vsSource: string, fsSource: string): WebGLProgram {
    let gl = this.context
    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram()!;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.log('Fragment shader:\n' + fsSource)
      console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
      gl.deleteProgram(shaderProgram);
      throw 'error linking program';
    }

    return shaderProgram;
  }

  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  private loadShader(type: GLenum, source: string): WebGLShader {
    let gl = this.context
    const shader = gl.createShader(type)!;

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(source)
      console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw 'error compiling shader';
    }

    return shader;
  }

}