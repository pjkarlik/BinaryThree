![travis ci build](https://travis-ci.org/pjkarlik/BinaryThree.svg?branch=master)
![webpack3](https://img.shields.io/badge/webpack-3.0-brightgreen.svg) ![version](https://img.shields.io/badge/version-0.0.1-orange.svg) ![frontend](https://img.shields.io/badge/webgl-GLSL-blue.svg)

# BinaryThree

![BinaryThree](./splash.png)

  *Working codebase for Maze generation using THREE.js and Binary Tree Mazes. Basic concepts and experiments with motion and interaction - WIP repo use at your own risk.*

## Concept
 For every cell in the grid, randomly carve a passage either north, or west. A side-effect of this algorithm is that it has a strong diagonal bias. Also, two of the four sides of the maze will be spanned by a single corridor.


Application start point --> ```index.js``` --> (load render file) ```/BinaryCube/index.js```

## Requirments
  Please have a current version of Node and Yarn installed. Open a terminal window and type the following commans.

```bash
$ yarn install
$ yarn dev
```

Then open a browser to http://localhost:2020

## Use of Three.js

Three.js is imported and added into a global namespace which allows the use of their example and addon scrips like OrbitControls or shaders. If you wish to add or edit any of the Three's dependencies or controlls you should do it from the ```src\Three.js``` file. 

  ```
  import * as THREE from 'three'; // build/three.js from node_module/three
  window.THREE = THREE;
  require('three/examples/js/controls/OrbitControls.js');
  require('three/examples/js/shaders/FresnelShader');
  // ...etc for other items like Render Passes and Shaders
  ```

## License

[MIT]
