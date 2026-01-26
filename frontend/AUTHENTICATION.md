# Frontend - Інтеграція Автентифікації

## Основні компоненти

### 1. AuthContext (`src/contexts/AuthContext.jsx`)

Context для управління станом автентифікації користувача.

**Функціональність:**
- Управління токеном та даними користувача
- Автоматичне додавання токена до всіх запитів
- Автоматичне видалення токена при помилці 401
- Збереження токена в localStorage

**Основні функції:**
```javascript
const { 
  user,              // Об'єкт користувача {id, email, name, is_active, created_at}
  token,             // JWT токен
  loading,           // Статус завантаження
  error,             // Повідомлення про помилку
  isAuthenticated,   // Boolean: авторизований чи ні
  signup,            // Функція реєстрації(email, password, name)
  login,             // Функція входу(email, password)
  logout,            // Функція виходу
  apiClient          // Axios instance з налаштованим токеном
} = useAuth();
```

### 2. Welcome Page (`src/pages/Welcome/`)

Сторінка реєстрації та входу користувача.

**Особливості:**
- Переключення між режимами "Вхід" та "Реєстрація"
- Валідація форм (паролі, email)
- Відображення помилок
- Loading стан під час обробки запиту
- Переспрямування на головну сторінку після успішної автентифікації

### 3. App.jsx (оновлено)

**Логіка:**
1. Отримує стан автентифікації з AuthContext
2. Показує loading екран під час ініціалізації
3. Показує Welcome page якщо не авторизований
4. Показує основний додаток якщо авторизований

### 4. Navbar (оновлено)

**Нові можливості:**
- Відображення ініціалу користувача в кнопці акаунту
- Dropdown меню з інформацією користувача
- Кнопка виходу (logout)

## Використання

### Базовий приклад

```jsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, logout, apiClient } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Використання apiClient для запитів
  const fetchStudents = async () => {
    try {
      const response = await apiClient.get('/students/');
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <p>Привіт, {user?.name}!</p>
      <button onClick={handleLogout}>Вихід</button>
      <button onClick={fetchStudents}>Завантажити студентів</button>
    </div>
  );
}
```

### Захищені API запити

Токен автоматично додається до всіх запитів через apiClient:

```jsx
const { apiClient } = useAuth();

// Запит автоматично матиме заголовок Authorization
const response = await apiClient.get('/students/');

// Еквівалентно:
// Authorization: Bearer <token>
```

## Конфігурація

### Змінні оточення

Створіть файл `.env.local` у папці frontend:

```env
VITE_API_URL=http://localhost:8000
```

Для production:
```env
VITE_API_URL=https://api.yourdomain.com
```

### Налаштування SECRET_KEY на backend

Backend повинен мати SECRET_KEY налаштований (мінімум 32 символи):

```bash
# На backend контейнері
export SECRET_KEY="your-very-secret-key-change-in-production-minimum-32-characters"
```

Або додайте до docker-compose.yml:

```yaml
environment:
  - SECRET_KEY=your-very-secret-key-change-in-production
```

## Потік автентифікації

### Реєстрація
1. Користувач вводить email, ім'я та пароль
2. Frontend відправляє POST запит на `/auth/signup`
3. Backend хешує пароль та створює користувача
4. Backend повертає JWT токен
5. Frontend зберігає токен в localStorage
6. Користувач автоматично перенаправляється на головну сторінку

### Вхід
1. Користувач вводить email та пароль
2. Frontend відправляє POST запит на `/auth/login`
3. Backend перевіряє дані та повертає JWT токен
4. Frontend зберігає токен в localStorage
5. Користувач автоматично перенаправляється на головну сторінку

### Вихід (Logout)
1. Користувач натискає кнопку "Вихід"
2. Frontend видаляє токен з localStorage
3. Frontend видаляє дані користувача
4. Frontend показує Welcome page

### Перезагрузка сторінки
1. App.jsx перевіряє localStorage на наявність токена
2. Якщо токен є, користувач залишається авторизованим
3. Якщо токена немає, користувач вбачає Welcome page

## Обробка помилок

### Помилки валідації
```javascript
const [error, setError] = useState('');

try {
  const success = await login(email, password);
  if (!success) {
    // error автоматично встановлений в AuthContext
  }
} catch (err) {
  setError('Невідома помилка');
}
```

### Помилка 401 (Unauthorized)
Коли токен протерміновується або невалідний:
- Axios interceptor автоматично видаляє токен
- Користувач перенаправляється на Welcome page

## Безпека

✅ **Що реалізовано:**
- Паролі не зберігаються, тільки JWT токени
- Токени передаються в заголовку Authorization
- Автоматична очистка при помилці 401
- Пароль требує мінімум 6 символів

⚠️ **Рекомендації для production:**
- Використовуйте HTTPS, а не HTTP
- Встановіть HttpOnly флаг для cookies (замість localStorage)
- Регулярно ротуйте SECRET_KEY
- Налаштуйте CORS для вашого домену
- Додайте rate limiting для auth endpoints

## Структура проекту

```
frontend/src/
├── contexts/
│   └── AuthContext.jsx         # Context для автентифікації
├── pages/
│   └── Welcome/
│       ├── index.jsx           # Сторінка входу/реєстрації
│       └── Welcome.module.css
├── components/
│   └── Navbar/
│       └── index.jsx           # Оновлена з menu logout
├── App.jsx                     # Оновлена с AuthProvider логікою
└── main.jsx                    # Обгорнута в AuthProvider
```

## Тестування

### Локальне тестування

1. Запустіть backend:
```bash
docker-compose up
```

2. Запустіть frontend:
```bash
cd frontend
npm run dev
```

3. Відкрийте http://localhost:5173

4. Тестуйте:
   - Реєстрація нового користувача
   - Вхід з тим же користувачем
   - Перезагрузка сторінки (токен має збережися)
   - Вихід
   - Переконайтесь, що токен додається до запитів

### Перевірка запитів

У DevTools → Network → виберіть запит:
- Заголовок Authorization повинен містити: `Bearer <token>`

## Помилки та їх розв'язання

### "Could not validate credentials" (401)
- Токен протерміновується (дійсний 7 днів)
- Користувач потребує повторної реєстрації

### "User with this email already exists" (400)
- Email вже зареєстрований
- Скористайтеся іншим email або увійдіть

### CORS помилка
- Перевірте що backend має правильний CORS origine
- Для локального розробки має бути дозволено: http://localhost:5173

### Network error / 500
- Перевірте що backend запущений
- Перевірте VITE_API_URL в .env.local
