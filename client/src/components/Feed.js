import React, {useState, useEffect} from 'react'
import Note from '../components/notes/Note.js';

import axios from 'axios';

import {handleError} from '../reducer/reducer.js';

const Feed = () => {

    const [notes, setNotes] = useState([]);

    useEffect(() => {
        axios.get('/api/v1/feed')
        .then((res) => {
            setNotes(res.data);
        })
        .catch(handleError)
    }, []);

    return (
        <>
            {
                notes.map((note) => {
                    return <Note note={note} />
                })
            }
        </>
    );

}

export default Feed;