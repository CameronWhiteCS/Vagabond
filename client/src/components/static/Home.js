import React from "react"
import Compose from '../notes/ComposeNote.js';
import Feed from '../Feed.js';
import Note from  '../notes/Note.js'


const Home = () => {
    return (
        <div id="homeBody">
            <h1>Post</h1>
            <Compose></Compose>
            <h1>Feed</h1>
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
            <Note />
        </div>
      
    );
}

export default Home;
