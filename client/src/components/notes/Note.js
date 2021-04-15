import { ReactComponent as Heart } from 'icon/heart.svg';
import { ReactComponent as MessageSquare } from 'icon/message-square.svg';
import { ReactComponent as ArrowUpRight } from 'icon/arrow-up-right.svg';
import { ReactComponent as MoreVertical } from 'icon/more-vertical.svg';
import { ReactComponent as Trash2 } from 'icon/trash-2.svg';

import React, { useState } from 'react';
import { addLoadingReason, handleError, removeLoadingReason, updateReply } from 'reducer/reducer.js';
import { store } from 'reducer/reducer.js';

import { Link, useHistory } from 'react-router-dom';

import axios from 'axios';
import config from 'config/config.js';


import sanitizeHtml from 'sanitize-html';

/**
* props.note: relevant note object
 */
const Note = (props) => {

    const [currentActor, setCurrentActor] = useState(store.getState().session.currentActor);
    const [deleted, setDeleted] = useState(false);

    store.subscribe(() =>{
        setCurrentActor(store.getState().session.currentActor);
    });


    const style = {
        fontSize: '13px'
    };

    const handleLike = () => {
        const currentActor = store.getState().session.currentActor;
        axios.post(`/api/v1/actors/${currentActor.username}/outbox`, {
            ['@context']: 'https://www.w3.org/ns/activitystreams',
            type: 'Like',
            object: props.note,
            to: ['https://www.w3.org/ns/activitystreams#Public'],
            cc: [props.note.attributedTo, `${config.apiUrl}/actors/${currentActor.username}/followers`]
        })
            .then((res) => {

            })
            .catch(handleError)
    }

    const handleComment = () => {
        store.dispatch(updateReply(props.note));
    }

    const handleDelete = () => {

        const args = {
            ['@context']: ['https://www.w3.org/ns/activitystreams'],
            type: 'Delete',
            object: props.note.id,
            published: new Date().toISOString(),
            to: ['https://www.w3.org/ns/activitystreams#Public'],
            cc: [`${config.apiUrl}/actors/${currentActor.username}/followers`]
        };

        console.log(args);

        const loadingReason = 'Deleting note'
        store.dispatch(addLoadingReason(loadingReason))
        axios.post(`/api/v1/actors/${currentActor.username}/outbox`, args)
        .then((res) => {
            setDeleted(true);
        })
        .catch(handleError)
        .finally(() => {
            store.dispatch(removeLoadingReason(loadingReason))
        })
    }

    const handleMore = () => {
        // Show dropdown menu of more options
    }

    const handleShare = () => {
        // Show options to share
    }

    const openProfile = () => {
        // Open profile who made the note
    }

    const processUsername = (url) => {
        if (!url) return undefined
        let length = url.length;
        if (url.charAt(length - 1) === '/') { url = url.substring(0, length - 1); }
        const parts = url.split('/');
        return parts[parts.length - 1]
    }

    if(deleted === true) {
        return (
            <></>
        )
    }

    return (
        <div className="vagabond-tile note" style={{ padding: '15px' }}>
            <div className="pfp-container">
                <img onClick={openProfile}
                    src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.xetN7SHvp311jOFzMXpFZwHaHa%26pid%3DApi&f=1"
                    width="100%"
                    height="auto"
                    style={{ borderRadius: '50%' }}
                    alt="PFP"
                />
            </div>
            <div className="content-container">
                <div className="user-and-time">
                    <div className="handle" onClick={openProfile}>{processUsername(props.note?.attributedTo)}</div>
                    <div className="time">{new Date(props.note?.published).toUTCString()}</div>
                </div>
                <div className="note-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.note?.content), style: { color: 'black' } }}>
                </div>
                <div className="icon-bar-horizontal" style={{ justifyContent: 'space-between' }}>
                    <div style={style}>
                        <Heart onClick={handleLike} className="note-icon" />
                    </div>
                    <div style={style}>
                        <Link to="/reply" title="Comment" onClick={handleComment}>
                            <MessageSquare className="note-icon" />
                        </Link>
                    </div>
                    <div style={style}>
                        <ArrowUpRight onClick={handleShare} className="note-icon" />
                    </div>
                    {
                        props.note.attributedTo == `${config.apiUrl}/actors/${currentActor?.username}` &&
                        <div style={style}>
                            <Trash2 onClick={handleDelete} className="note-icon" />
                        </div>
                    }
                </div>
            </div>
            <div className="icon-bar-vertical" style={{ justifyContent: 'flex-start' }}>
                <MoreVertical onClick={handleMore} className="note-icon" style={{ width: '20px', height: '20px' }} />
            </div>
        </div>
    );
}

export default Note;