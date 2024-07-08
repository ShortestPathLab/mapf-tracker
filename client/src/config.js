
var url = "";
if (process.env.NODE_ENV === 'development') {
    url = 'http://127.0.0.1:50000/api';
} else {
    url = '/api';
}

export const APIConfig = {
    apiUrl: url,
    // apiUrl: '/api',
};