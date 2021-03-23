import React from "react"
import Compose from '../notes/ComposeNote.js';
import Note from  '../notes/Note.js'
import Feed from '../Feed.js';


const Home = () => {
    
    return (
        <div id="homeBody">
            <h1>Post</h1>
            <Compose></Compose>
            <h1>Feed</h1>
            <Feed/>
        </div>
      
    );
}

export default Home;
