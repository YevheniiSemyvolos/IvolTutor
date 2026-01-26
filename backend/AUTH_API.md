# API Автентифікації

## Endpoints

### 1. Реєстрація (Sign Up)
**POST** `/auth/signup`

Створює нового користувача та повертає JWT токен.

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "password": "securepassword123",
  "name": "Іван Петренко"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Статус коди:**
- `200` - Успішна реєстрація
- `400` - Користувач з таким email вже існує

---

### 2. Вхід (Login)
**POST** `/auth/login`

Автентифікує користувача та повертає JWT токен.

**Request Body:**
```json
{
  "email": "teacher@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Статус коди:**
- `200` - Успішний вхід
- `401` - Неправильний email або пароль

---

### 3. Отримати поточного користувача
**GET** `/auth/me`

Повертає інформацію про авторизованого користувача.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "teacher@example.com",
  "name": "Іван Петренко",
  "is_active": true,
  "created_at": "2026-01-14T10:30:00+02:00"
}
```

**Статус коди:**
- `200` - Успішно
- `401` - Неавторизований доступ

---

## Використання токенів

Після успішної реєстрації або входу, отриманий `access_token` потрібно додавати до всіх захищених запитів в заголовку:

```
Authorization: Bearer <access_token>
```

Токен діє 7 днів.

---

## Захищені endpoints

Всі наступні endpoints вимагають автентифікації:
- `/students/*` - Управління студентами
- `/lessons/*` - Управління заняттями
- `/payments/*` - Управління платежами
- `/upload/` - Завантаження файлів

---

## Приклад використання з fetch (JavaScript)

```javascript
// Реєстрація
const signupResponse = await fetch('http://localhost:8000/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'teacher@example.com',
    password: 'securepassword123',
    name: 'Іван Петренко'
  })
});

const { access_token } = await signupResponse.json();

// Збереження токена
localStorage.setItem('token', access_token);

// Використання токена для захищених запитів
const studentsResponse = await fetch('http://localhost:8000/students/', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const students = await studentsResponse.json();
```

---

## Безпека

- Паролі зберігаються в базі даних у вигляді bcrypt хешів
- JWT токени підписуються за допомогою HS256 алгоритму
- SECRET_KEY має бути змінений в production через змінну оточення
- Всі чутливі операції вимагають валідного токена

---

## Змінні оточення

Додайте до `.env` файлу:

```env
SECRET_KEY=your-very-secret-key-change-in-production-minimum-32-characters
```

**Важливо:** Ніколи не використовуйте дефолтний SECRET_KEY в production!
