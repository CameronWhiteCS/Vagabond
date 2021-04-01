import React, { useState } from 'react';

import { store } from 'reducer/reducer.js';
import OrderedCollectionViewer from './OrderedCollectionViewer';

const Following = () => {


    const [session, setSession] = useState(store.getState().session);

    store.subscribe(() => {
        setSession(store.getState().session)
    });

    const render = (item) => {
        return (
            <div className="user-on-list">
                <div id="user-url">{item}</div>
                <button className="unfollow">Unfollow</button>
            </div>
        )
    }

    return (
        <>
            <h1>Following</h1>
            {
                session.currentActor?.username !== undefined &&
                <OrderedCollectionViewer id={`/api/v1/actors/${session.currentActor.username}/following`} render={render} />
            }
        </>
    )

}

export default Following;
