const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : '/api';

export const APIConfig = {
    apiUrl: url,
};
