// frontend/src/hooks/useTheme.js
import { useState, useEffect } from "react";

export default function useTheme() {
  // 1. Зчитуємо тему з пам'яті або ставимо 'system'
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    // Спочатку чистимо класи
    root.classList.remove("light", "dark");

    if (theme === "system") {
      // Якщо 'system' - перевіряємо налаштування ОС
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      // Інакше ставимо те, що вибрав користувач
      root.classList.add(theme);
    }

    // Зберігаємо вибір
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}