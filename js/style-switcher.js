/* ========================== toggle style switcher =========================== */
const styleSwitcherToggle = document.querySelector(".style-switcher-toggler");
styleSwitcherToggle.addEventListener("click", () => {
    document.querySelector(".style-switcher").classList.toggle("open");
})
// hide style - switcher on scroll
window.addEventListener("scroll", () => {
    if(document.querySelector(".style-switcher").classList.contains("open"))
    {
        document.querySelector(".style-switcher").classList.remove("open");
    }
})
/* ========================== theme colors =========================== */
const colorMap = {
    'color-1': {
        accent: '#50e3c2',
        accent2: '#eebbc3',
        gradient: 'linear-gradient(135deg, #50e3c2 0%, #eebbc3 100%)',
    },
    'color-2': {
        accent: '#6c63ff',
        accent2: '#f9a826',
        gradient: 'linear-gradient(135deg, #6c63ff 0%, #f9a826 100%)',
    },
    'color-3': {
        accent: '#ff6b6b',
        accent2: '#48dbfb',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #48dbfb 100%)',
    },
    'color-4': {
        accent: '#43e97b',
        accent2: '#38f9d7',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    'color-5': {
        accent: '#f7971e',
        accent2: '#ffd200',
        gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    },
};
function setActiveStyle(color) {
    const root = document.documentElement;
    const c = colorMap[color];
    if (!c) return;
    root.style.setProperty('--accent-light', c.accent);
    root.style.setProperty('--accent2-light', c.accent2);
    root.style.setProperty('--profile-gradient-light', c.gradient);
    root.style.setProperty('--accent-dark', c.accent);
    root.style.setProperty('--accent2-dark', c.accent2);
    root.style.setProperty('--profile-gradient-dark', c.gradient.replace('135deg', '135deg'));
    localStorage.setItem('theme-color', color);
}
/* ========================== theme light and dark mode =========================== */
const dayNight = document.querySelector(".day-night");
dayNight.addEventListener("click", () => {
    dayNight.querySelector("i").classList.toggle("fa-sun");
    dayNight.querySelector("i").classList.toggle("fa-moon");
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
});
window.addEventListener("load", () => {
    if(document.body.classList.contains("dark-mode"))
    {
        dayNight.querySelector("i").classList.add("fa-sun");
    }
    else
    {
        dayNight.querySelector("i").classList.add("fa-moon");
    }
});
// ========== Theme Persistence and Default Dark Mode ==========
function setThemeMode(mode) {
    if (mode === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme-mode', mode);
}
function getPreferredTheme() {
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved;
    return 'dark'; // Always default to dark
}
window.addEventListener('DOMContentLoaded', () => {
    setThemeMode('dark'); // Always set dark mode on load
    // Set color theme from localStorage
    const savedColor = localStorage.getItem('theme-color');
    if (savedColor) setActiveStyle(savedColor);
});