// Import THree JS and Orbit controls
import { 
    OrbitControls 
} from 'https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'three'

// Stadia library
import StadiaController from './stadia.js'

var stadia = undefined

// UI elements
const connect = document.getElementById('connect')
const info = document.getElementById('info')
const sceneDiv = document.getElementById('scene')
const WIDTH = sceneDiv.clientWidth
const HEIGHT = sceneDiv.clientHeight

// cube rotation and colour
var xRotation = 0
var yRotation = 0
var zRotation = 0
var colour = 0x223366


// update rotation and colour from triggers and A button
const stadiaChanged = (status) => {
    info.innerHTML = stadia.statusTable()

    xRotation = status.triggers.left/2000.0
    yRotation = status.triggers.right/2000.0
    if (status.buttons.a) {
        colour = Math.floor(Math.random() * 0xFFFFFF)
    }
}


// Call this when we click the connect button
const connectController = async () => {

    stadia = new StadiaController()
    stadia.connect(stadiaChanged)
    .then(() => {
        info.innerHTML = stadia.connected ? "Controller connected" : "No controller"
    })
}


class SceneSetup {
    constructor(renderer, scene, camera) {
        this.renderer = renderer 
        this.scene = scene 
        this.camera = camera
    }

    doRender() {
        this.renderer.render(this.scene, this.camera)
    }
}

const createScene = () => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000)

    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(WIDTH, HEIGHT)
    sceneDiv.appendChild(renderer.domElement)
    
    return new SceneSetup(renderer, scene, camera)
}

const addShapes = (scene) => {
    const pgeometry = new THREE.PlaneGeometry( 40, 40 );
    const pmaterial = new THREE.MeshBasicMaterial( {color: 0x667788, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( pgeometry, pmaterial );
    scene.add( plane )


    // Create a Three.js cube
    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const texture = new THREE.TextureLoader().load('./rock.jpg');
    //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const material = new THREE.MeshStandardMaterial({ bumpMap: texture, color: colour });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(0,0,3)

    scene.add(cube);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 2);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight); 

    return cube
} 

// apply state to cube
const updateCube = (cube) => {
    cube.rotation.x += xRotation
    cube.rotation.y += yRotation
    cube.rotation.z += zRotation
    cube.material.color.set('#' + colour.toString(16).padStart(6,'0'))
}

// Render the scene
function render(sceneSetup, cube) {

    updateCube(cube)
    requestAnimationFrame(() => { render(sceneSetup, cube)} )

    sceneSetup.doRender()
}


// get started
export const start = () => {

    // connect the button
    connect.addEventListener('click', connectController)

    // create scene
    const sceneSetup = createScene()
    const cube = addShapes(sceneSetup.scene)

    // kick off rendering
    render(sceneSetup, cube)
}
