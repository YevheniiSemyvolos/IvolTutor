import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/Navbar/ThemeToggle';
import styles from './Welcome.module.css';

function Welcome() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');
  const { login, signup, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.password);
        if (success) {
          navigate('/');
        }
      } else {
        // Валідація пароля
        if (formData.password !== formData.confirmPassword) {
          setValidationError('Паролі не збігаються');
          return;
        }
        if (formData.password.length < 8) {
          setValidationError('Пароль має бути не менше 8 символів');
          return;
        }

        const success = await signup(
          formData.email,
          formData.password,
          formData.name
        );
        if (success) {
          navigate('/');
        }
      }
    } catch (err) {
      setValidationError('Помилка при вході/реєстрації:');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setValidationError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setValidationError('');
  };

  const displayError = error || validationError;

  return (
    <div className={styles.container}>
      <div className={styles.themeToggleWrap}>
        <ThemeToggle />
      </div>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.title}>IvolTutor</h1>
          <p className={styles.subtitle}>
            Платформа для управління розкладом та обліком занять
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📅</span>
              <span>Зручний календар занять</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👥</span>
              <span>Управління учнями</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💰</span>
              <span>Облік оплат</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>
            {isLogin ? 'Вхід' : 'Реєстрація'}
          </h2>
          
          {displayError && (
            <div className={styles.errorMessage}>
              {displayError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>
                  Ім'я
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Введіть ваше ім'я"
                  required
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="example@mail.com"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Підтвердіть пароль
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Завантаження...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
            </button>
          </form>

          <div className={styles.toggleSection}>
            <p className={styles.toggleText}>
              {isLogin ? 'Ще не маєте акаунту?' : 'Вже маєте акаунт?'}
            </p>
            <button onClick={toggleMode} className={styles.toggleButton}>
              {isLogin ? 'Зареєструватися' : 'Увійти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
