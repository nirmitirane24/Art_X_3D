import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingPage from './loading';

function Login() {
  const navigate = useNavigate();
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let loginSuccess = false;
    try {
      const response = await axios.post('http://localhost:5050/auth/signin', { username: username, password }, { withCredentials: true });
      localStorage.setItem('username', username); // Store username
      loginSuccess = true;
      if (loginSuccess) {
        navigate('/home');
     }

    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Login failed. Please check your credentials.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
         setTimeout(() => {
            setIsLoading(false);
            if (loginSuccess) {
               navigate('/home');
            }
          }, 2000);
    }
  };

  const closeModal = () => {
    setError(null);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    // ... (rest of your login JSX) ...
     <div style={styles.body}>
            <div style={styles.formContainer}>
                {/* Navigation Arrow to Home */}
                <Link to="/" style={styles.backLink}>
                    <FaArrowLeft style={styles.backIcon} />
                </Link>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <Link to={'/'}><img src="/cube2.svg" style={{ height: '60px', marginTop: '5px', border: '2px solid white', borderRadius: '20px', padding: '7px' }} alt="Logo" /></Link>
                    <h2 style={styles.title}>Welcome Back!</h2>
                    <div style={styles.formGroup}>
                        <FaEnvelope style={styles.icon} />
                        <input
                            type="username"
                            style={styles.input}
                            placeholder="username"
                            value={username}
                            onChange={(e) => setusername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <FaLock style={styles.icon} />
                        <input
                            type={isPasswordVisible ? 'text' : 'password'}
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div onClick={togglePasswordVisibility} style={styles.eyeIcon}>
                            {isPasswordVisible ? <FaEye style={styles.icon} /> : <FaEyeSlash style={styles.icon} />}
                        </div>
                    </div>
                    <button type="submit" style={styles.loginButton}>Login</button>
                    <p style={styles.registerLink}>
                        Not a user? <a href="/register" style={styles.link}>Register here</a>
                    </p>
                </form>
            </div>

            {error && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h2 style={styles.modalTitle}>Login Failed</h2>
                        <p style={styles.modalMessage}>{error}</p>
                        <button onClick={closeModal} style={styles.modalButton}>OK</button>
                    </div>
                </div>
            )}
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
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        width: '400px',
        textAlign: 'center',
        position: 'relative',
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
    form: {
        display: 'flex',
        flexDirection: 'column',
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
        borderBottom: '2px solid rgba(179, 191, 255, 0.4)',
        paddingBottom: '10px',
        position: 'relative',
    },
    icon: {
        marginRight: '10px',
        color: '#bbb',
    },
    eyeIcon: {
        position: 'absolute',
        right: '10px',
        cursor: 'pointer',
    },
    input: {
        flex: 1,
        padding: '12px',
        fontSize: '16px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#fff',
        outline: 'none',
    },
    loginButton: {
        padding: '12px',
        backgroundColor: 'rgb(255, 56, 86)',
        color: '#fff',
        fontSize: '18px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
    },
    registerLink: {
        marginTop: '15px',
        color: '#ccc',
    },
    link: {
        color: '#96d0a7',
        textDecoration: 'none',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '10px',
        width: '320px',
        textAlign: 'center',
    },
    modalTitle: {
        fontSize: '22px',
        marginBottom: '15px',
        color: '#333',
    },
    modalMessage: {
        fontSize: '16px',
        marginBottom: '20px',
        color: '#555',
    },
    modalButton: {
        padding: '12px 25px',
        backgroundColor: 'rgb(255, 56, 86)',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};
export default Login;