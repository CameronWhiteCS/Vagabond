import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';

import { Button, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { store, handleError, initialState as initialReduxState } from '../../reducer/reducer.js';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

import { Link } from 'react-router-dom';

const SignIn = () => {

    const [session, setSession] = useState(initialReduxState.session);
    const history = useHistory();

    useEffect(() => {
        store.subscribe(() => {
            setSession(store.getState().session);
        })

    }, []);

    const initialValues = {
        username: '',
        password: ''
    }

    const onSubmit = (values) => {
        axios.post('/api/v1/signin', formik.values)
            .then((res) => {
                store.dispatch({ type: 'SET_SESSION', session: { ...store.getState().session, ...res.data } });
                history.push('/');
            }).catch(handleError);
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('This field is required.'),
        password: Yup.string().required('This field is required.')
    });

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: onSubmit,
        validationSchema: validationSchema,
        validateOnMount: true
    });


    return (
        <>
            <h1>Sign in</h1>
            <hr />
            <Form onSubmit={formik.handleSubmit}>
                <Form.Group>
                    <Form.Label htmlFor="username">Username</Form.Label>
                    <Form.Control name="username" id="username" onChange={formik.handleChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label htmlFor="password">Password</Form.Label>
                    <Form.Control type="password" name="password" id="password" onChange={formik.handleChange} />
                </Form.Group>
                <Form.Text>Need an account? Sign up <Link to="/signup">here</Link>.</Form.Text>
                <br/>
                <Button variant="primary" type="submit" disabled={Object.keys(formik.errors).length > 0}>Sign in</Button>
            </Form>
        
        </>
    );

}

export default SignIn;