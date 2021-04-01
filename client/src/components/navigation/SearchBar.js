import { initialState, store, handleError, updateSignIn,  addLoadingReason, removeLoadingReason } from '../../reducer/reducer.js';
import { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';

import axios from 'axios';

const SearchBar = () => {

    const [session, setSession] = useState(initialState.session);
    let input = "";
    let username = "";
    let hostname = "";
    const [currentActor, setCurrentActor] = useState(store.getState().session.currentActor);

    store.subscribe(() => {
        setCurrentActor(store.getState().session.currentActor);
    })

    const processWebfingerResponse = (res) => {
        let foreignActor = undefined;
        res.data.links.every((link) => {
            if (link.rel === 'self') {
                foreignActor = link.href;
                return false;
            }
            return true;
        });
        if (foreignActor !== undefined) {
            const params = {
                type: 'Follow',
                actor: currentActor.id,
                object: foreignActor
            }
            params['@context'] = 'https://www.w3.org/ns/activitystreams';

            axios.post(`/api/v1/actors/${currentActor.username}/outbox`, params)
                .then((res) => {
                    console.log(res)
                })
                .catch(handleError);
        }
    }

    const processInput= () => {
        let length = input.length;
        if(input.charAt(0) === '@') { input = input.substring(1, length); } 
        const parts = input.split('@');
        username = parts[0]
        hostname = parts[1]
    }

    const onSubmit = (e) => {
        e.preventDefault();
        const loadingReason = 'Looking up user';
        store.dispatch(addLoadingReason(loadingReason));
        processInput();
        axios.get(`/api/v1/webfinger?username=${username}&hostname=${hostname}`)
            .then(processWebfingerResponse)
            .catch(handleError)
            .finally(() => {
                store.dispatch(removeLoadingReason(loadingReason));
            });
    }

    return (
        <Form className="input-part" onSubmit={onSubmit}>
                <Form.Control name="user"
                        id="user"
                        placeholder="e.g. user@mastodon.online"
                        onChange={(e) => input = e.target.value}>
                </Form.Control>
                <Button type="submit" id="search-button">Follow</Button>
        </Form> 
    );

}

export default SearchBar;
