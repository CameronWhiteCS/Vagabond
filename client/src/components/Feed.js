import React, { useState, useEffect } from 'react'

import axios from 'axios';

import { Button } from 'react-bootstrap';

import { handleError, initialState, addLoadingReason, removeLoadingReason, store } from 'reducer/reducer.js';
import Note from 'components/notes/Note.js';


const Feed = () => {

    const [inbox, setInbox] = useState(store.getState().inbox);
    const [signedIn, setSignedIn] = useState(store.getState().session.signedIn);

    const loadingReason = 'Fetching inbox contents';
    const itemsPerPage = 20;

    /** Figures out the max items of the inbox and loads the first page of data **/
    const initialLoad = () => {
        store.dispatch(addLoadingReason(loadingReason));
        axios.get('/api/v1/inbox')
            .then((res) => {
                let new_inbox = { ...store.getState().inbox, totalItems: res.data.totalItems, nextPage: 2 }
                axios.get('/api/v1/inbox/1')
                    .then((res) => {
                        new_inbox.items = res.data.orderedItems;
                        store.dispatch({
                            type: 'SET_INBOX',
                            inbox: new_inbox
                        });
                        setInbox(new_inbox);
                    })
                    .catch((err) => {
                        handleError(err);

                    })
                    .finally(() => {
                        store.dispatch(removeLoadingReason(loadingReason));
                    });
            })
            .catch(handleError)
            .finally(() => {
                store.dispatch(removeLoadingReason(loadingReason));
            });
    }

    const clearInbox = () => {
        store.dispatch({
            type: 'SET_INBOX',
            inbox: initialState.inbox
        });
    }

    const loadNextPage = () => {
        store.dispatch(addLoadingReason(loadingReason));
        axios.get(`/api/v1/inbox/${inbox.nextPage}`)
            .then((res) => {
                const newInbox = {
                    ...inbox,
                    items: [...inbox.items, ...res.data.orderedItems],
                    nextPage: inbox.nextPage + 1
                };
                store.dispatch({
                    type: 'SET_INBOX',
                    inbox: newInbox
                });
            })
            .catch(handleError)
            .finally(() => {
                store.dispatch(removeLoadingReason(loadingReason));
            })
    }

    /** Subscribe to store changes **/
    useEffect(() => {
        store.subscribe(() => {
            const newState = store.getState();
            setInbox(newState.inbox);
            setSignedIn(newState.session.signedIn);
        });
    }, []);

    /** If the signedIn variable changes, load or clear the inbox accordingly. **/
    useEffect(() => {
        if (signedIn === false) {
            clearInbox();
        } else if (inbox.nextPage === undefined && signedIn) {
            initialLoad();
        }
    }, [signedIn]);

    /** Return different components depending on whether or not the person is signed or and if the data has been loaded. **/
    if (signedIn !== true) {
        return (
            <>
                <p>You need to be signed in to view your feed.</p>
            </>
        )
    } else if (signedIn === true) {
        if (inbox.items.length > 0) {
            return (
                <>
                    {
                        inbox.items.map((activity, index) => {
                            if (activity.type === 'Create' && activity.object.type === 'Note') {
                                return <Note key={index} activity={activity} />
                            } else {
                                return <></>
                            }
                        })
                    }
                    <Button
                        disabled={itemsPerPage * (inbox.nextPage - 1) >= inbox.totalItems}
                        onClick={loadNextPage}
                        style={{ display: 'flex', margin: '16px auto', width: '92%', textAlign: 'center' }}

                    >
                        Load More
                    </Button>
                </>);
        } else {
            return <p>Your feed is currently empty.</p>
        }
    } else {
        return (
            <>
                <p>Loading...</p>
            </>
        );
    }

}

export default Feed;