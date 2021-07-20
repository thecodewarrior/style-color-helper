import {filterRegistry} from "@/logic/Filters";

export default class SpectrumShader {
  program!: WebGLProgram
  positionAttribute!: number
  hslAttribute!: number
  paramUniform!: WebGLUniformLocation
  visibilityUniform!: WebGLUniformLocation

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
    const vertex = `precision lowp float;

attribute vec4 position;
attribute vec3 hsl;

varying vec3 vHsl;

void main(void) {
    gl_Position = position;
    vHsl = hsl;
}`
    const fragment = SpectrumShader.generateFragmentSource(filterIds)
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

    return `precision lowp float;

uniform vec4 _p[${Math.max(parameterCount, 1)}];
uniform bool _v[${Math.max(filterCount, 1)}];

varying vec3 vHsl;

// https://stackoverflow.com/a/42261473/1541907
vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0 + vec3(0.0, 4.0, 2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

//https://www.shadertoy.com/view/wt23Rt
//RGB to HSL (hue, saturation, lightness/luminance).
//Source: https://gist.github.com/yiwenl/745bfea7f04c456e0101
vec3 rgb2hsl(vec3 c){
	float cMin=min(min(c.r,c.g),c.b),
	      cMax=max(max(c.r,c.g),c.b),
	      delta=cMax-cMin;
	vec3 hsl=vec3(0.,0.,(cMax+cMin)/2.);
	if(delta!=0.0){ //If it has chroma and isn't gray.
		if(hsl.z<.5){
			hsl.y=delta/(cMax+cMin); //Saturation.
		}else{
			hsl.y=delta/(2.-cMax-cMin); //Saturation.
		}
		float deltaR=(((cMax-c.r)/6.)+(delta/2.))/delta,
		      deltaG=(((cMax-c.g)/6.)+(delta/2.))/delta,
		      deltaB=(((cMax-c.b)/6.)+(delta/2.))/delta;
		//Hue.
		if(c.r==cMax){
			hsl.x=deltaB-deltaG;
		}else if(c.g==cMax){
			hsl.x=(1./3.)+deltaR-deltaB;
		}else{ //if(c.b==cMax){
			hsl.x=(2./3.)+deltaG-deltaR;
		}
		hsl.x=fract(hsl.x);
	}
	return hsl;
}

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