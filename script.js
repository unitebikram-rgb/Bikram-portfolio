// =========================================
// THEME TOGGLE
// =========================================
const body = document.body;
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    body.classList.add('dark');
    themeToggle.textContent = '☀';

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        const isDarkMode = body.classList.contains('dark');

        themeToggle.textContent = isDarkMode ? '☀' : '☾';
        themeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
    });
}

// =========================================
// CONTACT FORM HANDLER
// =========================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!submitButton) {
            return;
        }

        const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
        const accessKey = accessKeyInput ? accessKeyInput.value.trim() : '';

        if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
            formStatus.textContent = 'Add your Web3Forms access key to enable the contact form.';
            formStatus.style.color = '#f59e0b';
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        formStatus.textContent = 'Sending your message...';
        formStatus.style.color = 'var(--muted)';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: new FormData(contactForm)
            });

            const result = await response.json();

            if (result.success) {
                formStatus.textContent = 'Message sent successfully! I will contact you soon.';
                formStatus.style.color = '#22c55e';
                contactForm.reset();
            } else {
                formStatus.textContent = 'Something went wrong. Please email hello@bikramdev.com directly.';
                formStatus.style.color = '#f87171';
            }
        } catch (error) {
            formStatus.textContent = 'Network error. Please try again or email hello@bikramdev.com directly.';
            formStatus.style.color = '#f87171';
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });
}
