import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import Error404 from '../static/Error404.js';
import SearchResults from '../static/SearchResults.js';
import About from '../static/About.js';
import SignIn from '../session/SignIn.js';
import Home from '../static/Home.js'
import NotificationCenter from '../static/NotificationCenter.js'
import SignUp from '../session/SignUp.js';
import ViewActors from '../session/ViewActors.js';
import ComposeNote from '../notes/ComposeNote.js';
import Feed from '../Feed.js';
import Follow from '../Follow.js';

import { store } from '../../reducer/reducer.js';

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
            <Route exact path="/search" render={() => <SearchResults />} />
            <Route exact path="/notificationCenter" render={() => <NotificationCenter />} />
            <Route render={() => <Error404 />} />
        </Switch>
    );

}

export default Routes;