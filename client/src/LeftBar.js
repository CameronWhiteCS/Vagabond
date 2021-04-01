import React, { useState, useEffect } from 'react';
import { store, handleError, initialState, removeLoadingReason, addLoadingReason } from './reducer/reducer.js';
import axios from 'axios';
import { Link } from 'react-router-dom';


const LeftBar = (props) => {

    const [visible, setVisible] = useState(true)
    const [session, setSession] = useState(store.getState().session)
    const [following, setFollowing] = useState(0);
    const [followers, setFollowers] = useState(0);

    store.subscribe(() => {
        const newState = store.getState();
        setSession(newState.session);
    });

    useEffect(() => {
        if(session.currentActor?.username !== undefined) {
                const loadingReasonFollowing = 'Fetching following count';
                store.dispatch(addLoadingReason(loadingReasonFollowing));

                const loadingReasonFollowers = 'Fetching followers count';
                store.dispatch(addLoadingReason(loadingReasonFollowers));



                axios.get(`/api/v1/actors/${session.currentActor.username}/following`)
                .then((res) => {
                    setFollowing(res.data.totalItems);
                })
                .catch(handleError)
                .finally(() => {
                    store.dispatch(removeLoadingReason(loadingReasonFollowing))
                })

                axios.get(`/api/v1/actors/${session.currentActor.username}/followers`)
                .then((res) => {
                    setFollowers(res.data.totalItems);
                })
                .catch(handleError)
                .finally(() => {
                    store.dispatch(removeLoadingReason(loadingReasonFollowers))
                })
        
        }
    }, [session.currentActor?.username]);
    

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
                    <div id="leftBar" className="bar" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <div id="profile-pic" style={{ backgroundImage: 'url(\"https://i.stack.imgur.com/l60Hf.png\")' }}></div>
                        <h1 className="dark">{session.currentActor?.username}</h1>
                        <div id="counts-parent" style={{ display: 'flex', justifyContent: 'space-around', width: '80%', marginTop: '10px' }}>
                            <div id="following-parent" style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <Link to="/following"><h1 className="dark">{following}</h1></Link>
                                <div>Following</div>
                            </div>
                            <div id="followers-parent" style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
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