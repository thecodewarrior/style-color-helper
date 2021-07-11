<template>
  <canvas ref="spectrum" :width="width" :height="height"></canvas>
</template>

<script lang="ts">
import {Options, Vue} from 'vue-class-component';
import {FilterSet} from "@/logic/Filter";
import {PropType} from "vue";
import SpectrumShader from "../logic/SpectrumShader";

export type SpectrumComponent = number | "x" | "-x" | "y" | "-y"

@Options({
  components: {},
  props: {
    hue: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    saturation: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    lightness: {type: [String as PropType<SpectrumComponent>, Number as PropType<SpectrumComponent>], required: true},
    width: {type: Number, required: true},
    height: {type: Number, required: true},
    filters: {type: Array as PropType<FilterSet>, required: true},
  },
  emits: [
    'update:h',
    'update:s',
    'update:l',
  ],
  watch: {
    'hue': 'markDirty',
    'saturation': 'markDirty',
    'lightness': 'markDirty',
    'width': 'markDirty',
    'height': 'markDirty',
    'filterIds': {handler: 'filterIdsChanged', deep: true},
    'uniformParameters': {handler: 'parametersChanged', deep: true}
  }
})
export default class ColorSpectrum extends Vue {
  hue!: SpectrumComponent
  saturation!: SpectrumComponent
  lightness!: SpectrumComponent
  filters!: FilterSet

  context!: WebGLRenderingContext
  shader!: SpectrumShader
  positionBuffer!: WebGLBuffer
  colorBuffer!: WebGLBuffer

  needsUpdate: boolean = false

  markDirty() {
    if(!this.needsUpdate) {
      this.$nextTick(() => {
        this.updateCanvas()
        this.needsUpdate = false
      });
    }
    this.needsUpdate = true
  }

  get filterIds(): string[] {
    return this.filters.map(it => it.id)
  }

  filterIdsChanged() {
    this.shader.filterIds = this.filterIds
    this.markDirty()
  }

  get uniformParameters(): number[] {
    let parameters = []
    for(let filter of this.filters) {
      let vectors = filter.type.vectorize(...filter.parameters)
      for(let vector of vectors) {
        parameters.push(vector.r)
        parameters.push(vector.g)
        parameters.push(vector.b)
        parameters.push(vector.a)
      }
    }
    return parameters
  }

  parametersChanged() {
    this.markDirty()
  }

  mounted() {
    console.log("wtf")
    this.initializeContext()
    this.updateCanvas()
  }

  initializeContext() {
    const canvas = this.$refs['spectrum'] as HTMLCanvasElement
    this.context = canvas.getContext('webgl')!
    this.shader = new SpectrumShader(this.context);
    this.shader.filterIds = this.filterIds

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
    this.shader.rebuildIfNeeded()
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
          this.shader.positionAttribute,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(this.shader.positionAttribute);
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
          this.shader.hslAttribute,
          numComponents,
          type,
          normalize,
          stride,
          offset);
      gl.enableVertexAttribArray(this.shader.hslAttribute);
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(this.shader.program);

    this.uploadComputedColors()

    // Set the shader uniforms

    gl.uniform4fv(this.shader.paramUniform, new Float32Array(this.uniformParameters))

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
