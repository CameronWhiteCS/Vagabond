import React from "react"
import Compose from '../notes/ComposeNote.js';
import Feed from '../Feed.js';


const Home = () => {
    return (
        <div id="homeBody">
            <h1>Post</h1>
            <Compose></Compose>
            <h1>Feed</h1>
        </div>
      
    );
}

export default Home;
