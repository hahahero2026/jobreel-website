/**
 * Job-Video.de — Application Logic
 * Vanilla JavaScript (Zero-Dependency)
 * Features:
 *  1. Horizontal Hero Reel Carousel Navigation (Left/Right)
 *  2. Fullscreen 9:16 Video Modal
 *  3. In-Modal Infinite Slider (Next/Prev, Keyboard ←/→, Touch-Swipe)
 *  4. Facebook-Style Dynamic Video Download Button
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Horizontal Carousel Scroll Navigation (Hero-Bereich)
    // -------------------------------------------------------------------------
    const carousel = document.getElementById('reelCarousel');
    const btnPrev = document.getElementById('carouselPrev');
    const btnNext = document.getElementById('carouselNext');

    if (carousel && btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            const cardWidth = carousel.querySelector('.reel-card')?.offsetWidth || 240;
            carousel.scrollBy({ left: -(cardWidth + 20), behavior: 'smooth' });
        });

        btnNext.addEventListener('click', () => {
            const cardWidth = carousel.querySelector('.reel-card')?.offsetWidth || 240;
            carousel.scrollBy({ left: cardWidth + 20, behavior: 'smooth' });
        });
    }

    // -------------------------------------------------------------------------
    // 2. Video Registry (Alle verfügbaren 9:16 Reels dynamisch aus dem DOM laden)
    // -------------------------------------------------------------------------
    const carouselCards = document.querySelectorAll('#reelCarousel .js-open-reel');
    const allReelCards = document.querySelectorAll('.js-open-reel');
    
    // Eindeutige Liste aller Reels in Reihenfolge erstellen
    const reels = [];
    carouselCards.forEach(card => {
        const video = card.getAttribute('data-video');
        const title = card.getAttribute('data-title') || 'JobReel';
        if (video && !reels.some(r => r.video === video)) {
            reels.push({ video, title });
        }
    });

    // -------------------------------------------------------------------------
    // 3. Modal & In-Modal Slider Engine
    // -------------------------------------------------------------------------
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalTitle = document.getElementById('modalTitle');
    const modalCounter = document.getElementById('modalCounter');
    const modalDownloadBtn = document.getElementById('modalDownloadBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalNavPrev = document.getElementById('modalNavPrev');
    const modalNavNext = document.getElementById('modalNavNext');
    const modalVideoWrapper = document.querySelector('.modal-video-wrapper');

    let currentReelIndex = 0;

    /**
     * Schaltet das aktive Video im Modal um
     * @param {number} index Index des anzuzeigenden Reels
     */
    function displayReel(index) {
        if (!reels.length || !modalVideo) return;

        // Index begrenzen
        currentReelIndex = index;
        const current = reels[currentReelIndex];

        // Videoquelle & Titel aktualisieren
        modalVideo.src = current.video;
        if (modalTitle) modalTitle.textContent = current.title;
        
        // Zähler aktualisieren (z. B. "3 / 6")
        if (modalCounter) {
            modalCounter.textContent = `${currentReelIndex + 1} / ${reels.length}`;
        }

        // Facebook-Style Download-Button synchronisieren
        if (modalDownloadBtn) {
            const fileName = current.video.split('/').pop();
            modalDownloadBtn.href = current.video;
            modalDownloadBtn.setAttribute('download', fileName);
        }

        // Video an den Anfang setzen und abspielen
        modalVideo.currentTime = 0;
        const playPromise = modalVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log('Autoplay policy: Benutzer kann Video per Klick starten.', err);
            });
        }
    }

    /**
     * Nächstes Video (Endlos-Schleife)
     */
    function nextReel() {
        if (!reels.length) return;
        const newIndex = (currentReelIndex + 1) % reels.length;
        displayReel(newIndex);
    }

    /**
     * Vorheriges Video (Endlos-Schleife)
     */
    function prevReel() {
        if (!reels.length) return;
        const newIndex = (currentReelIndex - 1 + reels.length) % reels.length;
        displayReel(newIndex);
    }

    /**
     * Öffnet das Modal
     * @param {number} index Index des anzuspringenden Videos
     */
    function openModal(index) {
        if (!modal) return;
        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden'; // Hintergrund-Scroll sperren
        displayReel(index);
    }

    /**
     * Schließt das Modal
     */
    function closeModal() {
        if (!modal || !modalVideo) return;

        modalVideo.pause();
        modalVideo.removeAttribute('src'); // Pufferung sofort stoppen
        modalVideo.load();

        modal.classList.remove('is-active');
        document.body.style.overflow = ''; // Scroll freigeben
    }

    // Klick auf Kacheln (Carousel und Showroom)
    allReelCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoSrc = card.getAttribute('data-video');
            const targetIndex = reels.findIndex(r => r.video === videoSrc);
            openModal(targetIndex !== -1 ? targetIndex : 0);
        });
    });

    // Pfeil-Buttons im Modal
    if (modalNavNext) {
        modalNavNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextReel();
        });
    }

    if (modalNavPrev) {
        modalNavPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevReel();
        });
    }

    // Schließen-Button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    // Klick auf den abgedunkelten Hintergrund schließt das Modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            // Nur schließen, wenn direkt auf Backdrop geklickt wird
            if (e.target === modal || e.target.classList.contains('video-modal-container')) {
                closeModal();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 4. Tastatur-Steuerung (Desktop-Power-Feature)
    // -------------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        if (!modal || !modal.classList.contains('is-active')) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextReel();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevReel();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
        }
    });

    // -------------------------------------------------------------------------
    // 5. Touch-Swipe Gesten (Smartphone & Tablet)
    // -------------------------------------------------------------------------
    let touchStartX = 0;
    let touchEndX = 0;

    if (modalVideoWrapper) {
        modalVideoWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modalVideoWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;
        
        if (diff < -swipeThreshold) {
            // Wisch nach links -> Nächstes Reel
            nextReel();
        } else if (diff > swipeThreshold) {
            // Wisch nach rechts -> Vorheriges Reel
            prevReel();
        }
    }

    // -------------------------------------------------------------------------
    // 6. E-Mail Bot Protection (Base64 Safe Mail Buttons & Links)
    // -------------------------------------------------------------------------
    const safeButtons = document.querySelectorAll('.safe-mail-btn');
    safeButtons.forEach(btn => {
        const setHref = () => {
            const encoded = btn.getAttribute('data-encoded');
            const subject = btn.getAttribute('data-subject');
            if (encoded) {
                try {
                    const email = atob(encoded);
                    const url = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
                    btn.setAttribute('href', url);
                    return url;
                } catch (e) {
                    console.error('Error decoding safe email button:', e);
                }
            }
            return null;
        };

        const mailtoUrl = setHref();

        btn.addEventListener('click', (e) => {
            const url = mailtoUrl || setHref();
            if (url && btn.getAttribute('href') === '#') {
                e.preventDefault();
                window.location.href = url;
            }
        });
    });
});
