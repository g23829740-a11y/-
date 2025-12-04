const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Серверная сессия
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

// Инициализация passport
app.use(passport.initialize());
app.use(passport.session());

// Настройка стратегии Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // Здесь можно сохранять информацию о пользователе в базе данных
  console.log(profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Главная страница с кнопкой входа через Google
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.send(`
      <h1>Привет, ${req.user.displayName}</h1>
      <a href="/logout">Выйти</a>
    `);
  }

  res.send(`
    <h1>Добро пожаловать! Выберите способ входа:</h1>
    <a href="/auth/google">Войти через Google</a>
  `);
});

// Маршрут для входа через Google
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Callback для Google после успешного входа
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Перенаправляем на главную страницу после успешной аутентификации
    res.redirect('/');
  }
);

// Маршрут для выхода
app.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('/');
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер работает на порту ${PORT}`);
});