import React, { useState } from "react"
import { ReactComponent as UserPlus } from '../../icon/user-plus.svg'
import { ReactComponent as Heart } from '../../icon/heart.svg';
import { ReactComponent as ThumbsDown } from '../../icon/thumbs-down.svg';
import { ReactComponent as MessageSquare } from '../../icon/message-square.svg';
import { ReactComponent as AtSign } from '../../icon/at-sign.svg';

const NotificationCenter = () => {

    // Interaction "object"

    const Interaction = (content, date, type) => { return { content: content, date: date, type: type } }

     // Mention "object", this includes mentions as well as comments (replies) under a note you made

    const Mention = (content, date, type, referenceNote) => { return { content: content, date: date, type: type, referenceNote: referenceNote } }

    const timestamp = new Date()

    const interactions = [
        Interaction("Cameron followed you",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Follow"),
        Interaction("Sav liked your post",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Like"),
        Interaction("Gerrad disliked your post",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Dislike"),
        Interaction("Jay followed you",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Follow"),
        Interaction("Jay liked your post",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Like"),
        Interaction("Cameron liked your post",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Like"),
    ]

    const mentions = [
        Mention("Cameron mentioned you in their new note",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Mention","If you want to feel desperately sad today, Tony Hawk has been sporadically doing tricks “for the last time ever” on his Instagram"),
        Mention("Replied to your post with:",timestamp.getHours() + ":" + timestamp.getMinutes() ,"Comment","Are you crazy???"),
    ]

    // =-=-=-

    const [option,setOption] = useState(true);

    const showMentions = () => {
        setOption(false)
        console.log(timestamp.getMinutes())
    } 

    const showInteractions = () => {
        setOption(true)
    } 

    
    return (
        <>
            <h1>Notifications</h1>
            <div style={{display:'flex',flexDirection:'row',width:'90%',margin:'0 auto 20px auto',justifyContent:'space-between'}}>
                <button onClick={showInteractions} className="notification-option" style={option ? {backgroundColor:'#339CFE',marginRight:'10px',color:'white'} : {backgroundColor:'white',marginRight:'10px',color:'black'}}>Interactions</button>
                <button onClick={showMentions} className="notification-option" style={option ? {backgroundColor:'white',color:'black'} : {backgroundColor:'#339CFE',color:'white'}}>Mentions</button>
            </div>
            <div style={{width:'90%',margin:'0 auto 0 auto'}}>
                {
                    option && 
                    <div>
                        {
                            interactions.map(content => 
                            <div className="interaction">
                                <div id="interaction-icon-parent" style={{margin:'auto 20px auto 20px'}}>
                                    { content.type.toLowerCase() == "follow" && <UserPlus className = "notification-icon"/> }
                                    { content.type.toLowerCase() == "like" && <Heart className = "notification-icon" style={{fill:'#FF6464',stroke:'#E70000'}}/> }
                                    { content.type.toLowerCase() == "dislike" && <ThumbsDown className = "notification-icon" style={{fill:'#454545',stroke:'#363636'}}/> }
                                </div>
                                <div style={{width:'100%'}}>
                                    {content.content}
                                </div>
                                <div style={{margin:'auto 20px auto 20px',color:'gray',fontSize:'13px'}}>
                                    {content.date}
                                </div>
                            </div>)
                        }
                    </div>
                }
                {
                    !option && 
                    <div>
                        {
                            mentions.map(content => 
                                <div className="mention">
                                    <div className="interaction">
                                        <div id="interaction-icon-parent" style={{margin:'auto 20px auto 20px'}}>
                                            { content.type.toLowerCase() == "mention" && <AtSign className = "notification-icon" style={{fill:'none'}}/> }
                                            { content.type.toLowerCase() == "comment" && <MessageSquare className = "notification-icon"/> }
                                        </div>
                                        <div style={{width:'100%'}}>
                                            {content.content}
                                        </div>
                                        <div style={{margin:'auto 20px auto 20px',color:'gray',fontSize:'13px'}}>
                                            {content.date}
                                        </div>
                                    </div>
                                    <div className="reference-note">
                                        "{content.referenceNote}"
                                    </div>
                                </div>
                            )
                        }
                    </div>
                }
            </div>
        </>
    );
}

export default NotificationCenter;