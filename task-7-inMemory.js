// Array to store ticket submissions
let tickets = [];

// Function to show a specific page - moved outside for global access
function showPage(page) {
    const formPage = document.getElementById('formPage');
    const ticketListPage = document.getElementById('ticketListPage');
    
    if (page === 'form') {
        formPage.style.display = 'block';
        ticketListPage.style.display = 'none';
    } else if (page === 'list') {
        formPage.style.display = 'none';
        ticketListPage.style.display = 'block';
        displayTickets();
    }
}

document.getElementById("myFile").addEventListener("change", function() {
    const allowedExtensions = ["jpg", "png", "pdf"];
    const file = this.files[0];

    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert("Invalid file type. Please upload a JPG, PNG, or PDF.");
            this.value = ""; // Clear the input
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Check for URL parameters for ticket data
    const urlParams = new URLSearchParams(window.location.search);
    const ticketData = urlParams.get('ticketData');
    
    if (ticketData) {
        try {
            // Parse the ticket from URL and add to tickets array
            const newTicket = JSON.parse(decodeURIComponent(ticketData));
            tickets.push(newTicket);
            
            // Clear the URL parameter after reading
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Show the ticket list page if we received ticket data
            showPage('list');
        } catch (e) {
            console.error('Error parsing ticket data:', e);
        }
    }
    
    // Get references to navigation links
    const ticketListLink = document.getElementById('ticketListLink');
    const homeLink = document.getElementById('homeLink');
    const ticketListLink2 = document.getElementById('ticketListLink2');
    const homeLink2 = document.getElementById('homeLink2');

    // Event listeners for navigation
    if (ticketListLink) {
        ticketListLink.addEventListener('click', function() {
            showPage('list');
        });
    }

    if (ticketListLink2) {
        ticketListLink2.addEventListener('click', function() {
            showPage('list');
        });
    }

    if (homeLink) {
        homeLink.addEventListener('click', function() {
            showPage('form');
        });
    }

    if (homeLink2) {
        homeLink2.addEventListener('click', function() {
            showPage('form');
        });
    }
    
    // Get form element
    const form = document.getElementById('ticketForm');
    
    // Add submit event listener if form exists
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Validate form
            if (validateForm()) {
                // If valid, create ticket object
                const ticket = {
                    id: generateId(),
                    fullName: document.getElementById('fullname').value,
                    email: document.getElementById('emailname').value,
                    phone: document.getElementById('phonenumber').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value,
                    preferredContact: document.querySelector('input[name="preferedcontact"]:checked').value,
                    attachment: document.getElementById('myFile').files.length > 0 ? document.getElementById('myFile').files[0].name : 'No attachment',
                    date: new Date().toLocaleDateString()
                };
                
                // For in-memory version, we have two options:
                // 1. Use URL parameter (original approach)
                // 2. Just add to the tickets array and show the list (better for single-page app)
                
                // Option 1: Pass via URL
                /*
                const ticketDataEncoded = encodeURIComponent(JSON.stringify(ticket));
                window.location.href = window.location.pathname + '?ticketData=' + ticketDataEncoded;
                */
                
                // Option 2: For a single-page app approach
                tickets.push(ticket);
                alert('Ticket submitted successfully!');
                form.reset();
                showPage('list');
            }
        });
    }
    
    // Initially show the form page if no ticket data in URL
    if (!ticketData) {
        showPage('form');
    }
});

// Function to generate unique ID
function generateId() {
    return Date.now().toString();
}

// Function to validate form
function validateForm() {
    // Get values from form
    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('emailname').value;
    const phone = document.getElementById('phonenumber').value;
    const message = document.getElementById('message').value;
    const preferredContact = document.querySelector('input[name="preferedcontact"]:checked');
    const termsAccepted = document.getElementById('termsandconditions');
    
    // Validate full name
    if (fullName.trim() === '') {
        alert('Please enter your full name');
        return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Validate phone number - Updated to match error message
    const phoneRegex = /^(254|\+254|07|01)?[0-9]{8,13}$/;
    if (!phoneRegex.test(phone)) {
        alert('Please enter a valid phone number');
        return false;
    }
    
    // Validate message
    if (message.trim() === '') {
        alert('Please enter a message');
        return false;
    }
    
    // Validate preferred contact
    if (!preferredContact) {
        alert('Please select a preferred contact method');
        return false;
    }
    
    // Validate terms and conditions
    if (termsAccepted && !termsAccepted.checked) {
        alert('Please accept the Terms and Conditions');
        return false;
    }
    
    return true;
}

// Function to display tickets in the table
function displayTickets() {
    const tableBody = document.getElementById('ticketTableBody');
    
    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Check if we have tickets
    if (tickets.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="no-tickets">No tickets submitted yet</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Add each ticket to the table
    tickets.forEach((ticket, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <strong>${ticket.fullName}</strong><br>
                <small>${ticket.email || ticket.phone}</small>
            </td>
            <td>
                <strong>${ticket.subject}</strong><br>
                <small>${ticket.message.substring(0, 50)}${ticket.message.length > 50 ? '...' : ''}</small>
            </td>
            <td>${ticket.date}</td>
            <td>
                <button class="action-btn view-btn" onclick="showInfo(${index})" title="View Ticket" data-id="${ticket.id}">👁️</button>
                <button class="action-btn contact-btn" onclick="triggerCall('${ticket.phone}')" title="Contact" data-id="${ticket.id}">📞</button>
                <button class="action-btn email-btn" onclick="sendEmail('${ticket.email}')" title="Send Email" data-id="${ticket.id}">📧</button>
                <button class="action-btn delete-btn" title="Delete Ticket" data-id="${ticket.id}">🗑️</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            deleteTicket(id);
        });
    });
}

// Fixed showInfo function
window.showInfo = function(index) {
    const entry = tickets[index];
    alert(`Ticket ID: ${entry.id}\nName: ${entry.fullName}\nEmail: ${entry.email}\nPhone: ${entry.phone}\nSubject: ${entry.subject}\nMessage: ${entry.message}`);
};

window.triggerCall = function(phone) {
    window.location.href = `tel:${phone}`;
};

// Send Email
window.sendEmail = function(email) {
    window.location.href = `mailto:${email}`;
};

// Function to delete a ticket
function deleteTicket(id) {
    // Filter out the ticket with the given id
    tickets = tickets.filter(ticket => ticket.id !== id);
    
    // Update the display
    displayTickets();
}
