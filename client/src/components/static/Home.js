import React from "react"
import ComposeNote from '../notes/ComposeNote.js';
import InboxViewer from 'components/InboxViewer.js.js';

const Home = () => {
    return (
        <div id="homeBody">
            <h1>Post</h1>
            <ComposeNote></ComposeNote>
            <InboxViewer/>
        </div>
      
    );
}

export default Home;
