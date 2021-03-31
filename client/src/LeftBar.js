import React, { useState, useEffect } from 'react';
import { store, handleError, initialState } from './reducer/reducer.js';
import axios from 'axios';
import { Link } from 'react-router-dom';


const LeftBar = (props) => {

    const [visible, setVisible] = useState(true)
    const [session, setSession] = useState(initialState.session)

    const [following, setFollowing] = useState("...");
    const [followers, setFollowers] = useState("...");

    const [actor, setActor] = useState(`loading...`)

    useEffect(() => {
        store.subscribe(() => { 
            setActor(store.getState().session.currentActor.username); 
            setSession(store.getState().session)
        })
        // Having the handle error throws an error even though it actually works.. ??
        //.catch(handleError);
        axios.get(`/api/v1/actors/${actor}/following`).then((res) => { setFollowing(res.data.totalItems) });
        axios.get(`/api/v1/actors/${actor}/followers`).then((res) => { setFollowers(res.data.totalItems) });
    }, [session]);

    const styleBarInvisible = {
        justifyContent: 'flex-start',
        background: '#454545',
        marginTop: '30px'
    };

    const styleButtonInvisible = {
        fontSize: '25px',
        background: 'white'
    };

    const toggleVisibility = () => { setVisible(!visible); }

    return (
        <>
            <div id="sidebar-left">
                <div id="hideBarLeft" style={visible ? {} : styleBarInvisible} className="sidebar-top-bar">
                    <button id="hideButtonLeft" style={visible ? {} : styleButtonInvisible} className="visibility-button" onClick={toggleVisibility}>
                        {visible ? "-" : "Profile"}
                    </button>
                </div>
                {
                    visible &&
                    <div id="leftBar" className="bar" style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'center'}}>
                        <div id="profile-pic" style={{backgroundImage:'url(\"https://i.stack.imgur.com/l60Hf.png\")'}}></div>
                        <h1 className="dark">{actor}</h1>
                        <div id="counts-parent" style={{display:'flex',justifyContent:'space-around',width:'80%',marginTop:'10px'}}>
                            <div id="following-parent" style={{display:'flex',alignItems:'center',flexDirection:'column'}}>
                                <Link to="/following"><h1 className="dark">{following}</h1></Link>
                                <div>Following</div>
                            </div>
                            <div id="followers-parent" style={{display:'flex',alignItems:'center',flexDirection:'column'}}>
                            <Link to="/followers"><h1 className="dark">{followers}</h1></Link>
                                <div>Followers</div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
}

export default LeftBar;