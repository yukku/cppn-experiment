import * as THREE from "three"
if(!global.THREE) global.THREE = THREE

import shaderFrag from "../../shader_precompiled/test.frag.js"
import shaderVert from "../../shader_precompiled/test.vert.js"

require("../lib/three/examples/js/controls/OrbitControls.js");

export default class Renderer{

    constructor({ canvas, width, height }) {

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            // alpha: true,
            antialias: false,
        })
        this.renderer.setClearColor(0x000000, 0)
        this.renderer.setSize(width, height)
        this.renderer.setPixelRatio(2)


        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(30, width / height, 100, 3500000)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))

        const geometry = new THREE.BufferGeometry()
        // geometry.addAttribute('position', new THREE.BufferAttribute(xPosArray, 1))

        const material = new THREE.ShaderMaterial({
            uniforms: {
                mouse: {type: "v2", value: new THREE.Vector2(0, 0)}
            },
            side: THREE.DoubleSide,
            fragmentShader: shaderFrag,
            vertexShader: shaderVert,
        })

        this.planeMesh = new THREE.Mesh(geometry, material)
        this.scene.add(this.planeMesh)
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6))

        this.orbitControls = new THREE.OrbitControls(this.camera)

    }

    render() {

    }
}
