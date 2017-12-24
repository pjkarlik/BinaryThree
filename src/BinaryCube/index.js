// require('../shaders/BWPhaseFragment');
//require('./shaders/WaveBowFragment');
import dat from 'dat-gui';
import THREE from '../ThreeLight';
import BinaryMaze from '../utils/BinaryCube';
// Skybox image imports //
import xpos from '../../resources/images/buddha/posx.jpg';
import xneg from '../../resources/images/buddha/negx.jpg';
import ypos from '../../resources/images/buddha/posy.jpg';
import yneg from '../../resources/images/buddha/negy.jpg';
import zpos from '../../resources/images/buddha/posz.jpg';
import zneg from '../../resources/images/buddha/negz.jpg';

import stone from '../../resources/images/matallo.jpg';
import bmp from '../../resources/images/matallo_bmp.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.frames = 0;
    this.mirror = 4;
    this.scale = 0.5;
    this.ratio = 1024;
    this.size = 0.2;
    this.dim = {
      row: 11,
      col: 11,
      dep: 1
    };
    this.maze = new BinaryMaze();
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.devicePixelRatio = window.devicePixelRatio;
    // Configurations //
    this.cameraConfig = {
      position: [
        -0.61856619533,
        0.37075002657,
        -1.10822670381
      ],
      lookAt: [0, 1, 2],
      aspect: this.width / this.height,
      viewAngle: 85,
      near: 0.1,
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
      y: 1.0,
      z: -1.0
    };
    this.trsPosition = {
      x: -0.5,
      y: this.camPosition.y,
      z: -1.0
    };
    this.levelMap = [
      1.0,
      0.46,
      0.06,
      -0.36,
      -0.8
    ];
    this.camTimeoutx = true;
    this.camTimeouty = true;
    this.camTimeoutz = true;
    setTimeout(
      () => {
        this.camTimeoutx = false;
        this.camTimeouty = false;
        this.camTimeoutz = false;
      },
      1000
    );
    window.addEventListener('resize', this.resize, true);
    window.addEventListener('click', () => {
      console.log(this.camera.position);
    }, true);
    this.init();
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
    this.scene.fog = new THREE.FogExp2(0x000000, 0.55);
  
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

    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeReflectionMapping;
    // this.scene.background = this.skybox;
  };

  getRandomVector = (a, b, c) => {
    const x = (a || 0.0) + (10 - Math.random() * 20);
    const y = (b || 0.0) + (15 - Math.random() * 30);
    const z = (c || 0.0) + (10 - Math.random() * 20);
    return {x, y, z};
  };

  getMazeBlob = () => {
    const x = this.dim.col;
    const y = this.dim.row;
    const z = this.dim.dep;
    const mazeReturn = this.maze.generateMaze(x, y, z);
    const mazeWidth = this.maze.cc * this.size;
    const mazeHeight = this.maze.cr * this.size;
    return {
      mazeReturn,
      mazeWidth,
      mazeHeight
    };
  };

  createScene = () => {
    // Create custom material for the shader
    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });
    // other material //
    const texloader = new THREE.TextureLoader();
    const texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(1, 1);
    });
    const bmpMap = texloader.load(bmp, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
      texture.offset.set(0, 0);
      texture.repeat.set(1, 1);
    });
    this.boxMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
      bumpMap: bmpMap,
      transparent: true,
      bumpScale: 0.95,
    });

    let mve = 0;
    for (let v = 0; v < 1; v += 1) {

      const blob = this.getMazeBlob();
      this.mazeWidth = blob.mazeWidth;
      this.mazeHeight = blob.mazeHeight;

      for (let d = 0; d < blob.mazeReturn.length; d += 1) {
        const x = d % this.maze.cc;
        const y = ~~((d - x) / this.maze.cc);
        const z = mve;
        if (blob.mazeReturn[d] === 1) {
          this.drawCube({ x, y, z });
        }
      }
      mve += this.size * 2;
    }
  };

  drawCube = (point) => {
    const size = this.size;
    const xOffset = ~~(0 - this.mazeWidth / 2);
    const yOffset = ~~(0 - this.mazeHeight / 2);

    const object = new THREE.Mesh(
      new THREE.CubeGeometry(
        size,
        size,
        size
      ),
      this.boxMaterial,
    );
    object.position.set(
      xOffset + point.x * size,
      -0.15 + point.z,
      yOffset + point.y * size
    );
    this.scene.add(object);
  };

  cameraLoop = () => {
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * 0.01;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * 0.01;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.01;
    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    if(!this.camTimeoutx && Math.random() * 255 > 253) {
      this.trsPosition.x = (2.5 - Math.random() * 5);
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        3000
      );
    }
    if(!this.camTimeouty && Math.random() * 255 > 254) {
      const level = Math.floor(Math.random() * 4);
      console.log(level);
      this.trsPosition.y = this.levelMap[level];
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        3000
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 253) {
      this.trsPosition.z = (2.5 - Math.random() * 5);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        3000
      );
    }
  };

  cameraRange = () => {
    return (2.5 - Math.random() * 5);
  };

  renderScene = () => {
    // Core three Render call //
    // this.composer.render();
    this.renderer.render(this.scene, this.camera);
  };

  renderLoop = () => {
    if (this.frames % 1 === 0) {
      // some function here for throttling
    }

    this.renderScene();
    this.cameraLoop();
    this.frames += 0.5;

    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}