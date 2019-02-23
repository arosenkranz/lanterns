import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getLanterns, promiseHandler } from '../../utils/API';
import io from 'socket.io-client';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const socket = io('http://localhost:3001');

class MainView extends Component {
  state = {
    isMobile: false,
    lanterns: []
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
    console.log(this.mount);
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    console.log(width, height);
    //ADD SCENE
    this.scene = new THREE.Scene();

    //ADD CAMERA
    this.camera = new THREE.OrthographicCamera();
    // Setup an isometric perspective
    const aspect = width / height;
    const zoom = 1.85;
    this.camera.left = -zoom * aspect;
    this.camera.right = zoom * aspect;
    this.camera.top = zoom;
    this.camera.bottom = -zoom;
    this.camera.near = -100;
    this.camera.far = 100;
    this.camera.position.set(zoom, zoom, zoom);
    this.camera.lookAt(new THREE.Vector3());

    // Update camera properties
    this.camera.updateProjectionMatrix();

    //ADD RENDERER
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor('#000000');
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    //ADD CUBE
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      metalness: 0,
      roughness: 0.4,
      color: '#ba8f44'
    });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.set(-1, -1.5, 0);

    this.scene.add(this.cube);

    const light = new THREE.DirectionalLight('white', 1);
    light.position.set(2, 0, 2);
    this.scene.add(light);

    const ambientlight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientlight);

    this.start();
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
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
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
        style={{ minWidth: '100vh', minHeight: '100vh' }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default MainView;
