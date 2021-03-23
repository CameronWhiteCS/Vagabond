import axios from 'axios';
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Form, Button } from 'react-bootstrap';

import { ReactComponent as PaperClip } from '../../icon/paperclip.svg'
import { ReactComponent as AlertTriangle } from '../../icon/alert-triangle.svg'
import { ReactComponent as Eye } from '../../icon/eye.svg'
import { ReactComponent as Archive } from '../../icon/archive.svg'
import { ReactComponent as Navigation } from '../../icon/navigation.svg'

import { handleError } from '../../reducer/reducer.js';
import TextArea from '../vagabond/TextArea.js';
import config from '../../config/config.js';

import { store } from '../../reducer/reducer.js';

const Compose = () => {

    const initialValues = {
        content: ''
    }

    const validationSchema = Yup.object().shape({
        content: Yup.string().required('').max(1024, 'Notes cannot be more than 1024 characters.')
    });

    const onSubmit = (values) => {
        const actorName = store.getState().session.currentActor.username;

        const args = {
            type: 'Note',
            content: `<p>${values.content}</p>`,
            published: new Date().toISOString(),
            to: ['https://www.w3.org/ns/activitystreams#Public'],
            cc: [`${config.apiUrl}/actors/${actorName}/followers`]
        };
        args['@context'] = 'https://www.w3.org/ns/activitystreams';

        axios.post(`/api/v1/actors/${actorName}/outbox`, args)
            .then((res) => {
                formik.resetForm(initialValues);
            })
            .catch(handleError);
    }

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: onSubmit
    });



    return (
        <>
            <Form id="compose-note" onSubmit={formik.handleSubmit}>
                <div className="compose-note vagabond-tile">
                    <div className="icon-bar-vertical">
                        <PaperClip style={{heigh:'18px',width:'18px'}} className="icon" />
                        <AlertTriangle style={{heigh:'18px',width:'18px'}}  className="icon" />
                        <Eye style={{heigh:'18px',width:'18px'}}  className="icon" />
                    </div>
                    <div className="textarea-container" >
                        <TextArea name="content" placeholder="What's up?" value={formik.values.content} onChange={formik.handleChange} onBlur={formik.handleBlur}>

                        </TextArea>
                    </div>
                </div>
                <div className="buttons">
                    <Button disabled={formik.values.content.length > 1024} className="post" type="submit">
                        <Navigation className="subIconWhite"/> 
                        <div>Post</div>
                    </Button>
                    <Button disabled={formik.values.content.length > 1024} className="draft" variant="secondary">
                        <Archive className="subIconSecondary"/> 
                        <div>Draft</div>
                    </Button>
                </div>
            </Form>
            {
                formik.errors.content &&
                <div>
                    <Form.Text className="text-danger">{formik.errors.content}</Form.Text>
                </div>
            }
        </>
    );

}

export default Compose;