

import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';

import { store } from 'reducer/reducer.js';
import ComposeNote from 'components/notes/ComposeNote';

const ComposeModal = () => {

    const [show, setShow] = useState(store.getState().compose);

    store.subscribe(() => {
        setShow(store.getState().compose);
    });

    return (
        <>
            <Modal show={show}>
<<<<<<< HEAD
                <Modal.Body style={{ margin: '0', width: '100%', padding: '10px',display:'flex',flexDirection:'column' }}>
                    <Form id="compose-note-modal" onSubmit={formik.handleSubmit} style={{display:'flex',flexDirection:'column' }}>
                        <div className="compose-note vagabond-tile" style={{ width: '100%' }}>
                            <div className="icon-bar-vertical" style={{ justifyContent: 'flex-start' }}>
                                <PaperClip style={{ heigh: '18px', width: '18px' }} className="icon" />
                                <AlertTriangle style={{ heigh: '18px', width: '18px' }} className="icon" />
                                <Eye style={{ heigh: '18px', width: '18px' }} className="icon" />
                            </div>
                            <div className="textarea-container" style={{ height: '150px', margin: '5px 10px 0 10px' }} >
                                <TextArea name="content" placeholder="What's up?" value={formik.values.content} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                                </TextArea>
                            </div>
                            <div className="icon-bar-vertical" style={{ justifyContent: 'flex-start' }}>
                                <button id="close" onClick={handleClose}>X</button>
                            </div>
                        </div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: '0 auto 0 auto' }}>
                            <Button disabled={formik.values.content.length > 1024} style={{ height: '40px', width: '50%', margin: '10px 10px 10px 10px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} variant="secondary">
                                <Archive style={{ heigh: '18px', width: '18px' }} className="subIconSecondary" />
                                <div style={{ marginLeft: '10px' }}>Draft</div>
                            </Button>
                            <Button disabled={formik.values.content.length > 1024} style={{ height: '40px', width: '50%', margin: '10px 10px 10px 10px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} type="submit">
                                <Navigation style={{ heigh: '18px', width: '18px', fill: 'white', stroke: 'white' }} className="subIconWhite" />
                                <div style={{ color: 'white', marginLeft: '10px' }}>Post</div>
                            </Button>
                        </div>
                        {
                            formik.errors.content &&
                            <div>
                                <Form.Text className="text-danger">{formik.errors.content}</Form.Text>
                            </div>
                        }
                    </Form>


=======
                <Modal.Body style={{ margin: '0', width: '100%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                    <ComposeNote />
>>>>>>> upstream/master
                </Modal.Body>
            </Modal>
        </>
    );

}

export default ComposeModal;