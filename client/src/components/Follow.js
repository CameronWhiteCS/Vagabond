import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { store, handleError, addLoadingReason, removeLoadingReason } from 'reducer/reducer.js';

const Follow = (props) => {

    const [username, setUsername] = useState('');
    const [hostname, setHostname] = useState('');
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



    const onSubmit = (e) => {
        e.preventDefault();
        const loadingReason = 'Looking up user';
        store.dispatch(addLoadingReason(loadingReason));
        axios.get(`/api/v1/webfinger?username=${username}&hostname=${hostname}`)
            .then(processWebfingerResponse)
            .catch(handleError)
            .finally(() => {
                store.dispatch(removeLoadingReason(loadingReason));
            });
    }

    return (
        <>
            <h1>Follow</h1>
            <hr />
            <p>
                {(username ? username : 'undefined') + '@' + (hostname ? hostname : 'undefined')}
            </p>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label htmlFor="username">
                        username
                    </Form.Label>
                    <Form.Control name="username"
                        id="username"
                        placeholder="CameronWhite"
                        onChange={(e) => setUsername(e.target.value)}>
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label htmlFor="hostname">
                        username
                    </Form.Label>
                    <Form.Control name="hostname"
                        id="hostname"
                        placeholder="mastodon.online"
                        onChange={(e) => setHostname(e.target.value)}>
                    </Form.Control>
                </Form.Group>
                <br />
                <Button type="submit">Submit</Button>
            </Form>
        </>
    );

}

export default Follow;