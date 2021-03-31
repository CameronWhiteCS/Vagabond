import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { store, handleError, initialState, updateSignIn, updateSignUp } from 'reducer/reducer.js';
import { addLoadingReason, removeLoadingReason } from 'reducer/reducer.js';




const Following = () => {
    const [following, setFollowing] = useState(store.getState().following);
    const [session, setSession] = useState(store.getState().session);

    useEffect(() => {
        store.subscribe(() => {
            console.log(store.getState())
            setFollowing(store.getState().following);
            setSession(store.getState().session);
        })
    }, []);
    
    
    useEffect(() => {
        if(following.totalItems === undefined && session.signedIn) {
            const loading = "Loading your following list"
            store.dispatch(addLoadingReason(loading))
            axios.get(`/api/v1/actors/${session.currentActor.username}/following`)
                .then((res) => {
                    console.log("first")
                    store.dispatch({
                        type: 'SET_FOLLOWING',
                        following: {
                            ...following, totalItems: res.data.totalItems
                        }
                    })
                })
                .catch(handleError)
                .finally(() => store.dispatch(removeLoadingReason(loading)));
        }
    }, [session.signedIn]);
    
    useEffect(() => {
        if(following.totalItems !== undefined && (following.items.length < following.totalItems)) {
            //alert()
            const loading = `Fetching following page ${following.nextPage}`
            store.dispatch(addLoadingReason(loading))
            axios.get(`/api/v1/actors/${session.currentActor.username}/following/${following.nextPage}`)
                .then((res) => {
                    console.log("second")
                    store.dispatch({
                        type: 'SET_FOLLOWING',
                        following: {
                            ...following, items: [...following.items, ...res.data.orderedItems], nextPage: following.nextPage + 1
                        }
                    })
                })
                .catch(handleError)
                .finally(() => store.dispatch(removeLoadingReason(loading)));
        }
    }, [following.items, following.totalItems]);

    return (

        <div>
        
            <h1>Following</h1>
            {   
                following.items.length > 0 &&
                following.items.map((user) => 
                    <div className="user-on-list">
                        <div id="user-url">{user}</div>
                        <button className="unfollow">Unfollow</button>
                    </div> 
                )
            }
            {   
                following.items.length <= 0 &&
                <div className="user-on-list">
                    <div id="user-url" style={{textAlign:'center'}}>You don't follow anybody yet!</div>  
                </div> 
            }
        </div>
      
    );
}

export default Following;
