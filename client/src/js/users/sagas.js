/**
 *
 *
 * @copyright 2017 Government of Canada
 * @license MIT
 * @author igboyes
 *
 */

import { push } from "react-router-redux";
import { takeEvery, takeLatest, throttle, put } from "redux-saga/effects";

import { setPending } from "../wrappers";
import usersAPI from "./api";
import {
    LIST_USERS,
    CREATE_USER,
    SET_PASSWORD,
    SET_FORCE_RESET,
    SET_PRIMARY_GROUP,
    ADD_USER_TO_GROUP,
    REMOVE_USER_FROM_GROUP
} from "../actionTypes";

export function* watchUsers () {
    yield takeLatest(LIST_USERS.REQUESTED, listUsers);
    yield throttle(200, CREATE_USER.REQUESTED, createUser);
    yield takeLatest(SET_PASSWORD.REQUESTED, setPassword);
    yield takeLatest(SET_FORCE_RESET.REQUESTED, setForceReset);
    yield takeLatest(SET_PRIMARY_GROUP.REQUESTED, setPrimaryGroup);
    yield takeEvery(ADD_USER_TO_GROUP.REQUESTED, addToGroup);
    yield takeEvery(REMOVE_USER_FROM_GROUP.REQUESTED, removeFromGroup);
}

function* listUsers (action) {
    yield setPending(function* () {
        try {
            const response = yield usersAPI.list();
            yield put({type: LIST_USERS.SUCCEEDED, users: response.body});
        } catch (error) {
            yield put({type: LIST_USERS.FAILED}, error);
        }
    }, action);
}

function* createUser (action) {
    yield setPending(function* () {
        try {
            const response = yield usersAPI.create(action.userId, action.password, action.forceReset);
            yield put({type: CREATE_USER.SUCCEEDED, data: response.body});

            // Close the create user modal and navigate to the new user.
            yield put(push(`/settings/users/${action.userId}`, {state: {createUser: false}}));
        } catch (error) {
            yield put({type: CREATE_USER.FAILED}, error);
        }
    }, action);
}

function* setPassword (action) {
    if (action.password === action.confirm) {
        try {
            const response = yield usersAPI.setPassword(action.userId, action.password);
            yield put({type: SET_PASSWORD.SUCCEEDED, data: response.body});
        } catch (error) {
            yield put({type: SET_PASSWORD.FAILED});
        }
    } else {
        yield put({type: SET_PASSWORD.FAILED, error: "Passwords don't match"});
    }
}

function* setForceReset (action) {
    try {
        const response = yield usersAPI.setForceReset(action.userId, action.enabled);
        yield put({type: SET_FORCE_RESET.SUCCEEDED, data: response.body});
    } catch (error) {
        yield put({type: SET_FORCE_RESET.FAILED});
    }
}

function* setPrimaryGroup (action) {
    try {
        const response = yield usersAPI.setPrimaryGroup(action.userId, action.primaryGroup);
        yield put({type: SET_PRIMARY_GROUP.SUCCEEDED, data: response.body});
    } catch (error) {
        yield put({type: SET_PRIMARY_GROUP.FAILED, error: error});
    }
}

function* addToGroup (action) {
    try {
        const response = yield usersAPI.addUserToGroup(action.userId, action.groupId);
        yield put({type: ADD_USER_TO_GROUP.SUCCEEDED, data: response.body});
    } catch (error) {
        yield put({type: ADD_USER_TO_GROUP.FAILED, error: error});
    }
}

function* removeFromGroup (action) {
    try {
        const response = yield usersAPI.removeUserFromGroup(action.userId, action.groupId);
        yield put({type: REMOVE_USER_FROM_GROUP.SUCCEEDED, data: response.body});
    } catch (error) {
        yield put({type: REMOVE_USER_FROM_GROUP.FAILED, error: error});
    }
}
