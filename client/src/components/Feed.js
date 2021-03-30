import React, { useState, useEffect } from 'react'

import axios from 'axios';

import { Button } from 'react-bootstrap';

import { handleError, initialState, addLoadingReason, removeLoadingReason, store } from 'reducer/reducer.js';
import Note from 'components/notes/Note.js';

/**
 * 
 * @param {*} props props.type = 'inbox' | 'outbox'
 * @returns 
 */
const Feed = (props) => {

    const [box, setBox] = useState(store.getState()[props.type]);
    const [session, setSession] = useState(store.getState().session);
    const itemsPerPage = 20;
    const reduxType = `SET_${props.type}`.toUpperCase();

    const getBaseUrl = () => {
        let baseUrl;
        if(props.type === 'inbox') {
            baseUrl = '/api/v1/inbox'
        } else if (props.type === 'outbox') {
            baseUrl = `/api/v1/actors/${session.currentActor.username}/outbox`
        }
        return baseUrl;
    }

    const determineTotalItems = () => {
        const loadingReason = `Determining number of items in ${props.type}`;

        store.dispatch(addLoadingReason(loadingReason));
        axios.get(getBaseUrl())
        .then((res) => {
            store.dispatch({
                type: reduxType,
                [props.type]: {...box, totalItems: res.data.totalItems}
            });
        })
        .catch(handleError)
        .finally(() => {
            store.dispatch(removeLoadingReason(loadingReason));
        });
    }

    const loadNextPage = () => {
        const loadingReason = `Fetching ${props.type} contents`;
        store.dispatch(addLoadingReason(loadingReason));

        axios.get(`${getBaseUrl()}/${box.nextPage}`)
            .then((res) => {
                const newBox = {
                    ...box,
                    items: [...box.items, ...res.data.orderedItems],
                    nextPage: box.nextPage + 1
                };
                store.dispatch({
                    type: reduxType,
                    [props.type]: newBox
                });
            })
            .catch(handleError)
            .finally(() => {
                store.dispatch(removeLoadingReason(loadingReason));
            })
    }

    const clearBox = () => {
        store.dispatch({
            type: reduxType,
            [props.type]: initialState[props.type]
        });
    }

    useEffect(() => {
        store.subscribe(() => {
            const newState = store.getState();
            setBox(newState[props.type]);
            setSession(newState.session);
        });
    }, []);

    useEffect(() => {
        if (session.signedIn === false) {
            clearBox();
        } else if (box.totalItems === undefined && session.signedIn) {
            determineTotalItems();
        }
    }, [session.signedIn]);

    useEffect(() => {
        if(box.items.length === 0 && session.signedIn === true) {
            loadNextPage();
        }
    }, [box.totalItems]);

    const SignedOut = () => {
        return (
            <p>
                You must be signed in to view your {`${props.type}`}.
            </p>
        )
    }

    const EmptyFeed = () => {
        return (
            <p>
                There don't appear to be any items in your {`${props.type}`}.
            </p>
        );
    }

    /** Return different components depending on whether or not the person is signed or and if the data has been loaded. **/
    if (session.signedIn !== true) {
        return <SignedOut/>
    } else if(box.items.length <= 0) {
        return <EmptyFeed/>
    } else {
        return (
            <>
                {
                    box.items.map((activity) => {
                        if (activity.type === 'Create' && activity.object.type === 'Note') {
                            return <Note key={activity.id} activity={activity} />
                        }
                    })
                }
                <Button
                    disabled={itemsPerPage * (box.nextPage - 1) >= box.totalItems}
                    onClick={loadNextPage}
                    style={{ display: 'flex', margin: '16px auto', width: '92%', textAlign: 'center' }}
                >
                    Load More
                </Button>
            </>
        );
    }
    

}

export default Feed;