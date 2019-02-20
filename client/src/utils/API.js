import axios from 'axios';

export const promiseHandler = promise => promise.then(res => [null, res]).catch(err => [err, null]);

export const createLantern = message => axios.post('/api/lanterns', message);

export const getLanterns = () => axios.get('/api/lanterns');

export const getUserLanterns = () => axios.get('/api/lanterns/user');

export const checkLogin = () => axios.get('/api/auth/check');

export default {createLantern, getLanterns, getUserLanterns, checkLogin};
