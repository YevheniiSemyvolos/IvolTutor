# 🚀 Швидкий старт

## Запуск проєкту

**Копіюйте і вставте в PowerShell:**

```powershell
cd C:\MyFolder\IvolTutor
docker compose down
docker compose up --build
```

> Якщо `docker compose` не працює, спробуйте `docker-compose`

## Очікування

Зачекайте 2-5 хвилин поки:
- ✓ PostgreSQL запуститься
- ✓ Backend встановить залежності
- ✓ Frontend встановить залежності

Ви побачите:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Доступ до додатку

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Перше використання

1. Відкрийте http://localhost:5173
2. Натисніть **"Зареєструватися"**
3. Введіть дані:
   - Email: `test@example.com`
   - Ім'я: `Test User`
   - Пароль: `password123`
4. Натисніть **"Зареєструватися"**
5. Ви будете перенаправлені на календар

## Інші команди

### Зупинка
```powershell
docker compose down
```

### Перезапуск
```powershell
docker compose restart
```

### Перегляд логів
```powershell
docker compose logs -f
```

### Окремі логи сервісів
```powershell
docker logs ivoltutor-backend-1
docker logs ivoltutor-frontend-1
```

## Проблеми?

Дивіться детальну інструкцію: [GUIDE.md](GUIDE.md)
