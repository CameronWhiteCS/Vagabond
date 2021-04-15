import React, { useEffect, useState } from "react"
import axios from 'axios';
import { store, handleError, addLoadingReason, removeLoadingReason, updateReply } from "reducer/reducer";
import Note from "components/notes/Note.js"
import ComposeNote from "components/notes/ComposeNote.js"
import OrderedCollectionViewer from "./OrderedCollectionViewer";


const Reply = () => {

    const [reply, setReply] = useState(store.getState().reply);
    
    if(reply === undefined) {

    }

    store.subscribe(() => {
        setReply(store.getState().reply);
    });

    return (
        <>
            <h1>Draft New Reply</h1>
            <div id="replier" style={{backgroundColor:'lightgray',paddingBottom:'20px',display:'flex',flexDirection:'column',alignItem:'center',justifyContent:'center',margin:'0 20px 0 20px',borderRadius:'10px'}}>
                <Note note={reply}/>
                <div style={{height:'30px',backgroundColor:'gray',width:'15px',margin:'0px 0 0px 50px'}} ></div>
                <ComposeNote inReplyTo={reply} />
            </div>
            {
                reply.replies !== undefined && 
                <>
                    <h1>Existing Replies</h1>
                    <OrderedCollectionViewer id={reply.replies} render={(item) => {
                        return <Note note={item} id={item.id} />
                    }} />
                </>
            }
        </>
    );
}

export default Reply;