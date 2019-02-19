import React, { Component } from 'react';
import {Redirect} from 'react-router-dom';

class MainView extends Component {
  state = {
    isMobile: false
  }

  componentDidMount() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      this.setState({
        isMobile: true
      });
    }
  }

  render() {
    if (this.state.isMobile) {
      return <Redirect to="/send"/>
    }
    return (
      <div>
        <h1>This is the main view</h1>
        {JSON.stringify(this.props, null, 2)}
      </div>
    )
  }
}

export default MainView;
