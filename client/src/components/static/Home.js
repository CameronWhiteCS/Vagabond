import React from "react"
import ComposeNote from '../notes/ComposeNote.js';
import Feed from 'components/Feed.js';


const Home = () => {
    
    return (
        <div id="homeBody">
            <h1>Post</h1>
            <ComposeNote></ComposeNote>
            <h1>Inbox</h1>
            <Feed type="inbox"/>
        </div>
      
    );
}

export default Home;
