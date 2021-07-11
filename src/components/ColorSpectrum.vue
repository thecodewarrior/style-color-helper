<template>
  <canvas ref="spectrum" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {ColorFilter} from "@/logic/ColorFilter";
import chroma, {Color} from "chroma-js";
import {PropType, resolveComponent} from "vue";
import {clamp} from "@/utils";
import ShaderManager, {ProgramInfo} from "@/logic/ShaderManager";
import vert from "@/assets/shaders/base.vert";
import frag from "@/assets/shaders/base.frag";

export type SpectrumComponent = number | "x" | "-x" | "y" | "-y"
type Margins = [number] | [number, number] | [number, number, number, number]

@Options({
  components: {},
  props: {
    hue: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    saturation: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    lightness: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    filter: {type: Object as PropType<ColorFilter>, required: true},
    margin: {type: Object as PropType<Margins>, required: false, default: [0]},
  },
  emits: [
    'update:h',
    'update:s',
    'update:l',
  ],
  watch: {
    'hue': 'colorChanged',
    'saturation': 'colorChanged',
    'lightness': 'colorChanged',
    'width': 'geometryChanged',
    'height': 'geometryChanged',
    'filter': 'geometryChanged',
    'margin': 'geometryChanged',
  }
})
export default class ColorSpectrum extends Vue {
  hue!: SpectrumComponent
  saturation!: SpectrumComponent
  lightness!: SpectrumComponent
  margin!: Margins
  width!: number
  height!: number
  filter!: ColorFilter

  context!: WebGLRenderingContext
  shaders!: ShaderManager
  program!: ProgramInfo
  positionBuffer!: WebGLBuffer
  colorBuffer!: WebGLBuffer

  colorChanged(newValue: any) {
    if (!(newValue instanceof String))
      this.updateCanvas()
  }

  geometryChanged() {
    this.updateCanvas()
  }

  mounted() {
    console.log("wtf")
    this.initializeContext()
    this.updateCanvas()
  }

  initializeContext() {
    const canvas = this.$refs['spectrum'] as HTMLCanvasElement
    this.context = canvas.getContext('webgl')!
    this.shaders = new ShaderManager(this.context);

    this.program = this.shaders.initShaderProgram(vert, frag)

    const gl = this.context
    {
      this.positionBuffer = gl.createBuffer()!;
      // Select the positionBuffer as the one to apply buffer
      // operations to from here out.

      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

      const positions = [
        -1.0, 1.0,  // top-left
        1.0, 1.0,   // top-right
        -1.0, -1.0, // bottom-left
        1.0, -1.0,  // bottom-right
      ];

      gl.bufferData(gl.ARRAY_BUFFER,
          new Float32Array(positions),
          gl.STATIC_DRAW);
    }

    {
      this.colorBuffer = gl.createBuffer()!;
      this.uploadColors(
          [0, 1, 1], // top-left
          [1, 1, 1], // top-right
          [0, 1, 0], // bottom-left
          [1, 1, 0], // bottom-right
      )
    }
  }

  uploadColors(topLeft: number[], topRight: number[], bottomLeft: number[], bottomRight: number[]) {
    const gl = this.context

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array(topLeft.concat(topRight, bottomLeft, bottomRight)),
        gl.DYNAMIC_DRAW);
  }

  uploadComputedColors() {
    let topLeft = [0, 0, 0]
    let topRight = [0, 0, 0]
    let bottomLeft = [0, 0, 0]
    let bottomRight = [0, 0, 0]

    function setup(index: number, component: SpectrumComponent, factor: number = 1) {
      switch(component) {
        case "x":
          bottomLeft[index] = topLeft[index] = 0;
          bottomRight[index] = topRight[index] = 1;
          return;
        case "-x":
          bottomLeft[index] = topLeft[index] = 1;
          bottomRight[index] = topRight[index] = 0;
          return;
        case "y":
          topLeft[index] = topRight[index] = 0;
          bottomLeft[index] = bottomRight[index] = 1;
          return;
        case "-y":
          topLeft[index] = topRight[index] = 1;
          bottomLeft[index] = bottomRight[index] = 0;
          return;
      }
      bottomLeft[index] = topLeft[index] = bottomRight[index] = topRight[index] = component / factor
    }

    setup(0, this.hue, 360)
    setup(1, this.saturation)
    setup(2, this.lightness)

    this.uploadColors(topLeft, topRight, bottomLeft, bottomRight)
  }

  updateCanvas() {
    let gl = this.context

    gl.clearColor(Math.random(), Math.random(), Math.random(), 1)
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2;  // pull out 2 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.vertexAttribPointer(
          this.program.attributes.position,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(this.program.attributes.position);
    }

    {
      const numComponents = 3;  // pull out 2 values per iteration
      const type = gl.FLOAT;    // the data in the buffer is 32bit floats
      const normalize = false;  // don't normalize
      const stride = 0;         // how many bytes to get from one set of values to the next
                                // 0 = use type and numComponents above
      const offset = 0;         // how many bytes inside the buffer to start from
      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.vertexAttribPointer(
          this.program.attributes.hsl,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(this.program.attributes.hsl);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(this.program.program);

    this.uploadComputedColors()

    // Set the shader uniforms

    // gl.uniformMatrix4fv(
    //     programInfo.uniformLocations.projectionMatrix,
    //     false,
    //     projectionMatrix);
    // gl.uniformMatrix4fv(
    //     programInfo.uniformLocations.modelViewMatrix,
    //     false,
    //     modelViewMatrix);

    {
      const offset = 0;
      const vertexCount = 4;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }

  }
}
</script>

<style scoped>
</style>
