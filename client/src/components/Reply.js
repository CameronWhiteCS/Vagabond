import React, { useEffect, useState } from "react"
import axios from 'axios';
import { store, handleError, addLoadingReason, removeLoadingReason } from "reducer/reducer";
import Note from "components/notes/Note.js"
import ComposeNote from "components/notes/ComposeNote.js"
import Compose from "components/notes/ComposeNote.js";


const Reply = () => {

    const [reference, setReference] = useState(store.getState().reply) 
        
    store.subscribe(() => { setReference(store.getState().reply); })

    return (
        <>
            <h1>Reply</h1>
            <div id="replier" style={{backgroundColor:'lightgray',paddingBottom:'20px',display:'flex',flexDirection:'column',alignItem:'center',justifyContent:'center',margin:'0 20px 0 20px',borderRadius:'10px'}}>
                <Note activity={reference}/>
                <div style={{height:'30px',backgroundColor:'gray',width:'15px',margin:'0px 0 0px 50px'}} ></div>
                <ComposeNote inReplyTo={store.getState().reply?.object?.id}/>
            </div>
        </>
    );
}

export default Reply;