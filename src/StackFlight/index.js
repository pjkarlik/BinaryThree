import dat from 'dat-gui';
import THREE from '../Three';
import BinaryMaze from '../utils/BinaryMaze';

import stone from '../../resources/images/grateframe.png';
import bmp from '../../resources/images/grate_bmp.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.layers = 6;
    this.frames = 0;
    this.mirror = 4;
    this.scale = 1.0;
    this.ratio = 1024;
    this.size = 0.2;
    this.maze = new BinaryMaze();
    this.mazeObject = new Array();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    this.background = 0x000000;
    // Configurations //
    this.cameraConfig = {
      position: [0, 0, 0],
      lookAt: [0, 0, 0],
      aspect: this.width / this.height,
      viewAngle: 85,
      near: 0.08,
      far: 20000
    };
    this.controlConfig = {
      max: 1500,
      min: 0
    };
    this.amount = 2 + Math.abs(Math.random() * 26);
    this.adef = 360 / this.amount + 1;
    this.splineObject = [];
    this.camPosition = {
      x: -1.5,
      y: 0.06,
      z: -1.0
    };
    this.levelMap = [
      1.0,
      0.46,
      0.06,
      -0.36,
      -0.8
    ];

    window.addEventListener('resize', this.resize, true);
    // window.addEventListener('click', () => {
    //   console.log(this.camera.position);
    // }, true);
    this.init();
    this.setEffects();
    // this.createGUI();
    this.createScene();
    this.renderLoop();
  }

  resize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  };

  createGUI = () => {
    this.options = {
      scale: this.scale,
      ratio: this.ratio,
      mirror: this.mirror
    };
    this.gui = new dat.GUI();

    const folderRender = this.gui.addFolder('Render Options');
    folderRender.add(this.options, 'mirror', 0, 4).step(1)
      .onFinishChange((value) => {
        this.mirror = value;
        this.setOptions();
      });
    folderRender.add(this.options, 'scale', 1, 100).step(0.1)
      .onFinishChange((value) => {
        this.scale = value * 1.0;
        this.setOptions();
      });
    folderRender.add(this.options, 'ratio', 512, 1024).step(1)
      .onFinishChange((value) => {
        this.ratio = value * 1.0;
        this.setOptions();
      });
    // folderRender.open();
  };

  setOptions() {
    this.effect.uniforms.side.value = this.mirror;
    this.rfrag.uniforms.scale.value = this.scale;
    this.rfrag.uniforms.ratio.value = this.ratio;
  };

  init = () => {
    // Set Render and Scene //
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(this.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(this.background, 0.875);
    this.scene.background = new THREE.Color(this.background);
    this.camera = new THREE.PerspectiveCamera(
        this.cameraConfig.viewAngle,
        this.cameraConfig.aspect,
        this.cameraConfig.near,
        this.cameraConfig.far
    );

    this.camera.position.set(...this.cameraConfig.position);
    this.camera.lookAt(new THREE.Vector3(...this.cameraConfig.lookAt));
    this.scene.add(this.camera);

    // Set AmbientLight //
    this.ambient = new THREE.AmbientLight(0xFFFFFF);
    this.ambient.position.set(0, 0, 0);
    this.scene.add(this.ambient);
  };

  setEffects = () => {
    let effect;
    this.effect = new THREE.AnaglyphEffect(this.renderer);
    this.effect.setSize(this.width, this.height);
  };

  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (10 - Math.random() * 20);
    const y = (b || 0.0) + (15 - Math.random() * 30);
    const z = (c || 0.0) + (10 - Math.random() * 20);
    return {x, y, z};
  };

  getMazeBlob = () => {
    const mazeReturn = this.maze.generateMaze(10, 10);
    const mazeWidth = this.maze.cc * this.size;
    const mazeHeight = this.maze.cr * this.size;
    return {
      mazeReturn,
      mazeWidth,
      mazeHeight
    };
  };

  createScene = () => {
    const texloader = new THREE.TextureLoader();
  
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    });
  
    const bmpMap = texloader.load(bmp, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    });

    this.boxMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
      bumpMap: bmpMap,
      transparent: true,
      bumpScale: 0.95,
    });

    // end material //
    let mve = 0;
    for (let v = 0; v < this.layers; v += 1) {

      const blob = this.getMazeBlob();
      this.mazeWidth = blob.mazeWidth;
      this.mazeHeight = blob.mazeHeight;

      this.mazeObject[v] = {
        mazeWidth: blob.mazeWidth,
        mazeHeight: blob.mazeHeight,
        mazeReturn: new Array()
      };
      
      for (let d = 0; d < blob.mazeReturn.length; d += 1) {
        const x = d % this.maze.cc;
        const y = ~~((d - x) / this.maze.cc);
        const z = mve - 0.4;
        if (blob.mazeReturn[d] === 1) {
          this.mazeObject[v].mazeReturn[d] = this.drawCube({ x, y, z });
        } else {
          this.mazeObject[v].mazeReturn[d] = 0;
        }
      }
      mve += this.size * 2;
    }
  };

  drawCube = (point) => {
    const size = this.size;
    const xOffset = ~~(0 - this.mazeWidth / 2);
    const yOffset = ~~(0 - this.mazeHeight / 2);

    const geometry = new THREE.BoxGeometry(
      size,
      size,
      size
    );

    geometry.computeVertexNormals();
    const object = new THREE.Mesh(
      geometry,
      this.boxMaterial,
    );
    object.position.set(
      xOffset + point.x * size,
      yOffset + point.y * size,
      -0.15 + point.z
    );
    this.scene.add(object);
    return object;
  };

  cameraLoop = () => {
    this.camera.position.set(
      0,
      0,
      0 // this.frames * 0.001,
    );
    this.camera.rotateZ((0.06) * Math.PI / 180);
  };

  moveObjects = () => {
    for (let v = 0; v < this.layers; v += 1) {
      const blob = this.mazeObject[v];
      for (let d = 0; d < blob.mazeReturn.length; d += 1) {
        if (blob.mazeReturn[d] !== 0) {
          const object = blob.mazeReturn[d];
          // object.position.set(
          //   xOffset + point.x * size,
          //   yOffset + point.y * size,
          //   -0.15 + point.z
          // );
        } 
      }
    }
  };

  renderScene = () => {
    // this.composer.render();
    this.renderer.render(this.scene, this.camera);
    // this.effect.render(this.scene, this.camera);
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
    }

    this.renderScene();
    this.cameraLoop();
    this.frames += 0.5;

    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
