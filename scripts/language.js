// scripts/language.js
let currentLanguage = localStorage.getItem('fysiodex_language') || 'nl';
let nlIcon = null;
let laIcon = null;
let toggleWrapper = null;
let translations = {};

// Define the translation files to load
const translationFiles = [
    '/json/language/home.json',      
    '/json/language/knie.json',  

    // Add more translation files as needed
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

        // Merge all translations into a single object
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
    document.body.className = `language-${lang}`;
    
    // Animate slider
    if (toggleWrapper) {
        if (lang === 'la') {
            toggleWrapper.classList.add('la-active');
        } else {
            toggleWrapper.classList.remove('la-active');
        }
    }
    
    // Update icon active status (color)
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
    
    if (!nlIcon || !laIcon) {
        setTimeout(initLanguageToggle, 100);
        return;
    }
    
    // Set initial slider position
    if (currentLanguage === 'la') {
        toggleWrapper.classList.add('la-active');
        laIcon.classList.add('active');
    } else {
        toggleWrapper.classList.remove('la-active');
        nlIcon.classList.add('active');
    }
    
    setLanguage(currentLanguage);
    
    nlIcon.addEventListener('click', toggleLanguage);
    laIcon.addEventListener('click', toggleLanguage);
}

// Start met laden
loadTranslations();
initLanguageToggle();