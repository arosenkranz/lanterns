import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainView from './containers/web/MainView';
import SendLantern from './containers/mobile/SendLantern';
import ViewLanterns from './containers/mobile/ViewLanterns';

const App = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={MainView} />
          <Route exact path="/view" component={ViewLanterns} />
          <Route exact path="/send" component={SendLantern} />
          <Route component={MainView} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
