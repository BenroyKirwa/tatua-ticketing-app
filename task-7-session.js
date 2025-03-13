// Array to store ticket submissions
let tickets = [];
// Global Map to store File objects
const fileStore = new Map();

document.getElementById("myFile").addEventListener("change", function () {
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

document.addEventListener('DOMContentLoaded', function () {
    // Load tickets from session storage when page loads
    loadTicketsFromSessionStorage();

    // Get references to sections
    const formPage = document.getElementById('formPage');
    const ticketListPage = document.getElementById('ticketListPage');

    // Get references to navigation links
    const ticketListLink = document.getElementById('ticketListLink');
    const homeLink = document.getElementById('homeLink');
    const ticketListLink2 = document.getElementById('ticketListLink2');
    const homeLink2 = document.getElementById('homeLink2');
    

    // Function to show a specific page
    function showPage(page) {
        if (page === 'form') {
            formPage.style.display = 'block';
            ticketListPage.style.display = 'none';
        } else if (page === 'list') {
            formPage.style.display = 'none';
            ticketListPage.style.display = 'block';
            displayTickets();
        }
    }

    // Event listeners for navigation
    if (ticketListLink) {
        ticketListLink.addEventListener('click', function () {
            showPage('list');
        });
    }

    if (ticketListLink2) {
        ticketListLink2.addEventListener('click', function () {
            showPage('list');
        });
    }

    if (homeLink) {
        homeLink.addEventListener('click', function () {
            showPage('form');
        });
    }

    if (homeLink2) {
        homeLink2.addEventListener('click', function () {
            showPage('form');
        });
    }

    // Get form element
    const form = document.getElementById('ticketForm');

    // Add submit event listener
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Validate form
            if (validateForm()) {
                // If valid, create ticket object
                const fileInput = document.getElementById('myFile');
                const file = fileInput.files.length > 0 ? fileInput.files[0] : null;
                const ticket = {
                    id: generateId(),
                    fullName: document.getElementById('fullname').value,
                    email: document.getElementById('emailname').value,
                    phone: document.getElementById('phonenumber').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value,
                    preferredContact: document.querySelector('input[name="preferedcontact"]:checked').value,
                    attachment: file ? file.name : 'No attachment', // Store filename in ticket
                    date: new Date().toLocaleDateString()
                };
                if (file) {
                    fileStore.set(ticket.id, file); // Store File object in Map
                }
                tickets.push(ticket);
                saveTicketsToSessionStorage();

                // Alert and show ticket list
                alert('Ticket submitted successfully!');
                form.reset();
                showPage('list');
            }
        });
    }

    // Initially show the form page
    showPage('form');
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

    // Validate phone number
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
                <button onclick="downloadAttachment(${index})">⬇️</button>
                <button class="action-btn delete-btn" title="Delete Ticket" data-id="${ticket.id}">🗑️</button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            deleteTicket(id);
        });
    });
}

// Download Attachment
window.downloadAttachment = function (index) {
    const entry = tickets[index];
    if (!entry) {
        alert("Ticket not found.");
        return;
    }
    const file = fileStore.get(entry.id);
    if (file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else {
        alert("No attachment available for this ticket.");
    }
};


window.showInfo = function (index) {
    const content = document.getElementsByClassName("popup-content")[0];
    const entry = tickets[index];
    content.innerHTML = `
    <span class="close" id="closePopup">&times;</span>
    <h2>Ticket Details</h2>
    <p><strong>Ticket ID:</strong> ${entry.id}</p>
    <p><strong>Name:</strong> ${entry.fullName}</p>
    <p><strong>Email:</strong> ${entry.email}</p>
    <p><strong>Phone:</strong> ${entry.phone}</p>
    <p><strong>Subject:</strong> ${entry.subject}</p>
    <p><strong>Message:</strong> ${entry.message}</p>
    <p><strong>Preferred Contact:</strong> ${entry.preferredContact}</p>
    <p><strong>Attachment:</strong> ${entry.attachment}</p>
    <p><strong>Date:</strong> ${entry.date}</p>
    `;

    document.getElementById("popup").style.display = "block";

    // Re-attach the close event listener since we just replaced the content
    document.getElementById("closePopup").addEventListener("click", function () {
        document.getElementById("popup").style.display = "none";
    });
};

// Close popup when clicking outside the popup content
window.addEventListener("click", function (event) {
    const popup = document.getElementById("popup");
    if (event.target === popup) {
        popup.style.display = "none";
    }
});

window.triggerCall = function (phone) {
    window.location.href = `tel:${phone}`;
};

// Send Email
window.sendEmail = function (email) {
    window.location.href = `mailto:${email}`;
};

// Function to delete a ticket
function deleteTicket(id) {
    tickets = tickets.filter(ticket => ticket.id !== id);
    fileStore.delete(id); // Remove file from Map
    saveTicketsToSessionStorage();
    displayTickets();
}

// Function to save tickets to session storage
function saveTicketsToSessionStorage() {
    sessionStorage.setItem('tickets', JSON.stringify(tickets));
}

// Function to load tickets from session storage
function loadTicketsFromSessionStorage() {
    const storedTickets = sessionStorage.getItem('tickets');
    if (storedTickets) {
        tickets = JSON.parse(storedTickets);
    }
}
