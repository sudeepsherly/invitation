const loader = document.getElementById('loader');
const navbar = document.querySelector('.navbar');
const backToTop = document.getElementById('backToTop');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const revealItems = document.querySelectorAll('.reveal');
const welcomeOverlay = document.getElementById('welcomeOverlay');
const openInvitationBtn = document.getElementById('openInvitationBtn');
const welcomeHeading = document.querySelector('.welcome-card h2');
const welcomeSubtitle = document.querySelector('.welcome-subtitle');
const bgMusic = document.getElementById('bgMusic');
const rsvpForm = document.getElementById('rsvpForm');
const rsvpMessage = document.getElementById('rsvpMessage');
const rsvpSheetUrl = rsvpForm?.dataset.sheetUrl || window.RSVP_GOOGLE_SHEET_URL;
const scheduleCards = document.querySelectorAll('.schedule-card');
const scheduleList = document.querySelector('.schedule-list');

// Welcome overlay removed — no interaction needed here

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 700);
});

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 500);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

toggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => observer.observe(item));

if (scheduleCards.length && scheduleList) {
  const scheduleRail = document.createElement('span');
  scheduleRail.className = 'schedule-rail';
  scheduleList.appendChild(scheduleRail);

  const scheduleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.55 });

  scheduleCards.forEach((card) => scheduleObserver.observe(card));

  const updateScheduleRail = () => {
    if (!scheduleList) return;
    const rect = scheduleList.getBoundingClientRect();
    
    // Position the heart near the vertical middle of the screen
    // so it arrives at events well before the navbar does.
    let offset = (window.innerHeight * 0.5) - rect.top;
    
    // Clamp the heart so it stays within the vertical line
    if (offset < 0) offset = 0;
    if (offset > rect.height) offset = rect.height;
    
    const scrollPct = rect.height > 0 ? (offset / rect.height) * 100 : 0;
    
    scheduleList.style.setProperty('--ball-top', `${offset}px`);
    scheduleList.style.setProperty('--scroll-pct', scrollPct);
    
    // Calculate exact X position by measuring the SVG path length
    const svgPath = scheduleList.querySelector('.winding-path-base');
    if (svgPath) {
      const pathLength = svgPath.getTotalLength();
      // Clamp to 0-1 for getting the point along the SVG length
      let clampedPct = scrollPct / 100;
      if (clampedPct < 0) clampedPct = 0;
      if (clampedPct > 1) clampedPct = 1;
      
      const point = svgPath.getPointAtLength(pathLength * clampedPct);
      // Pass the raw percentage (0 to 1) so CSS can scale it based on width
      scheduleList.style.setProperty('--heart-x-pct', point.x / 100); 
    }
  };

  window.addEventListener('scroll', updateScheduleRail, { passive: true });
  window.addEventListener('resize', updateScheduleRail);
  updateScheduleRail();
}

if (welcomeOverlay && openInvitationBtn) {
  document.body.classList.add('welcome-visible');
  openInvitationBtn.addEventListener('click', () => {
    welcomeOverlay.classList.add('opening');
    const card = welcomeOverlay.querySelector('.welcome-card');
    if (card) { card.style.filter = 'none'; card.style.opacity = '1'; card.style.transform = 'scale(1)'; }
    
    // Animate the text changes: fade out slightly, change text, then pop in
    const elementsToAnimate = [welcomeHeading, welcomeOverlay.querySelector('.welcome-echad')].filter(Boolean);
    elementsToAnimate.forEach(el => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9)';
    });

    setTimeout(() => {
      if (welcomeHeading) {
        welcomeHeading.textContent = "YOU'RE INVITED!";
        welcomeHeading.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        welcomeHeading.style.opacity = '1';
        welcomeHeading.style.transform = 'scale(1)';
      }
      
      const echadText = welcomeOverlay.querySelector('.welcome-echad');
      if (echadText) {
        echadText.textContent = 'ECHAD';
        echadText.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        echadText.style.opacity = '1';
        echadText.style.transform = 'scale(1)';
      }

      // Create the subtitle for "Step inside..."
      const subtitleEl = document.createElement('p');
      subtitleEl.style.cssText = 'font-size: 1rem; color: var(--ink); margin-top: 1rem; opacity: 0; transform: translateY(10px); transition: all 0.6s ease 0.2s;';
      subtitleEl.textContent = 'Step inside and celebrate with us...';
      if (echadText) {
        echadText.parentNode.insertBefore(subtitleEl, echadText.nextSibling);
      } else if (welcomeHeading) {
        welcomeHeading.parentNode.insertBefore(subtitleEl, welcomeHeading.nextSibling);
      }
      
      // Trigger animation for the new subtitle
      requestAnimationFrame(() => {
        subtitleEl.style.opacity = '1';
        subtitleEl.style.transform = 'translateY(0)';
      });

    }, 300); // 300ms fade out before changing text

    openInvitationBtn.style.display = 'none';
    if (bgMusic) {
      bgMusic.dataset.userUnlocked = 'true';
      window.startMusic?.();
    }
    createConfetti();

    // Show "You're Invited" for 3 seconds then open main page
    let secs = 3;
    const countEl = document.createElement('p');
    countEl.style.cssText = 'margin-top:1.5rem; font-size:0.85rem; color:var(--muted); letter-spacing:0.05em; opacity: 0; transition: opacity 1s ease;';
    countEl.textContent = `Opening in ${secs}...`;
    card.appendChild(countEl);
    requestAnimationFrame(() => countEl.style.opacity = '1');

    const interval = setInterval(() => {
      secs -= 1;
      countEl.textContent = `Opening in ${secs}...`;
      if (secs <= 0) {
        clearInterval(interval);
        welcomeOverlay.classList.add('hidden');
        document.body.classList.remove('welcome-visible');
      }
    }, 1000);
  });
}

