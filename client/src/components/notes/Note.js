import React from 'react';
import { ReactComponent as Heart } from '../../icon/heart.svg';
import { ReactComponent as ThumbsDown } from '../../icon/thumbs-down.svg';
import { ReactComponent as MessageSquare } from '../../icon/message-square.svg';
import { ReactComponent as ArrowUpRight } from '../../icon/arrow-up-right.svg';
import { ReactComponent as MoreVertical } from '../../icon/more-vertical.svg';

const Note = (props) => {

    const style = {
        fontSize: '13px',
    };

    const handleLike = () => {
        console.log("Liked");
        // Like or remove like
    }

    const handleDislike = () => {
        console.log("Disliked")
        // Dislike or remove dislike
        // If liked, remove like as wel
    }

    const handleComment = () => {
        console.log("Comment")
        // Show note and the compose element below to comment to the note
        // When sent, openNote
    }

    const handleMore = () => {
        console.log("More")
        // Show dropdown menu of more options
    }

    const handleShare  = () => {
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
    
    // {props.note.handle}
    // {props.note.published}

    // {props.note.content}
    
    return (
        <div onClick={openNote} className="vagabond-tile note" style={{padding:'15px'}}>
            <div className="pfp-container">
                <img onClick={openProfile} src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.xetN7SHvp311jOFzMXpFZwHaHa%26pid%3DApi&f=1"
                     width="100%"
                     height="auto"
                     style={{borderRadius:'50%'}}
                />
            </div>

            <div class="content">
                <div className="user-and-time">
                    <div className="handle" onClick={openProfile}>Username</div>
                    <div className="time">3h</div>
                </div>
                <div className="info">
                    tweetwtetetetetetweetwtetetetetetweetwtetetetetetweetwtetetetetetweetwtetetetetetweetwtetetetetetweetwtetetetete
                </div>
                <div className="icon-bar-horizontal" style={{justifyContent:'space-between'}}>
                    <div style={style}>
                        <Heart onClick={handleLike} className="note-icon" />1234
                    </div>
                    <div style={style}>
                        <ThumbsDown onClick={handleDislike} className="note-icon" />1234
                    </div>
                    <div style={style}>
                        <MessageSquare onClick={handleComment} className="note-icon" />1234
                    </div>
                    <div style={style}>
                        <ArrowUpRight onClick={handleShare} className="note-icon" />1234
                    </div>
                </div>
            </div>
            <div class="icon-bar-vertical" style={{justifyContent:'flex-start'}}>
                <MoreVertical onClick={handleMore} className="note-icon" style={{width:'20px',height:'20px'}}/>
            </div>
        </div>
    );
}

export default Note;