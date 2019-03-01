import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getLanterns, promiseHandler } from '../../utils/API';
import io from 'socket.io-client';
import * as THREE from 'three';
import { SpriteText2D, textAlign } from 'three-text2d';
import * as TWEEN from '@tweenjs/tween.js';
import random from 'canvas-sketch-util/random';
import { lerp, pingPong, inverseLerp } from 'canvas-sketch-util/math';
import * as OBJLoader from 'three-obj-loader';
OBJLoader(THREE);

const OrbitControls = require('three-orbit-controls')(THREE);

const socket = io('http://localhost:3001');

const styles = {
  position: 'absolute',
  zIndex: 9999,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%'
};

class MainView extends Component {
  state = {
    isMobile: false,
    lanterns: [],
    meshes: []
  };

  componentDidMount() {
    this.mobileCheck();
    this.initSocket();
    this.initThreeScene();
  }

  componentWillUnmount() {
    this.stop();
    this.mount.removeChild(this.renderer.domElement);
  }

  mobileCheck = () => {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      this.setState({
        isMobile: true
      });
    }
  };

  initSocket = () => {
    socket.on('connect', () => {
      socket.on('new lantern', data => {
        console.log(data);
        const lanterns = [...this.state.lanterns, data];
        this.setState({ lanterns });
      });
    });
  };

  pickLantern = () => {

    if (this.selectedLantern) {
      console.log('lantern active already');
      return false;
    }

    setTimeout(() => {
      const lanternName = this.meshes[Math.floor(Math.random() * this.meshes.length)];
      this.selectedLantern = this.scene.getObjectByName(lanternName).children[0];
      
      while (this.selectedLantern.position.y >= 0) {
        const lanternName = this.meshes[Math.floor(Math.random() * this.meshes.length)];
        this.selectedLantern = this.scene.getObjectByName(lanternName).children[0];
      }

      console.log(this.selectedLantern);

      const easing = TWEEN.Easing.Linear.None;

      new TWEEN.Tween(this.camera.position)
        .to(
          { z: this.selectedLantern.position.z + 0.5, x: this.selectedLantern.position.x + 2 },
          8000
        )
        .easing(easing)
        .onUpdate(() => {
          this.camera.lookAt(this.selectedLantern.position);
        })
        .onComplete(() => {
          this.cameraFocused = true;
          setTimeout(() => {
            this.selectedLantern = null;
            new TWEEN.Tween(this.camera.rotation)
              .to({ x: 0, y: 0, z: 0 }, 6000)
              .easing(easing)
              .start();
            new TWEEN.Tween(this.camera.position)
              .to({ x: 0, y: 0.5, z: 9 }, 6000)
              .easing(easing)
              .onComplete(() => {
                setTimeout(this.pickLantern, 30000);
              })
              .start();
          }, 15000);
        })
        .start();
    }, 5000);
  };

  initThreeScene = () => {
    this.meshes = [];
    this.time = 0;
    this.mesh = '';
    this.center = new THREE.Vector3(0, 0, 0);
    this.THREE = THREE;
    this.cameraFocused = false;
    this.selectedCube = '';

    const width = window.innerWidth;
    const height = window.innerHeight;
    //ADD SCENE
    this.scene = new this.THREE.Scene();

    this.camera = new this.THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 9);
    this.camera.lookAt(this.scene.position);

    //ADD RENDERER
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.logo = THREE.ImageUtils.loadTexture('/assets/images/mark-conference-logo-black.png');
    this.material = new THREE.MeshStandardMaterial({
      // map: this.logo,
      opacity: 1,
      roughness: 0.5,
      transparent: false,
      metalness: 0,
      emissive: '#C9AF5B',
      emissiveIntensity: 0.2
    });

    this.model = new this.THREE.OBJLoader().load('/assets/models/lantern.obj', object => {
      // For any meshes in the model, add our material.
      object.traverse(node => {
        if (node.isMesh) node.material = this.material;
      });

      this.mesh = object;
      this.mesh.scale.set(0.02, 0.02, 0.02);
      this.createLantern({ name: 'one' });
      this.createLantern({ name: 'two' });
      this.createLantern({ name: 'three' });
      setTimeout(this.pickLantern, 20000);

    });

    // for perspective
    this.scene.add(new THREE.GridHelper(15, 20));

    const light = new THREE.DirectionalLight('red', 1);
    light.position.set(2, 0, 2);
    this.scene.add(light);

    const ambientlight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientlight);

    const spotLight = new THREE.SpotLight();
    spotLight.position.set(0, 80, 30);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // remove this
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);


    this.start();
  };

  toRadians = angle => angle * (Math.PI / 180);
  toDegrees = angle => angle * (180 / Math.PI);

  // create new lantern
  createLantern = lanternInfo => {
    const parent = new THREE.Group();
    parent.name = lanternInfo.name;
    this.scene.add(parent);
    const lantern = this.mesh.clone();
    lantern.position.set(random.range(-5, 5), -8, random.range(0, 4));
    lantern.castShadow = true;
    lantern.receiveShadow = true;

    parent.userData = {
      user: 'Strato Doumanis',
      message:
        'Carles beard Echo Park tote bag bitters twee tousled single-origin coffee pickled letterpress chillwave PBR&B Tumblr swag ennui'
    };

    lantern.originalPosition = lantern.position.clone();

    const name = new SpriteText2D(parent.userData.user, {
        align: textAlign.center,
        font: '35px Arial',
        fillStyle: 'rgba(255,255,255,0.85)',
        antialias: true
      });
      name.scale.set(0.015, 0.015, 0.015);
      name.material.alphaTest = 0.1;

      parent.add(name);

    const position = lantern.position;
    this.target = { x: lantern.position.x, y: 30, z: lantern.position.z };
    const tween = new TWEEN.Tween(position).to(this.target, random.rangeFloor(80000, 100000));

    const zRotation = this.toRadians(random.range(5, 25));
    const tweenTimer = random.rangeFloor(4000, 10000);
    const tween2 = new TWEEN.Tween(lantern.rotation)
      .to({ z: '-' + zRotation }, tweenTimer)
      .easing(TWEEN.Easing.Quintic.InOut);

    const tween3 = new TWEEN.Tween(lantern.rotation)
      .to({ z: zRotation }, tweenTimer)
      .easing(TWEEN.Easing.Quintic.InOut);

    tween2.chain(tween3);
    tween3.chain(tween2);

    const randomNum = Math.random();
    tween.onUpdate(function() {
      lantern.rotation.x += 0.0008;
      lantern.rotation.y += 0.005;
      if (lantern.position.y >= 30) {
        lantern.position.y = -10;
      }
    });

    tween.repeat(Infinity);
    // tween2.repeat(Infinity);

    parent.add(lantern);
    tween.start();
    tween2.start();

    this.meshes.push(lanternInfo.name);
  };

  start = () => {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  stop = () => {
    cancelAnimationFrame(this.frameId);
  };

  animate = () => {
    this.time += 1;
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
    TWEEN.update();
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
    if (this.selectedLantern) {
      if (this.cameraFocused) {
        this.camera.lookAt(this.selectedLantern.position);
      }
      if (this.selectedLantern.position.y >= this.camera.position.y) {
        this.camera.position.y = this.selectedLantern.position.y;
      }
      /*  if (this.selectedCube.children[0].position.y >= 4) {
        this.selectedCube = null;
        new TWEEN.Tween(this.camera.rotation).to({ x: 0, y: 0, z: 0 }, 6000).start();
        new TWEEN.Tween(this.camera.position).to({ x: 0, y: 0.5, z: 9 }, 6000).start();
      } */
    }
  };

  getLanterns = async () => {
    const [err, res] = await promiseHandler(getLanterns());
    if (err) {
      console.log(err);
    }
    this.setState({
      lanterns: res
    });
  };

  render() {
    if (this.state.isMobile) {
      return <Redirect to="/send" />;
    }

    return (
      <div
        style={{ minWidth: '100vh', minHeight: '100vh', ...styles }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default MainView;
