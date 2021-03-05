import React from 'react';

import { ReactComponent as Heart } from '../../icon/heart.svg';
import { ReactComponent as ThumbsDown } from '../../icon/thumbs-down.svg';
import { ReactComponent as MessageSquare } from '../../icon/message-square.svg';
import { ReactComponent as ArrowUpRight } from '../../icon/arrow-up-right.svg';
import { ReactComponent as MoreVertical } from '../../icon/more-vertical.svg';

const Note = (props) => {

    const style = {
        flex: '1 1',
        maxWidth: '100px',
        fontSize: '15px'
    };


    // Instead of placeholder on lines 33 and 34 goes this:
    // {props.note.handle}<br />
    // {props.note.published}

    //and in 36 this {props.note.content}
    
    return (
        <div className="vagabond-tile note" style={{padding:'15px'}}>
            <div className="pfp-container">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.xetN7SHvp311jOFzMXpFZwHaHa%26pid%3DApi&f=1"
                     width="100%"
                     height="auto"
                />
            </div>
            <div class="content">
                <div className="handle">
                    sakldnaslkdnaslkdnaslkdas<br />
                    alksdjlaksnfklsdnflksdnfkldnsklfdlskfnlsdkfnsdklfnsdlknflksdf
                </div>
                    asdasdasdasdasdasdasdasdadsdas
                <div className="icon-bar-horizontal">
                    <div style={style}>
                        <Heart className="icon" />1234
                    </div>
                    <div style={style}>
                        <ThumbsDown className="icon" />1234
                    </div>
                    <div style={style}>
                        <MessageSquare className="icon" />1234
                    </div>
                    <div style={style}>
                        <ArrowUpRight className="icon" />1234
                    </div>
                </div>
            </div>
            <div class="icon-bar-vertical">
                <MoreVertical clqassName="icon" />
            </div>
        </div>
    );

}

export default Note;