/* ============================================
   SPECIALISATIE.JS - Modal met iframe
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    const cards = document.querySelectorAll('.pathologie-card[data-modal]');
    const modal = document.getElementById('pathologie-modal');
    const iframe = document.getElementById('pathologie-iframe');
    const closeBtn = modal.querySelector('.pathologie-modal-close');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const url = card.getAttribute('href');
            iframe.src = url;
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    function closeModal() {
        modal.classList.remove('open');
        iframe.src = '';
        document.body.style.overflow = '';
    }

});