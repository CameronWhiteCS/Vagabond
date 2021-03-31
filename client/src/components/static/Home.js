import React from "react"
import ComposeNote from '../notes/ComposeNote.js';
import Feed from 'components/Feed.js';
import Note from  '../notes/Note.js'
import axios from 'axios';

import { store, handleError, initialState, updateSignIn, updateSignUp } from '../../reducer/reducer.js';

const Home = () => {
    function onSubmit() {
        console.log("clicked");
        axios.get('/api/v1/inbox').then((res) => { console.log(res.data); }).catch(handleError);
    }
    return (
        <div id="homeBody">
            <h1>Post</h1>
            <ComposeNote></ComposeNote>
            <h1>Feed</h1>
            <Feed/>
        </div>
      
    );
}

export default Home;
