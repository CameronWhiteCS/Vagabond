import OrderedCollectionViewer from 'components/OrderedCollectionViewer.js';
import Note from 'components/notes/Note.js';

import { store } from 'reducer/reducer.js';
import { useState } from 'react';

const OutboxViewer = () => {

    const [session, setSession] = useState(store.getState().session);

    store.subscribe(() => {
        setSession(store.getState().session);
    });

    const render = (item) => {
        if (item.type === 'Create') {
            return <Note activity={item} key={item.id} />
        }
    }

    if (session.currentActor !== undefined) {
        return (
            <>
                <h1>Outbox</h1>
                <OrderedCollectionViewer id={`/api/v1/actors/${session.currentActor.username}/outbox`} render={render}/>
            </>
        )
    } else {
        return (
            <></>
        );
    }



}

export default OutboxViewer;