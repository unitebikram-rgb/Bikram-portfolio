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

    const showFormState = (message, state) => {
        formStatus.textContent = message;
        formStatus.classList.remove('is-success', 'is-error', 'is-pending');

        if (state) {
            formStatus.classList.add(state);
        }
    };

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!submitButton) {
            return;
        }

        const accessKeyInput = contactForm.querySelector('input[name="access_key"]');
        const accessKey = accessKeyInput ? accessKeyInput.value.trim() : '';

        if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
            showFormState('Please add a valid Web3Forms access key to enable the contact form.', 'is-error');
            return;
        }

        const captchaResponse = contactForm.querySelector('textarea[name="h-captcha-response"]');
        if (!captchaResponse || !captchaResponse.value) {
            showFormState('Please complete the security check before sending your message.', 'is-error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        showFormState('Sending your message...', 'is-pending');

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
                showFormState('Thank you! Your message has been sent successfully. I will get back to you soon.', 'is-success');
                contactForm.reset();
            } else {
                showFormState('Something went wrong. Please email bikrammajhidev@gmail.com directly.', 'is-error');
            }
        } catch (error) {
            showFormState('Network issue. Please try again or email bikrammajhidev@gmail.com directly.', 'is-error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });
}
