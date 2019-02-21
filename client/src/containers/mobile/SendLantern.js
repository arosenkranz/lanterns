import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { createLantern, checkLogin, promiseHandler } from '../../utils/API';
console.log(createLantern);
class SendLantern extends Component {
  state = {
    isMobile: true,
    message: '',
    isLoggedIn: true
  };

  componentDidMount() {
    // if (!/Mobi|Android/i.test(navigator.userAgent)) {
    //   return this.setState({
    //     isMobile: false
    //   });
    // }
    checkLogin()
      .then(({ data }) => {
        console.log(data);
        if (data.status) {
          this.setState({
            userData: data
          });
        }
        else {
          this.setState({
            isLoggedIn:false
          })
        }
      });
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
    console.log(lanternResult);
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
      <div>
        <form onSubmit={handleFormSubmit}>
          <textarea value={message} onChange={handleInputChange} name="message" placeholder="Message Here" />
          <button onClick={handleFormSubmit}>Submit Form</button>
        </form>
      </div>
    );
  }
}

export default SendLantern;
