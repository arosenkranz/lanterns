import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getLanterns, promiseHandler } from '../../utils/API';
import io from 'socket.io-client';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import random from 'canvas-sketch-util/random';
import {lerp, pingPong, inverseLerp} from 'canvas-sketch-util/math';

const socket = io('http://localhost:3001');

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

    console.log(this.mount);
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(width, height);
    //ADD SCENE
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 9);
    this.camera.lookAt(this.scene.position);

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x140b33, 1);
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD CUBE
    this.geometry = new THREE.BoxGeometry(0.2, 0.2, 1);
    this.material = new THREE.MeshStandardMaterial({
      metalness: 0,
      roughness: 1,
      color: '#ba8f44'
    });

    // for perspective
    this.scene.add(new THREE.GridHelper(15, 20));

    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(2, 0, 2);
    this.scene.add(light);

    const ambientlight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientlight);

    var spotLight = new THREE.SpotLight();
    spotLight.position.set(0, 80, 30);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    this.createLantern({ name: 'one' });
    this.createLantern({ name: 'two' });
    this.createLantern({ name: 'three' });

    this.start();
  };

  // create new lantern
  createLantern = lanternInfo => {
    const parent = new THREE.Object3D();
    parent.name = lanternInfo.name;
    this.scene.add(parent);

    const cube = new THREE.Mesh(this.geometry, this.material);
    cube.position.set(random.range(-3.5, 3.5), -10, random.range(-6, 9));
    console.log(cube);
    cube.castShadow = true;
    cube.receiveShadow = true;

    cube.originalPosition = cube.position.clone();

    const position = cube.position;
    const target = { x: cube.position.x, y: 5, z: cube.position.z };

    const tween = new TWEEN.Tween(position).to(target, 10000);

    const randomNum = Math.random();
    tween.onUpdate(function() {
      cube.rotation.z = lerp(-10.25, 10.25, Math.random());

      // cube.position.x = position.x;
      cube.position.y = position.y;
    });

    tween.repeat(Infinity);

    parent.add(cube);
    tween.start();

    this.meshes.push(cube);
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
    // this.cube.rotation.x += 0.01;
    // this.cube.rotation.y += 0.01;
    this.time += 1;
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
        style={{ minWidth: '100vh', minHeight: '100vh' }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default MainView;
