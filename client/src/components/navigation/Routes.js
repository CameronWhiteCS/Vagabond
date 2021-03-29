import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import Error404 from 'components/static/Error404.js';
import About from 'components/static/About.js';
import Home from 'components/static/Home.js'
import NotificationCenter from 'components/static/NotificationCenter.js'
import ViewActors from 'components/session/ViewActors.js';
import ComposeNote from 'components/notes/ComposeNote.js';
import Feed from 'components/Feed.js';
import Follow from 'components/Follow.js';

import { store } from 'reducer/reducer.js';

const Routes = () => {

    const [actors, setActors] = useState([]);

    useEffect(() => {
        store.subscribe(() => {
            setActors(store.getState().session.actors);
        });
    }, []);

    const Test = () => {
        return <p>Test</p>
    }

    return (
        <Switch>
            <Route exact path="/" render={() => <Home />} />
            <Route exact path="/test" render={() => <Test />} />
            <Route exact path="/about" render={() => <About />} />
            <Route exact path="/actors" render={() => <ViewActors actors={actors} />} />
            <Route exact path="/compose" render={() => <ComposeNote />} />
            <Route exact path="/feed" render={() => <Feed />} />
            <Route exact path="/follow" render={() => <Follow />} />
            <Route exact path="/notifications" render={() => <NotificationCenter />} />
            <Route render={() => <Error404 />} />
        </Switch>
    );

}

export default Routes;