const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentIndex = 0;

function updateLightbox(index) {
  if (index < 0) index = galleryCards.length - 1;
  if (index >= galleryCards.length) index = 0;
  currentIndex = index;

  const card = galleryCards[currentIndex];
  const image = card.getAttribute('data-image');
  const title = card.getAttribute('data-title');

  if (!image) return;

  lightboxImg.style.opacity = 0;
  setTimeout(() => {
    lightboxImg.src = image;
    lightboxTitle.textContent = title;
    lightboxImg.style.opacity = 1;
  }, 150);
}

function openLightbox(index) {
  updateLightbox(index);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

galleryCards.forEach((card, index) => {
  card.addEventListener('click', () => openLightbox(index));
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); updateLightbox(currentIndex - 1); });
lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); updateLightbox(currentIndex + 1); });

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.classList.contains('lightbox-content')) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (!lightbox.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') updateLightbox(currentIndex - 1);
  if (event.key === 'ArrowRight') updateLightbox(currentIndex + 1);
});

let touchStartX = 0;
let touchEndX = 0;

lightbox?.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox?.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 50;
  if (touchEndX < touchStartX - swipeThreshold) {
    updateLightbox(currentIndex + 1);
  }
  if (touchEndX > touchStartX + swipeThreshold) {
    updateLightbox(currentIndex - 1);
  }
}

if (lightboxImg) lightboxImg.style.transition = 'opacity 0.15s ease-in-out';
