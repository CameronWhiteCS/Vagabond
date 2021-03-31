import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { store, handleError, initialState, updateSignIn, updateSignUp } from 'reducer/reducer.js';
import { addLoadingReason, removeLoadingReason } from 'reducer/reducer.js';


const Followers = () => {
    const [followers, setFollowers] = useState(store.getState().followers);
    const [session, setSession] = useState(store.getState().session);

    useEffect(() => {
        store.subscribe(() => {
            console.log(store.getState())
            setFollowers(store.getState().followers);
            setSession(store.getState().session);
        })
    }, []);
    
    
    useEffect(() => { 
        if(followers.totalItems === undefined && session.signedIn) {
            const loading = "Loading your followers list"
            store.dispatch(addLoadingReason(loading))
            axios.get(`/api/v1/actors/${session.currentActor.username}/followers`)
                .then((res) => {
                    console.log("first")
                    store.dispatch({
                        type: 'SET_FOLLOWERS',
                        followers: {
                            ...followers, totalItems: res.data.totalItems
                        }
                    })
                })
                .catch(handleError)
                .finally(() => store.dispatch(removeLoadingReason(loading)));
        }
    }, [session.signedIn]);
    
    useEffect(() => {
        if(followers.totalItems !== undefined && (followers.items.length < followers.totalItems)) {
            const loading = `Fetching followers page ${followers.nextPage}`
            store.dispatch(addLoadingReason(loading))
            axios.get(`/api/v1/actors/${session.currentActor.username}/followers/${followers.nextPage}`)
                .then((res) => {
                    store.dispatch({
                        type: 'SET_FOLLOWERS',
                        followers: {
                            ...followers, items: [...followers.items, ...res.data.orderedItems], nextPage: followers.nextPage + 1
                        }
                    })
                })
                .catch(handleError)
                .finally(() => store.dispatch(removeLoadingReason(loading)));
        }
    }, [followers.items, followers.totalItems]);

    return (

        <div>
            <h1>Followers</h1>
            {   
                followers.items.length > 0 &&
                followers.items.map((user) => 
                    <div className="user-on-list">
                        <div id="user-url">{user}</div>
                        <button className="unfollow">Unfollow</button>
                    </div> 
                )
            }
            {   
                followers.items.length <= 0 &&
                <div className="user-on-list">
                    <div id="user-url" style={{textAlign:'center'}}>You don't have followers yet!</div>  
                </div> 
            }
        </div>
      
    );
}

export default Followers;
