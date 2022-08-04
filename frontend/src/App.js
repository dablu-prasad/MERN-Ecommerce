import Header from "./component/layout/Header/Header.js"; 
import Footer from "./component/layout/Footer/Footer.js"; 
import "./App.css";
import {BrowserRouter as Router} from "react-router-dom"
import React from "react";
import WebFont from "webfontloader";
function App() {
  React.useEffect(()=>{
    WebFont.load({
      google:{
        families:["Roboto","Dronid Sans","Chilanka"],
      },
    });
  },[]);
  return (
    <Router>
    <Header />

    <Footer />
    </Router>
  );
}

export default App;
