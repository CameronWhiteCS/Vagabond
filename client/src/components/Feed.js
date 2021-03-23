import React, {useState, useEffect} from 'react'
import Note from '../components/notes/Note.js';

import axios from 'axios';

import {handleError} from '../reducer/reducer.js';

const Feed = () => {

    const [activities, setActivities] = useState([]);

    useEffect(() => {
        axios.get('/api/v1/inbox/1')
        .then((res) => {
            setActivities(res.data.orderedItems);
        })
        .catch(handleError)
    }, []);

    return (
        <>
            {
                activities.map((activity) => {
                    if (activity.type === 'Create' && activity.object.type === 'Note') {
                        return <Note activity={activity} />
                    } 
                })
            }
        </>
    );

}

export default Feed;