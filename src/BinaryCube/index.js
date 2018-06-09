// require('../shaders/BWPhaseFragment');
//require('./shaders/WaveBowFragment');
import dat from 'dat-gui';
import THREE from '../ThreeLight';
import BinaryMaze from '../utils/BinaryCube';
// Skybox image imports //
import xpos from '../../resources/images/brudslojan/posx.jpg';
import xneg from '../../resources/images/brudslojan/negx.jpg';
import ypos from '../../resources/images/brudslojan/posy.jpg';
import yneg from '../../resources/images/brudslojan/negy.jpg';
import zpos from '../../resources/images/brudslojan/posz.jpg';
import zneg from '../../resources/images/brudslojan/negz.jpg';

// import grass from '../../resources/images/grateframe.png';
// import bmps from '../../resources/images/grate_bmp.jpg';
import rock from '../../resources/images/6920.jpg';
import grass from '../../resources/images/grass02.jpg';
import bmps from '../../resources/images/grassBmp.jpg';
import stone from '../../resources/images/stone.jpg';
import bmpn from '../../resources/images/stone_bmp.jpg';

// Render Class Object //
export default class Render {
  constructor() {
    this.background = 0x000000;
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
      1.96,
      1.42,
      1.12,
      0.96,
      0.42
      // 0.46,
      // 0.06,
      // -0.36,
      // -0.8
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
    this.scene.background = new THREE.Color(this.background);
    // this.scene.fog = new THREE.FogExp2(this.background, 0.55);
  
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
    this.ambient = new THREE.AmbientLight(0xFFFFFF, 0.2);
    this.ambient.position.set(-2, 0, 0);
    this.scene.add(this.ambient);

    this.directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    this.directionalLight.position.set(0, 1, 0);
    this.scene.add(this.directionalLight);
    // this.helper = new THREE.DirectionalLightHelper(this.directionalLight);
    // this.scene.add(this.helper);
    // Skybox //
    const urls = [xpos, xneg, ypos, yneg, zpos, zneg];
    this.skybox = new THREE.CubeTextureLoader().load(urls);
    this.skybox.format = THREE.RGBFormat;
    // CubeReflectionMapping || CubeRefractionMapping//
    this.skybox.mapping = THREE.CubeReflectionMapping;
    this.scene.background = this.skybox;
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
    const texloader = new THREE.TextureLoader();

    this.metalMaterial = new THREE.MeshBasicMaterial({
      envMap: this.skybox,
      side: THREE.DoubleSide
    });
  
    let texture = texloader.load(grass, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    let bmpMap = texloader.load(bmps, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
      texture.repeat.x = 4;
      texture.repeat.y = 1;
    });

    this.grassMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bmpMap,
      bumpScale: 0.8,
    });

    texture = texloader.load(stone, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });
  
    bmpMap = texloader.load(bmpn, () => {
      bmpMap.wrapS = bmpMap.wrapT = THREE.RepeatWrapping;
    });

    this.stoneMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpMap: bmpMap,
      transparent: true,
      bumpScale: 0.95,
    });

    texture = texloader.load(rock, () => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    });

    this.rockMaterial = new THREE.MeshPhongMaterial({
      map: texture
    });

    let mve = 0;
    for (let v = 0; v < 1; v += 1) {

      const blob = this.getMazeBlob();
      this.mazeWidth = blob.mazeWidth;
      this.mazeHeight = blob.mazeHeight;
      this.xOffset = ~~(0 - this.mazeWidth / 2);
      this.yOffset = ~~(0 - this.mazeHeight / 2);
      console.log(this.xOffset,this.yOffset);
      for (let d = 0; d < blob.mazeReturn.length; d += 1) {
        const x = d % this.maze.cc;
        const y = ~~((d - x) / this.maze.cc);
        let z = mve;
        if (blob.mazeReturn[d] !== 1) {
          this.drawCube({ x, y, z });
        } else {
          z += 0.1;
          this.drawBlock({ x, y, z }, true);
        }
      }
      mve += this.size * 2;
    }
  };

  drawCube = (point) => {
    const size = this.size;
    const object = new THREE.Mesh(
      new THREE.CubeGeometry(
        size,
        size,
        size
      ),
      this.stoneMaterial,
    );

    object.position.set(
      this.xOffset + point.x * this.size,
      point.z,
      this.yOffset + point.y * this.size
    );

    this.scene.add(object);
  };

  drawBlock = (point, type) => {
    const size = this.size;
    const object = new THREE.Mesh(
      new THREE.CubeGeometry(
        size,
        size,
        size
      ),
      this.metalMaterial,
    );

    object.position.set(
      this.xOffset + point.x * this.size,
      point.z,
      this.yOffset + point.y * this.size
    );

    this.scene.add(object);

    this.drawTopper(point, type);
  };

  drawTopper = (point, type) => {
    const size = this.size;
    const object = new THREE.Mesh(
      new THREE.CylinderGeometry(
        .0, .1, .2, 12
      ),
      this.metalMaterial,
    );

    object.position.set(
      this.xOffset + point.x * this.size,
      0.15 + point.z,
      this.yOffset + point.y * this.size
    );

    this.scene.add(object);
  };

  cameraLoop = () => {
    this.camPosition.x = this.camPosition.x - (this.camPosition.x - this.trsPosition.x) * 0.003;
    this.camPosition.y = this.camPosition.y - (this.camPosition.y - this.trsPosition.y) * 0.01;
    this.camPosition.z = this.camPosition.z - (this.camPosition.z - this.trsPosition.z) * 0.005;
    this.camera.position.set(
      this.camPosition.x,
      this.camPosition.y,
      this.camPosition.z
    );
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    const speed = this.frames * 0.8;
    const tx = .15 * Math.sin(speed * Math.PI / 180);
    const ty = .15 * Math.cos(speed * Math.PI / 180);
    this.camera.lookAt(
      new THREE.Vector3(
        this.camPosition.x + tx,
        0,
        0 // this.camPosition.z + ty
      )
    );
    if(!this.camTimeoutx && Math.random() * 255 > 253) {
      this.trsPosition.x = this.xOffset - Math.random() * (this.xOffset * 2);
      console.log(this.trsPosition.x);
      this.camTimeoutx = true;
      setTimeout(
        () => { this.camTimeoutx = false; },
        3000
      );
    }
    if(!this.camTimeouty && Math.random() * 255 > 252) {
      const level = Math.floor(Math.random() * 5);
      console.log(level);
      this.trsPosition.y = this.levelMap[level];
      this.camTimeouty = true;
      setTimeout(
        () => { this.camTimeouty = false; },
        3000
      );
    }
    if(!this.camTimeoutz && Math.random() * 255 > 253) {
      this.trsPosition.z =  this.yOffset - Math.random() * (this.yOffset * 2);
      this.camTimeoutz = true;
      setTimeout(
        () => { this.camTimeoutz = false; },
        3000
      );
    }
  };

  renderScene = () => {
    // Core three Render call //
    // this.composer.render();
    this.renderer.render(this.scene, this.camera);
  };

  renderLoop = () => {
    this.renderScene();
    this.cameraLoop();
    this.frames += 0.5;
    window.requestAnimationFrame(this.renderLoop.bind(this));
  };
}
