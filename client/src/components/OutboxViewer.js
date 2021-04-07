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


        return (
            <>
                <h1>Outbox</h1>
                {
                    session.currentActor?.username !== undefined &&
                    <OrderedCollectionViewer id={`/api/v1/actors/${session.currentActor.username}/outbox`} render={render}/>
                }
            </>
        )
    



}

export default OutboxViewer;