/* ============================================
   ROLE SELECTOR - Toon content per rol
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const roleCards = document.querySelectorAll('.role-card[data-role]');
    const fysioSection = document.getElementById('content-fysio');
    const patientSection = document.getElementById('content-patient');

    if (!roleCards.length || !fysioSection || !patientSection) {
        console.warn('Role selector: elementen niet gevonden');
        return;
    }

    // Onthoud eerdere keuze
    const savedRole = localStorage.getItem('fysiodex-role');
    if (savedRole === 'fysio' || savedRole === 'patient') {
        showContent(savedRole, false);
    }

    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            const role = card.dataset.role;
            showContent(role, true);
            localStorage.setItem('fysiodex-role', role);
        });
    });

    function showContent(role, scroll = true) {
        fysioSection.hidden = true;
        patientSection.hidden = true;

        let target = null;
        if (role === 'fysio') {
            fysioSection.hidden = false;
            target = fysioSection;
        } else if (role === 'patient') {
            patientSection.hidden = false;
            target = patientSection;
        }

        // Actieve kaart markeren
        roleCards.forEach(card => {
            if (card.dataset.role === role) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        if (target && scroll) {
            // CSS scroll-margin-top regelt de offset
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});