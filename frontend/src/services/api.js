import axios from 'axios';

// الرابط الجديد ديال Railway
const RAILWAY_URL = 'https://auto-ecole-janoub-production-bc77.up.railway.app';

const api = axios.create({
    // كيجيب الرابط من .env إلا كاين، وإلا كيستعمل رابط Railway مباشرة
    baseURL: process.env.REACT_APP_API_URL || `${RAILWAY_URL}/api`,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// تحديث وظيفة CSRF باش تضرب حتى هي في السيرفر الجديد
export const initCsrf = () => {
    return axios.get(`${RAILWAY_URL}/sanctum/csrf-cookie`, {
        withCredentials: true
    });
};

// إرسال التوكن مع كل طلب
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// التعامل مع انتهاء صلاحية الجلسة (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
// import axios from 'axios';

// // Configure Axios with Sanctum support
// const api = axios.create({
//     baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
//     withCredentials: true,
//     headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//     }
// });

// // Helper to pull CSRF token since Sanctum needs it
// export const initCsrf = () => {
//     return axios.get('http://localhost:8000/sanctum/csrf-cookie', {
//         withCredentials: true
//     });
// };

// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem('auth_token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             localStorage.removeItem('auth_token');
//             localStorage.removeItem('user_data');
//             // Force redirect to login if explicitly unauthorized
//             if (window.location.pathname !== '/login') {
//                 window.location.href = '/login';
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;
