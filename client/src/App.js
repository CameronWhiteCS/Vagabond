
import Routes from './components/navigation/Routes.js';
import Navigation from './components/navigation/Navigation.js';
import { BrowserRouter as Router } from 'react-router-dom';
import NotificationModal from './components/NotificationModal.js';
import './css/App.css';
import { store } from './reducer/reducer.js';
import { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import Logo from "./components/navigation/VagabondWhite.png"
import { Container } from 'react-bootstrap';

import LeftBar from './components/static/LeftBar.js'
import RightBar from './components/static/RightBar.js';

const App = () => {
  const [leftBarVisible, setLeftBarVisible] = useState(true);
  const [rightBarVisible, setRightBarVisible] = useState(true);

  useEffect(() => {
    axios.get('/api/v1/session')
      .then((res) => {
        store.dispatch({ type: 'SET_SESSION', session: { ...store.getState().session, ...res.data } });
      })
      .catch((err) => { });
  }, []);


  function toggleVisibilityLeft() {
    if(leftBarVisible) {
      document.getElementById("hideBarLeft").style.justifyContent = "flex-start";
      document.getElementById("hideBarLeft").style.background = "#454545";
      document.getElementById("hideBarLeft").style.marginTop = "30px";
      document.getElementById("hideButtonLeft").style.fontSize = "25px";
      document.getElementById("hideButtonLeft").innerText = "Profile";
      document.getElementById("hideButtonLeft").style.background = "white";
      setLeftBarVisible(false);
    }
    else {
      document.getElementById("hideButtonLeft").style.backgroundColor = "rgba(255, 255, 255,0)";
      document.getElementById("hideBarLeft").style.justifyContent = "flex-end";
      document.getElementById("hideBarLeft").style.background = "white";
      document.getElementById("hideBarLeft").style.marginTop = "0px";
      document.getElementById("hideButtonLeft").style.fontSize = "30px";
      document.getElementById("hideButtonLeft").innerText = "-";
      setLeftBarVisible(true);
    }
  }

  function toggleVisibilityRight() {
    if(rightBarVisible) {
      document.getElementById("hideBarRight").style.justifyContent = "flex-end";
      document.getElementById("hideBarRight").style.background = "#454545";
      document.getElementById("hideBarRight").style.marginTop = "30px";
      document.getElementById("hideButtonRight").style.fontSize = "25px";
      document.getElementById("hideButtonRight").innerText = "Explore";
      document.getElementById("hideButtonRight").style.background = "white";
      setRightBarVisible(false);
    }
    else {
      document.getElementById("hideButtonRight").style.backgroundColor = "rgba(255, 255, 255,0)";
      document.getElementById("hideBarRight").style.justifyContent = "flex-start";
      document.getElementById("hideBarRight").style.background = "white";
      document.getElementById("hideBarRight").style.marginTop = "0px";
      document.getElementById("hideButtonRight").style.fontSize = "30px";
      document.getElementById("hideButtonRight").innerText = "-";
      setRightBarVisible(true);
    }
  }

  return (
    <>
      <NotificationModal />
      <Router>
        <Navigation />
        <div id="container-root">
          <div id="sidebar-left">
            <div id="hideBarLeft"><button id="hideButtonLeft" onClick={toggleVisibilityLeft}>-</button></div>
            {
                leftBarVisible && 
                <LeftBar></LeftBar>
            }
            
          </div>
          <div id="container-center">
              <Routes />
          </div>
          
          <div id="sidebar-right">
            <div id="hideBarRight"><button id="hideButtonRight" onClick={toggleVisibilityRight}>-</button></div>
              {
                  rightBarVisible && 
                  <RightBar></RightBar>
              }
          </div>
        </div>

      </Router>
    </>
  );
}

export default App;
