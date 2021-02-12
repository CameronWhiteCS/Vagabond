import React, { useState } from 'react';
import { store, initialState, hideNotification } from '../reducer/reducer.js';
import {Modal, Button} from 'react-bootstrap';

const NotificationModal = () => {

    const [notifications, setNotifications] = useState(initialState.notifications);

    store.subscribe(() => {
        setNotifications(store.getState().notifications);
    })

    const hide = () => {
        store.dispatch(hideNotification());
    }

    return (

        <Modal show={notifications.length > 0} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>{notifications.length > 0 ? notifications[0].title : ''}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{notifications.length > 0 ? notifications[0].message : ''}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={hide}>
                    OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default NotificationModal;