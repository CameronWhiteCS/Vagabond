import React, { useState } from "react"

const NotificationCenter = () => {

    // Placeholder to simulate backend because I don't know how to connect it

    const interactions = ["Cameron disliked your post","Savannah followed you","Gerrad liked your post","Jay followed you"]

    const mentions = ["Cameron mentioned you in his tweet: jsdklajdlkjsalkjdad","Savannah replied to your tweet: askldhakldhalskdha"]

    // =-=-=-

    const [option,setOption] = useState(true);

    const showMentions = () => {
        setOption(false)
    } 

    const showInteractions = () => {
        setOption(true)
    } 

    return (
        <>
            <h1>Notifications</h1>
            <div style={{display:'flex',flexDirection:'row',width:'90%',margin:'0 auto 20px auto',justifyContent:'space-between'}}>
                <button onClick={showInteractions} className="notification-option" style={option ? {backgroundColor:'#339CFE',marginRight:'10px'} : {backgroundColor:'white',marginRight:'10px'}}>Interactions</button>
                <button onClick={showMentions} className="notification-option" style={option ? {backgroundColor:'white',marginRight:'10px'} : {backgroundColor:'#339CFE',marginRight:'10px'}}>Mentions</button>
            </div>
            <div style={{width:'90%',backgroundColor:'green',margin:'0 auto 0 auto'}}>
                {
                    option && 
                    <div>
                        {
                            interactions.map(content => <div>{content}</div>)
                        }
                    </div>
                }
                {
                    !option && 
                    <div>
                        {
                            mentions.map(content => <div>{content}</div>)
                        }
                    </div>
                }
            </div>
        </>
    );
}

export default NotificationCenter;