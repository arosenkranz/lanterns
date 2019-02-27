import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getLanterns, promiseHandler } from '../../utils/API';
import io from 'socket.io-client';
import * as THREE from 'three';
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

  initThreeScene = () => {
    this.meshes = [];
    this.time = 0;
    this.mesh = '';
    this.THREE = THREE;

    const width = window.innerWidth;
    const height = window.innerHeight;
    //ADD SCENE
    this.scene = new this.THREE.Scene();

    this.camera = new this.THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 9);
    this.camera.lookAt(this.scene.position);

    //ADD RENDERER
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true, alpha: true });
    // this.renderer.setClearColor('#fff');
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD CUBE
    this.geometry = new this.THREE.BoxGeometry(0.2, 0.2, 1);

    this.logo = THREE.ImageUtils.loadTexture('/assets/images/mark-conference-logo-black.png');
    this.material = new THREE.MeshStandardMaterial({
      // map: this.logo,
      opacity: 1,
      roughness: 1,
      transparent: false,
      metalness: 0,
      emissive: '#C9AF5B',
      emissiveIntensity: 0
    });

    this.model = new this.THREE.OBJLoader().load('/assets/models/lantern.obj', object => {
      // For any meshes in the model, add our material.
      object.traverse(node => {
        if (node.isMesh) node.material = this.material;
      });

      this.mesh = object;
      this.mesh.scale.set(.05, .05, .05);
      console.log(this.mesh);
      this.createLantern({ name: 'one' });
      // this.createLantern({ name: 'two' });
      // this.createLantern({ name: 'three' });
    });

    // for perspective
    this.scene.add(new THREE.GridHelper(15, 20));

    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(2, 0, 2);
    this.scene.add(light);

    const ambientlight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientlight);

    const spotLight = new THREE.SpotLight();
    spotLight.position.set(0, 80, 30);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    this.controls = new OrbitControls(this.camera);
    this.controls.enableDamping = false;
    this.controls.autoRotate = false;

    this.start();
  };

  // create new lantern
  createLantern = lanternInfo => {
    const parent = new THREE.Object3D();
    parent.name = lanternInfo.name;
    this.scene.add(parent);
    const lantern = this.mesh.clone();
    // const cube = new THREE.Mesh(this.geometry, this.material);
    lantern.position.set(random.range(-3.5, 3.5), -10, random.range(-6, 9));
    lantern.castShadow = true;
    lantern.receiveShadow = true;

    lantern.originalPosition = lantern.position.clone();

    const position = lantern.position;
    const rotation = lantern.rotation;
    const target = { x: lantern.position.x, y: 5, z: lantern.position.z };

    const tween = new TWEEN.Tween(position).to(target, 10000);

    const tween2 = new TWEEN.Tween({rotation: 0}).to({rotation: 45}, 2000);
    const tween3 = new TWEEN.Tween(lantern.rotation).to({rotation : -45}, 2000);
    tween2.chain(tween3);
    tween3.chain(tween2);

    const randomNum = Math.random();
    tween.onUpdate(function() {
      // cube.rotation.z = lerp(-10.25, 10.25, Math.random());

      // cube.position.x = position.x;
      lantern.position.y = position.y;
    });

    tween.repeat(Infinity);
    tween2.repeat(Infinity);

    parent.add(lantern);
    tween.start();

    this.meshes.push(lantern);
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
    this.controls.update();
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
    TWEEN.update();
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
    /* if (this.selectedCube) {
      console.log(this.camera);
      this.camera.target.position.copy(this.selectedCube.position);
    } */
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

    setTimeout(() => {
      this.selectedCube = this.scene.getObjectByName('one');

      console.log(this.selectedCube);
    }, 5000);

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
