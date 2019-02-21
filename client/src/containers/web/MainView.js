import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { getLanterns, promiseHandler } from '../../utils/API';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

class MainView extends Component {
  state = {
    isMobile: false,
    lanterns: []
  };

  componentDidMount() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      this.setState({
        isMobile: true
      });
    }
    socket.on('connect', () => {
      socket.on('new lantern', data => {
        console.log(data);
        const lanterns = [...this.state.lanterns, data];
        this.setState({lanterns});
      });
    });
  }

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
    const { lanterns } = this.state;

    if (this.state.isMobile) {
      return <Redirect to="/send" />;
    }
    return (
      <div>
        <h1>This is the main view</h1>
        <ul className="list-group">
          {lanterns.map(({ _id, displayName, message }) => {
            return (
              <li key={_id} className="list-group-item">
                {displayName}: {message}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default MainView;
