import { createStore } from 'redux';

const initialState = {
    notifications: [],
    session: {
        signedIn: false,
        actors: [],
        currentActor: {}
    },
    showSignIn: false,
    showSignUp: false
};

const reducer = (state = initialState, action) => {
    if (action.type === 'CREATE_NOTIFICATION') {
        const newNotifications = [...state.notifications];
        newNotifications.push({
            title: action.title,
            message: action.message
        });
        const newState = { ...state, notifications: newNotifications }
        return newState;
    } 
    else if (action.type === 'HIDE_NOTIFICATION') {
        const newNotifications = [...state.notifications];
        newNotifications.shift();
        const newState = { ...state, notifications: newNotifications }
        return newState;
    } 
    else if (action.type === 'SET_SESSION') {
        return { ...state, session: action.session}
    } 
    else if (action.type === 'UPDATE_SIGNIN') {
        return { ...state, showSignIn: action.show}
    } 
    else if (action.type === 'UPDATE_SIGNUP') {
        return { ...state, showSignUp: action.show}
    } 
    else {
        return state;
    }
};

const store = createStore(reducer, initialState);
store.getState();

const updateSignIn = (show) => {
    return {
        type: 'UPDATE_SIGNIN',
        show: show
    };
};

const updateSignUp = (show) => {
    return {
        type: 'UPDATE_SIGNUP',
        show: show
    };
};

const createNotification = (title, message) => {
    return {
        type: 'CREATE_NOTIFICATION',
        title: title,
        message: message
    };
};

const hideNotification = () => {
    return {
        type: 'HIDE_NOTIFICATION'
    };
};

const handleError = (err) => {
    if(err.response) {
        store.dispatch(createNotification(`Error: ${err.response.status}`, err.response.data));
    } else {
        store.dispatch(createNotification('Error', 'Unknown error.'));
        console.log(err);
    }
}

export { store, initialState, createNotification, hideNotification, handleError, updateSignIn, updateSignUp }
