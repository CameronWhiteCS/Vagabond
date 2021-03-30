import { initialState, store, handleError, updateSignIn } from '../../reducer/reducer.js';
import { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

const SearchBar = () => {

    const [session, setSession] = useState(initialState.session);

    return (
        <div className="input-part">
            <input style={{height:'100%',borderStyle:'none'}} type="text" placeholder="Search for a User..."></input>
            <Link style={{height:'100%',margin:'0',display:'flex',alignItems:'center',textDecoration:'none'}} to="/search" title="Search">
                <button style={{marginRight:'7px'}} id="search-button">Search</button>            
            </Link>
        </div>
    );

}

export default SearchBar;
