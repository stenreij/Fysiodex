const isFysioPage = document.body.classList.contains('role-fysiotherapeut');

// Reset language
if (!isFysioPage) {
    localStorage.setItem('fysiodex_language', 'nl');
}

let currentLanguage = localStorage.getItem('fysiodex_language') || 'nl';
let nlIcon = null;
let laIcon = null;
let toggleWrapper = null;
let translations = {};

// Define the translation files to load
const translationFiles = [
    // HOMEPAGE
    '/shared/json/language/home.json',
    // KNIE
    '/fysiotherapeuten/json/knie/knie.json',
    '/fysiotherapeuten/json/knie/anatomie.json',
    // OTHER
];

// Fetch and load all translation files
async function loadTranslations() {
    try {
        const allTranslations = await Promise.all(
            translationFiles.map(async (file) => {
                const response = await fetch(file);
                if (!response.ok) {
                    console.warn(`Kon ${file} niet laden, wordt overgeslagen`);
                    return {};
                }
                return await response.json();
            })
        );

        translations = {};
        allTranslations.forEach(translationChunk => {
            Object.keys(translationChunk).forEach(lang => {
                if (!translations[lang]) {
                    translations[lang] = {};
                }
                Object.assign(translations[lang], translationChunk[lang]);
            });
        });

        applyTranslations();
    } catch (error) {
        console.error('Error loading translations:', error);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            el.textContent = translations[currentLanguage][key];
        }
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('fysiodex_language', lang);

    document.body.classList.remove('language-nl', 'language-la');
    document.body.classList.add(`language-${lang}`);

    if (toggleWrapper) {
        if (lang === 'la') {
            toggleWrapper.classList.add('la-active');
        } else {
            toggleWrapper.classList.remove('la-active');
        }
    }

    if (nlIcon && laIcon) {
        if (lang === 'nl') {
            nlIcon.classList.add('active');
            laIcon.classList.remove('active');
        } else {
            nlIcon.classList.remove('active');
            laIcon.classList.add('active');
        }
    }

    applyTranslations();
}

function toggleLanguage() {
    const newLang = currentLanguage === 'nl' ? 'la' : 'nl';
    setLanguage(newLang);
}

function initLanguageToggle() {
    toggleWrapper = document.querySelector('.lang-toggle-wrapper');
    nlIcon = document.querySelector('.lang-icon[data-lang="nl"]');
    laIcon = document.querySelector('.lang-icon[data-lang="la"]');

    if (!nlIcon || !laIcon || !toggleWrapper) {
        setTimeout(initLanguageToggle, 100);
        return;
    }

    if (currentLanguage === 'la') {
        toggleWrapper.classList.add('la-active');
        laIcon.classList.add('active');
        nlIcon.classList.remove('active');
    } else {
        toggleWrapper.classList.remove('la-active');
        nlIcon.classList.add('active');
        laIcon.classList.remove('active');
    }

    applyTranslations();

    nlIcon.addEventListener('click', toggleLanguage);
    laIcon.addEventListener('click', toggleLanguage);
}

document.addEventListener('navbarLoaded', () => {
    loadTranslations();
    initLanguageToggle();
});

setTimeout(() => {
    if (!toggleWrapper) {
        loadTranslations();
        initLanguageToggle();
    }
}, 500);