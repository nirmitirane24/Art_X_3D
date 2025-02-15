// utils/authUtils.js
import axios from 'axios';

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
}