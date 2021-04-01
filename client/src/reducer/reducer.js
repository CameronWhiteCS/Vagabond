import { createStore } from 'redux';

const initialState = {
    notifications: [],
    session: {
        signedIn: false,
        actors: [],
        currentActor: {}
    },
    showSignIn: false, // Whether or not the sign in modal is visible
    showSignUp: false,  // Whther or not the sign up modal is visible
    compose: false, // Modal for composing a note
    collections: {
        //Used for OrderedCollectionViewer
        //['https://example.io']: {
        //    nextPage: 1,
        //    totalItems: undefined,
        //    items: [],
        //    maxId: 1337
        //}
    },
    loadingReasons: [] //List of reasons why the application is currently loading and blocking user input
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
    } else if (action.type === 'HIDE_NOTIFICATION') {
        const newNotifications = [...state.notifications];
        newNotifications.shift();
        const newState = { ...state, notifications: newNotifications }
        return newState;
    } else if (action.type === 'SET_SESSION') {
        return { ...state, session: action.session }
    } else if (action.type === 'UPDATE_SIGNIN') {
        return { ...state, showSignIn: action.show }
    } else if (action.type === 'UPDATE_SIGNUP') {
        return { ...state, showSignUp: action.show }
    } else if (action.type === 'UPDATE_COMPOSE') {
        return { ...state, compose: action.compose }
    } else if (action.type === 'ADD_LOADING_REASON') {
        return { ...state, loadingReasons: [...state.loadingReasons, action.reason] }
    } else if (action.type === 'REMOVE_LOADING_REASON') {
        const newLoadingReasons = [];
        state.loadingReasons.forEach((reason) => {
            if (reason !== action.reason) {
                newLoadingReasons.push(reason);
            }
        })
        return { ...state, loadingReasons: newLoadingReasons };
    } else if (action.type === 'SET_COLLECTION') {
        const newCollections = { ...state.collections };
        newCollections[action.id] = action.collection;
        return { ...state, collections: newCollections };
    } else {
        return state;
    }
};

const store = createStore(reducer, initialState);
store.getState();

/**
 * Used to update the visibility of the compose modal.
 * @param {*} show Whether or not the compose modal is visible
 * @returns void
 */
 const updateCompose = (compose) => {

    return {
        type: 'UPDATE_COMPOSE',
        compose: compose
    };
};


/**
 * Used to update the visibility of the sign in modal.
 * @param {*} show Whether or not the sign in modal is visible
 * @returns void
 */
const updateSignIn = (show) => {
    return {
        type: 'UPDATE_SIGNIN',
        show: show
    };
};

/**
 * Used to update the visibility of the sign up modal.
 * @param {*} show Whether or not the sign up modal is visible
 * @returns void
 */
const updateSignUp = (show) => {
    return {
        type: 'UPDATE_SIGNUP',
        show: show
    };
};

/**
 * Used to add a notification to the notification queue.
 * @param {*} title Title of the notification
 * @param {*} message Content of the notification
 * @returns void
 */
const createNotification = (title, message) => {
    return {
        type: 'CREATE_NOTIFICATION',
        title: title,
        message: message
    };
};

/**
 * Dismisses the current notification at the front of the queue. 
 * @returns void
 */
const hideNotification = () => {
    return {
        type: 'HIDE_NOTIFICATION'
    };
};

/**
 * Provides a standard way to notify the user of server-side errors.
 * This function is most often provided as an argument to the .catch()
 * function when performing an HTTP request with Axios. 
 * @param {*} err Axios error object
 */
const handleError = (err) => {
    if (err.response) {
        store.dispatch(createNotification(`Error: ${err.response.status}`, err.response.data));
    } else {
        store.dispatch(createNotification('Error', 'Unknown error.'));
        console.log(err);
    }
}

const addLoadingReason = (reason) => {
    return {
        type: 'ADD_LOADING_REASON',
        reason: reason
    }
}

const removeLoadingReason = (reason) => {
    return {
        type: 'REMOVE_LOADING_REASON',
        reason: reason
    }
}

export { store, initialState, createNotification, hideNotification, handleError, updateSignIn, updateSignUp, addLoadingReason, updateCompose, removeLoadingReason }
