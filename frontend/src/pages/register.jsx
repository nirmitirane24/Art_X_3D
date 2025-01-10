import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa'; // Import the arrow icon
import { Link } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [passwordMatch, setPasswordMatch] = useState(true);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevState) => !prevState);
    };

    // Password strength validation
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

    // Check if password and confirmPassword match
    const checkPasswordMatch = (value) => {
        setConfirmPassword(value);
        if (password !== value) {
            setPasswordMatch(false);
        } else {
            setPasswordMatch(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordMatch) {
            toast.error("Passwords don't match!", { position: toast.POSITION.TOP_CENTER });
            return;
        }
        try {
            await axios.post('http://localhost:5000/register', { email, password });
            toast.success('Registration Successful!', { position: toast.POSITION.TOP_CENTER });
        } catch (error) {
            toast.error('Registration failed', { position: toast.POSITION.TOP_CENTER });
        }
    };

    return (
        <div style={styles.body}>
            <div style={styles.formContainer}>
                {/* Navigation Arrow to Home */}
                <Link to="/" style={styles.backLink}>
                    <FaArrowLeft style={styles.backIcon} />
                </Link>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <Link to={'/'}><img src="/cube2.svg" style={styles.logo} alt="Logo" /></Link>
                    <h2 style={styles.title}>Welcome to ARTX3D</h2>
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

                    {/* Password strength indicator */}
                    {password && (
                        <p style={{
                            ...styles.passwordStrength,
                            color: passwordStrength === 'strong' ? '#4caf50' :
                                passwordStrength === 'moderate' ? '#ffa726' : '#ff5e5e'
                        }}>
                            Password Strength: {passwordStrength}
                        </p>
                    )}

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

                    {/* Password matching indicator */}
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

                <ToastContainer />
            </div>
        </div>
    );
}

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
        color: '#bbb', // Adjust the color as needed
        cursor: 'pointer',
    },
    backIcon: {
        fontSize: '20px', // Adjust size as needed
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
        border: '2px solid white',
        borderRadius: '20px',
        padding: '7px'
    },
};

export default Register;
