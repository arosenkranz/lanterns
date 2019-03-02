import React, { Component, Fragment } from 'react';
import { Redirect } from 'react-router-dom';
import { createLantern, checkLogin, promiseHandler } from '../../utils/API';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

import * as OBJLoader from 'three-obj-loader';
OBJLoader(THREE);
class SendLantern extends Component {
  state = {
    isMobile: true,
    message: '',
    isLoggedIn: true,
    success: false,
    userData: {}
  };

  componentDidMount() {
    // if (!/Mobi|Android/i.test(navigator.userAgent)) {
    //   return this.setState({
    //     isMobile: false
    //   });
    // }
    checkLogin().then(({ data }) => {
      console.log(data);
      if (data.status) {
        this.setState({
          userData: data
        });
      } else {
        this.setState({
          isLoggedIn: false
        });
      }
    });
    this.initThreeScene();
  }

  checkPage = () => {
    if (!this.state.isMobile) {
      return <Redirect to="/" />;
    } else if (!this.state.isLoggedIn) {
      return <Redirect to="/sign-in" />;
    }
  };

  handleInputChange = event => {
    const { name, value } = event.target;

    this.setState({
      [name]: value
    });
  };

  handleFormSubmit = async event => {
    event.preventDefault();

    if (!this.state.message) {
      return false;
    }

    const [err, lanternResult] = await promiseHandler(createLantern({ message: this.state.message }));

    if (err) {
      console.log(err);
      return false;
    }

    if (lanternResult.data.name === 'ValidationError') {
      return this.setState({
        success: false
      });
    }
    
    this.setState({ success: true });
    console.log(this.mesh);
    new TWEEN.Tween(this.mesh.position)
      .to({ y: 10 }, 25000)
      .delay(1500)
      .easing(TWEEN.Easing.Linear.None)
      .start();
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
    const height = window.innerHeight / 2;
    //ADD SCENE
    this.scene = new this.THREE.Scene();

    this.camera = new this.THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 2);
    this.camera.lookAt(this.scene.position);

    //ADD RENDERER
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);

    this.material = new THREE.MeshStandardMaterial({
      opacity: 1,
      roughness: 0.5,
      transparent: false,
      metalness: 0,
      emissive: '#C9AF5B',
      emissiveIntensity: 0.2
    });
    console.log('hi');
    this.model = new this.THREE.OBJLoader().load('/assets/models/lantern.obj', object => {
      // For any meshes in the model, add our material.
      object.traverse(node => {
        if (node.isMesh) node.material = this.material;
      });
      this.mesh = object;
      this.mesh.scale.set(0.035, 0.035, 0.035);
      this.mesh.position.set(0, -0.25, 0);
      console.log(this.mesh);
      this.scene.add(this.mesh);
    });

    const light = new THREE.DirectionalLight('red', 1);
    light.position.set(2, 0, 2);
    this.scene.add(light);

    const ambientlight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientlight);

    const spotLight = new THREE.SpotLight();
    spotLight.position.set(0, 80, 30);
    spotLight.castShadow = true;
    this.scene.add(spotLight);

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
    if (this.mesh) {
      this.mesh.rotation.y += 0.005;
    }
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
    TWEEN.update();
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    if (!this.state.isMobile) {
      return <Redirect to="/" />;
    } else if (!this.state.isLoggedIn) {
      return <Redirect to="/sign-in" />;
    }

    const {
      state: { message },
      handleFormSubmit,
      handleInputChange
    } = this;

    return (
      <div className="d-flex flex-column align-items-center justify-content-between" style={{ minHeight: '100vh' }}>
        <div
          style={{ minHeight: '30%', minWidth: '100%' }}
          ref={mount => {
            this.mount = mount;
          }}
        />
        <div className="header-section">
          {this.state.success ? (
            <h2 className="text-center text-light">
              Thank you for leaving your MARK, {this.state.userData.displayName}! Your lantern will be featured on our
              screen soon!
            </h2>
          ) : (
            <Fragment>
              <h2 className="text-center text-light">
                {this.state.userData.displayName}, Leave Your MA
                <span style={{ color: 'red' }}>R</span>K
              </h2>
              <p className="text-center">
                Submit a message of hope, inspiration, or observation to light your lantern. Login with Google or
                Facebook to continue.
              </p>

              <form className="w-100" onSubmit={handleFormSubmit}>
                <textarea
                  className="text-input"
                  value={message}
                  onChange={handleInputChange}
                  name="message"
                  placeholder="Message Here"
                />

                <button className="submit-btn" onClick={handleFormSubmit}>
                  Send
                </button>
              </form>
            </Fragment>
          )}
        </div>

        {/*  <img
          src="/assets/images/mark-conference-logo-white.png"
          className="text-center img-fluid w-50"
          alt="Mark-logo"
        /> */}
      </div>
    );
  }
}

export default SendLantern;
