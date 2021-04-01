import React from "react"
import ComposeNote from '../notes/ComposeNote.js';
import InboxViewer from 'components/InboxViewer.js.js';
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
            <InboxViewer/>
        </div>
      
    );
}

export default Home;
