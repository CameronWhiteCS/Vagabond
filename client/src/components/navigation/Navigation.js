
import { ReactComponent as LogoHome } from '../../icon/home.svg'
import { ReactComponent as LogoUsers } from '../../icon/users.svg'
import { ReactComponent as SignIn } from '../../icon/sign-in.svg'
import { ReactComponent as SignOut } from '../../icon/sign-out.svg'
import { ReactComponent as Bell } from '../../icon/bell.svg'
import { ReactComponent as Inbox } from '../../icon/inbox.svg'
import { ReactComponent as Logo } from './Vagabond_Logo.svg'
//import { ReactComponent as Info } from '../../icon/info.svg'
import { ReactComponent as Feather } from '../../icon/feather.svg'
//import { ReactComponent as Globe } from '../../icon/globe.svg'

import { initialState, store, handleError, updateSignIn } from '../../reducer/reducer.js';

import { useState, useEffect } from 'react';

import { Link, useHistory } from 'react-router-dom';

import axios from 'axios';

const Navigation = () => {

    const [session, setSession] = useState(initialState.session);

    const history = useHistory();

    useEffect(() => {
        store.subscribe(() => {
            setSession(store.getState().session);
        });
    }, []);

    const signOut = () => {
        axios.post('/api/v1/signout')
            .then((res) => {
                store.dispatch({ type: 'SET_SESSION', session: initialState.session });
                history.push('/');
            })
            .catch(handleError)
    }

    const openSignIn = () => {
        store.dispatch(updateSignIn(true));
    }

    return (
        <div className="vagabond-navbar" style={{padding: '10px'}}>
            <span className="logoAndTitle">
                <Logo style={{width:'35px', height:'35px', fill:'white', margin:'auto 10px auto 0'}}/>
                <div id="vagabondTitle">Vagabond</div>
            </span>
            
            <span className="icon-bar-horizontal" style={{marginRight:'25px'}}>
                <Link to="/" title="Home">
                    <LogoHome className="icon"/>
                </Link>
                
                {
                    session.signedIn &&
                    <Link to="/actors" title="All actors">
                        <LogoUsers className="icon"/>
                    </Link>
                }

                {
                    session.signedIn && 
                    <Link to="/compose" title="Compose Note">
                        <Feather className="icon" />
                    </Link>
                }

                {
                    session.signedIn && 
                    <Link to="/notifications" title="Bell">
                        <Bell className="icon"/>
                    </Link>
                }
                {
                    session.signedIn && 
                    <Link to="/inbox" title="Inbox">
                        <Inbox className="icon"/>
                    </Link>
                }
                {
                    !session.signedIn &&
                    <SignIn className="icon" onClick={openSignIn}/>
                }
                {
                    session.signedIn &&
                    <Link onClick={signOut} to="#" title="Sign out">
                        <SignOut className="icon"/>
                    </Link>
                }
            </span>
            </div>
    );

}

export default Navigation;
