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
    console.log(Promise.resolve(checkLogin) == checkLogin);
    checkLogin
      .then(({ data }) => {
        console.log(data);
        if (data.success) {
          this.setState({
            userData: data
          });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isLoggedIn: false
        });
      });
  }

  checkPage = () => {
    if (!this.state.isMobile) {
      return <Redirect to="/" />;
    } else if (!this.state.isLoggedIn) {
      return <Redirect to="http://localhost:3001/api/auth" />;
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
    this.checkPage();

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
