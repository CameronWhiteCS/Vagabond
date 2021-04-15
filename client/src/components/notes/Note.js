import React from 'react';
import { useState, useEffect } from 'react';
import { ReactComponent as Heart } from 'icon/heart.svg';
import { ReactComponent as ThumbsDown } from 'icon/thumbs-down.svg';
import { ReactComponent as MessageSquare } from 'icon/message-square.svg';
import { ReactComponent as ArrowUpRight } from 'icon/arrow-up-right.svg';
import { ReactComponent as MoreVertical } from 'icon/more-vertical.svg';
import { updateReply } from 'reducer/reducer.js';
import { store } from 'reducer/reducer.js';

import { Link, useHistory } from 'react-router-dom';

import sanitizeHtml from 'sanitize-html';
import OrderedCollectionViewer from 'components/OrderedCollectionViewer';

const Note = (props) => {

    const history = useHistory();

    const style = {
        fontSize: '13px'
    };

    const handleLike = () => {
        console.log("Liked");
        console.log(props.activity?.attributedTo);
        // Like or remove like
    }

    const handleDislike = () => {
        console.log("Disliked")
    }

    const handleComment = () => { store.dispatch(updateReply(props.activity)) }

    const handleMore = () => {
        console.log("More")
        // Show dropdown menu of more options
    }

    const handleShare = () => {
        console.log("Share")
        // Show options to share
    }

    const openNote = () => {
        console.log("Open Note")
        // Open tweet as the whole middle container
        // Open the list of existing replies as well
    }

    const openProfile = () => {
        console.log("Open profile")
        // Open profile who made the note
    }

    const processUsername = (url) => {
        if (!url) return undefined
        let length = url.length;
        if (url.charAt(length - 1) === '/') { url = url.substring(0, length - 1); }
        const parts = url.split('/');
        return parts[parts.length - 1]
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
                    <div className="handle" onClick={openProfile}>{processUsername(props.activity?.actor)}</div>
                    <div className="time">{new Date(props.activity?.published).toUTCString()}</div>
                </div>
                <div className="note-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(props.activity?.object.content), style: {color: 'black'} }}>
                </div>
                <div className="icon-bar-horizontal" style={{ justifyContent: 'space-between' }}>
                    <div style={style}>
                        <Heart onClick={handleLike} className="note-icon" />1234
                </div>

                    <div style={style}>
                        <ThumbsDown onClick={handleDislike} className="note-icon" />1234
                </div>

                    <div style={style}>
                        <Link to="/reply" title="Comment" onClick={handleComment}>
                            <MessageSquare className="note-icon" />1234
                    </Link>
                    </div>

                    <div style={style}>
                        <ArrowUpRight onClick={handleShare} className="note-icon" />1234
                </div>
                </div>
            </div>
            <div className="icon-bar-vertical" style={{ justifyContent: 'flex-start' }}>
                <MoreVertical onClick={handleMore} className="note-icon" style={{ width: '20px', height: '20px' }} />
            </div>
        </div>
    );
}

export default Note;