import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, Button } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { ReactComponent as PaperClip } from 'icon/paperclip.svg'
import { ReactComponent as AlertTriangle } from 'icon/alert-triangle.svg'
import { ReactComponent as Eye } from 'icon/eye.svg'
import { ReactComponent as Archive } from 'icon/archive.svg'
import { ReactComponent as Navigation } from 'icon/navigation.svg'
import TextArea from 'components/vagabond/TextArea.js';
import config from 'config/config.js';
import { store, handleError, updateCompose, addLoadingReason, removeLoadingReason } from 'reducer/reducer.js';
import { actorHandle as actorHandleRegex } from 'util/regex.js';


import showdown from 'showdown';

const Compose = (props) => {

    const [show, setShow] = useState(store.getState().compose);

    const handleClose = () => {
        store.dispatch(updateCompose(false));
    }

    store.subscribe(() => {
        setShow(store.getState().compose);
    });


    const initialValues = {
        content: ''
    }

    const validationSchema = Yup.object().shape({
        content: Yup.string().required('').max(1024, 'Notes cannot be more than 1024 characters.')
    });

    const submitNote = (content, to, bto, cc, bcc, tag) => {
        const actorName = store.getState().session.currentActor.username;
        const loadingReason = 'Composing note';
        store.dispatch(addLoadingReason(loadingReason));

        const args = {
            ['@context']: 'https://www.w3.org/ns/activitystreams',
            type: 'Note',
            content: new showdown.Converter().makeHtml(content),
            published: new Date().toISOString(),
            to: to,
            bto: bto,
            cc: cc,
            bcc: bcc,
            tag: tag
        };

        console.log(args);

        axios.post(`/api/v1/actors/${actorName}/outbox`, args)
            .then((res) => {

                formik.resetForm(initialValues);
            })
            .catch(handleError)
            .finally(() => {
                store.dispatch(removeLoadingReason(loadingReason));
                store.dispatch(updateCompose(false));
            });
    }

    const onSubmit = (values) => {

        const actorName = store.getState().session.currentActor.username;
        let totalActors = 0;
        let totalResolved = 0;

        const to = ['https://www.w3.org/ns/activitystreams#Public'];
        const bto = [];
        const cc = [`${config.apiUrl}/actors/${actorName}/followers`];
        const bcc = [];
        const tag = []

        let content = values.content;

        const tokens = content.split(' ');

        //First step: figure out how many people are being mentioned
        tokens.forEach((token) => {
            if (token.match(actorHandleRegex)) {
                totalActors++;
            }
        });

        //Second step: get data via proxy
        tokens.forEach((token) => {
            if (token.match(actorHandleRegex)) {
                const splits = token.split('@');
                const username = splits[1];
                const hostname = splits[2];

                const loadingReason = `Look up @${username}@${hostname}`;
                store.dispatch(addLoadingReason(loadingReason))
                axios.get(`/api/v1/proxy?type=actor&username=${username}&hostname=${hostname}`)
                    .then((res) => {

                        if (res.data.followers) {
                            cc.push(res.data.followers);
                        }

                        to.push(res.data.id);
                        content = content.replaceAll(`@${username}@${hostname}`, `[@${username}@${hostname}](${res.data.id})`);
                        tag.push({
                            type: 'Mention',
                            ['href']: res.data.id,
                            name: hostname.toLowerCase() === config.domain.toLowerCase() ? `@${username}` : `@${username}@${hostname}`,
                        });

                        totalResolved++;
                    })
                    .catch((err) => {
                        handleError(err);
                    })
                    .finally(() => {
                        store.dispatch(removeLoadingReason(loadingReason))
                        if (totalResolved == totalActors) {
                            submitNote(content, to, bto, cc, bcc, tag);
                        }
                    })
            }
        });



    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: onSubmit
    });


{/* <div className="icon-bar-vertical">
                        <PaperClip style={{heigh:'18px',width:'18px'}} className="icon" />
                        <AlertTriangle style={{heigh:'18px',width:'18px'}}  className="icon" />
                        <Eye style={{heigh:'18px',width:'18px'}}  className="icon" />
                    </div> */}
    return (
        <Form id="compose-note-modal" onSubmit={formik.handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
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
    );

}

export default Compose;