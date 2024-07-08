
var url = "";
if (import.meta.env.NODE_ENV === 'development') {
    url = 'http://127.0.0.1:80/api';
} else {
    url = '/api';
}

export const APIConfig = {
    apiUrl: url,
    // apiUrl: '/api',
};