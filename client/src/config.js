
var url = "";
if (process.env.NODE_ENV === 'development') {
    url = 'http://127.0.0.1:3001/api';
} else {
    url = '/api';
}

export const APIConfig = {
    apiUrl: url,
    // apiUrl: '/api',
};