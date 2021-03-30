import React from "react"
import Compose from '../notes/ComposeNote.js';
import Feed from '../Feed.js';
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
