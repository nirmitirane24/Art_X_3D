// register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingPage from './loading';
import SEO from '../utils/SEO';

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevState) => !prevState);
    };

    const validatePassword = (value) => {
        setPassword(value);
        const regexStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const regexModerate = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[A-Z])(?=.*\d)))(?=.{6,})/;

        if (regexStrong.test(value)) {
            setPasswordStrength('strong');
        } else if (regexModerate.test(value)) {
            setPasswordStrength('moderate');
        } else {
            setPasswordStrength('weak');
        }
    };

    const checkPasswordMatch = (value) => {
        setConfirmPassword(value);
        setPasswordMatch(password === value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordMatch) {
            navigate('/register'); // Redirect to register if passwords don't match
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, { username, password, email }, { withCredentials: true });
            if (response.status === 201) {
                // alert('Registration Successful! Please log in.'); // Simple alert
                localStorage.setItem('username', username);
                navigate('/login'); // Navigate immediately on success
            }

        } catch (error) {
            let errorMessage = 'Registration failed';
            if (error.response) {
                errorMessage = error.response.data.message || 'Registration failed';
            } else if (error.request) {
                errorMessage = 'No response from server. Please try again later.';
            } else {
                errorMessage = 'An unexpected error occurred.';
            }

            navigate('/');

        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <div style={styles.body}>

        <SEO
        title="ArtX3D - Register"
        description="Manage your 3D creations, explore the ArtX3D community, and access your account settings." 
        keywords="3D projects, user dashboard, 3D art management, ArtX3D Register, Free to use, Freemium" 
        image="/site/regsiter.png"
        urlPath="/register" 
      />
            <div style={styles.formContainer}>
                <Link to="/" style={styles.backLink}>
                    <FaArrowLeft style={styles.backIcon} />
                </Link>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <Link to={'/'}><img src="./3d/1logo.png" style={styles.logo} alt="Logo" /></Link>
                    <h2 style={styles.title}>Welcome to ARTX3D</h2>
                    {/* Username Input */}
                    <div style={styles.formGroup}>
                        <FaEnvelope style={styles.icon} />
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {/* Email Input */}
                    <div style={styles.formGroup}>
                        <FaEnvelope style={styles.icon} />
                        <input
                            type="email"
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {/* Password Input */}
                    <div style={styles.formGroup}>
                        <FaLock style={styles.icon} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => validatePassword(e.target.value)}
                            required
                        />
                        <div style={styles.eyeIcon} onClick={togglePasswordVisibility}>
                            {showPassword ? <FaEye /> : <FaEyeSlash />}
                        </div>
                    </div>

                    {password && (
                        <p style={{
                            ...styles.passwordStrength,
                            color: passwordStrength === 'strong' ? '#4caf50' :
                                passwordStrength === 'moderate' ? '#ffa726' : '#ff5e5e'
                        }}>
                            Password Strength: {passwordStrength}
                        </p>
                    )}
                    {/* Confirm Password Input */}
                    <div style={styles.formGroup}>
                        <FaLock style={styles.icon1} />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            style={styles.input}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => checkPasswordMatch(e.target.value)}
                            required
                        />
                        <div style={styles.eyeIcon} onClick={toggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                        </div>
                    </div>

                    {!passwordMatch && (
                        <p style={{ color: '#ff5e5e', fontSize: '14px' }}>
                            Passwords don't match!
                        </p>
                    )}

                    <button type="submit" style={styles.registerButton}>Register</button>

                    <p style={styles.loginLink}>
                        Already a user? <Link to="/login" style={styles.link}>Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
//styles remain same
const styles = {
    body: {
        width: '100vw',
        backgroundColor: '#1a192d',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        backgroundColor: '#252439',
        padding: '50px 40px',
        borderRadius: '15px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
        width: '400px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    backLink: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        color: '#bbb',
        cursor: 'pointer',
    },
    backIcon: {
        fontSize: '20px',
    },
    title: {
        marginBottom: '20px',
        color: '#fff',
        fontSize: '28px',
    },
    formGroup: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #4a4a66',
        paddingBottom: '8px',
        position: 'relative',
    },
    icon: {
        marginRight: '10px',
        color: '#bbb',
    },
    icon1: {
        marginRight: '10px',
        color: 'green',
    },
    input: {
        flex: 1,
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#252439',
        border: 'none',
        color: '#fff',
        outline: 'none',
    },
    eyeIcon: {
        position: 'absolute',
        right: '10px',
        cursor: 'pointer',
        color: '#bbb',
    },
    registerButton: {
        padding: '14px',
        backgroundColor: '#ff5e5e',
        color: '#fff',
        fontSize: '16px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s, transform 0.2s',
        marginTop: '20px',
    },
    loginLink: {
        marginTop: '15px',
        color: '#ccc',
    },
    link: {
        color: '#96d0a7',
        textDecoration: 'none',
    },
    passwordStrength: {
        fontSize: '14px',
        marginTop: '-15px',
        marginBottom: '10px',
        textAlign: 'left',
    },
    logo: {
        height: '60px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '5px',
        borderRadius: '20px',
        padding: '0px'
    },
};

export default Register;