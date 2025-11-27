
// Example: Handle contact form submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault(); // Prevent actual form submission
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      alert(`Thank you, ${name}! Your message has been received.`);
      // Optionally, clear the form fields
      form.reset();
    });
  }
});

const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

toggleButton.addEventListener('click', function() {
  body.classList.toggle('dark-mode');
  if (body.classList.contains('dark-mode')) {
    toggleButton.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
  } else {
    toggleButton.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
  }
});

// Toggle dark mode functionality
toggleButton.addEventListener('click', function() {
    body.classList.toggle('dark-theme');
    
    // Change button icon
    if (body.classList.contains('dark-theme')) {
        toggleButton.textContent = '☀️';
    } else {
        toggleButton.textContent = '🌙';
    }
});