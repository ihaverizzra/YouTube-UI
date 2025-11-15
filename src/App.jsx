/* eslint-disable no-unused-vars */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './utils/store';
import "./index.css";
import Header from './Components/Header';
import Body from './HomePageContainer/Body';
import MainContainer from './Components/MainContainer';
import WatchPage from './HomePageContainer/WatchPage';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<MainContainer />} />
            <Route path="/watch" element={<WatchPage />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
