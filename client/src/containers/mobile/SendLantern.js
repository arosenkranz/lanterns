import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

class SendLantern extends Component {
  state = {
    isMobile: true
  }

  componentDidMount() {
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
      this.setState({
        isMobile: false
      });
    }
  }

  render() {
    if (!this.state.isMobile) {
      return <Redirect to="/" />
    }
    return (
      <div>
        <h1>This is the mobile send lantern page</h1>
        {JSON.stringify(this.props, null, 2)}
      </div>
    )
  }
}

export default SendLantern;