function createConfetti() {
  const colors = ['#ffe08a', '#ffffff', '#ffd0d0', '#d4af37'];
  const pieceCount = 24;
  for (let i = 0; i < pieceCount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 240}px`);
    piece.style.animationDuration = `${1 + Math.random() * 0.6}s`;
    welcomeOverlay.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}

const targetDate = new Date('2026-10-26T16:00:00+05:30');
function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;
  
  const countdownContainer = document.getElementById('countdown');
  const weddingDayMessage = document.getElementById('weddingDayMessage');
  
  if (diff <= 0) {
    if (countdownContainer) countdownContainer.style.display = 'none';
    if (weddingDayMessage) weddingDayMessage.classList.remove('hidden');
    return;
  }
  
  if (countdownContainer) countdownContainer.style.display = '';
  if (weddingDayMessage) weddingDayMessage.classList.add('hidden');
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  
  const dEl = document.getElementById('days');
  const hEl = document.getElementById('hours');
  const mEl = document.getElementById('minutes');
  const sEl = document.getElementById('seconds');
  
  if (dEl) dEl.textContent = String(days).padStart(2, '0');
  if (hEl) hEl.textContent = String(hours).padStart(2, '0');
  if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
  if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
}

async function submitRsvpToPrivateStore(data) {
  const url = String(rsvpSheetUrl || '').trim();

  if (!url) {
    throw new Error('RSVP endpoint is not configured.');
  }

  // Google Apps Script doPost(e) reads e.parameter, which requires
  // application/x-www-form-urlencoded (NOT JSON).
  const formBody = new URLSearchParams(data);

  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formBody.toString(),
  });
}

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(rsvpForm);
    const submission = Object.fromEntries(formData.entries());
    const name = String(submission.name || '').trim();

    if (!name) {
      if (rsvpMessage) {
        rsvpMessage.textContent = 'Please enter your name before sending the RSVP.';
        rsvpMessage.className = 'form-message error';
      }
      return;
    }

    try {
      await submitRsvpToPrivateStore(submission);
      rsvpForm.reset();

      if (rsvpMessage) {
        rsvpMessage.textContent = `Thank you, ${name}! Your RSVP has been received. We look forward to celebrating with you! 🎉`;
        rsvpMessage.className = 'form-message success';
      }
    } catch (error) {
      console.error('Unable to save RSVP:', error);
      if (rsvpMessage) {
        rsvpMessage.textContent = 'Something went wrong. Please try again or contact us directly.';
        rsvpMessage.className = 'form-message error';
      }
    }

  });
}

const greetingForm = document.getElementById('greetingForm');
const greetingMessage = document.getElementById('greetingMessage');

if (greetingForm) {
  greetingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(greetingForm);
    const submission = Object.fromEntries(formData.entries());
    const name = String(submission.name || '').trim();

    if (!name) {
      if (greetingMessage) {
        greetingMessage.textContent = 'Please enter your name.';
        greetingMessage.className = 'form-message error';
      }
      return;
    }

    try {
      const greetingUrl = greetingForm.dataset.sheetUrl || rsvpSheetUrl;
      const formBody = new URLSearchParams(submission);
      await fetch(greetingUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });
      greetingForm.reset();

      if (greetingMessage) {
        greetingMessage.textContent = `Thank you, ${name}! Your blessing has been received with love. 💖`;
        greetingMessage.className = 'form-message success';
      }
    } catch (error) {
      console.error('Unable to save greeting:', error);
      if (greetingMessage) {
        greetingMessage.textContent = 'Something went wrong. Please try again.';
        greetingMessage.className = 'form-message error';
      }
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Automatically apply 'filled' class for styling when inputs have data (handles autofill/paste robustly on all browsers)
document.querySelectorAll('.rsvp-form input, .rsvp-form textarea, .rsvp-form select').forEach(el => {
  const checkFilled = () => {
    if (el.value.trim() !== '') {
      el.classList.add('filled');
    } else {
      el.classList.remove('filled');
    }
  };
  el.addEventListener('input', checkFilled);
  el.addEventListener('change', checkFilled);
  el.addEventListener('blur', checkFilled);
  el.addEventListener('paste', () => setTimeout(checkFilled, 10));
  
  // Initial check in case of browser autofill on load
  setTimeout(checkFilled, 100);
});
