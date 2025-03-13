// Array to store ticket submissions
let tickets = [];

document.getElementById("myFile").addEventListener("change", function () {
    const allowedExtensions = ["jpg", "png", "pdf"];
    const file = this.files[0];
    if (file) {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            alert("Invalid file type. Please upload a JPG, PNG, or PDF.");
            this.value = "";
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    loadTicketsFromLocalStorage();

    const formPage = document.getElementById('formPage');
    const ticketListPage = document.getElementById('ticketListPage');
    const ticketListLink = document.getElementById('ticketListLink');
    const homeLink = document.getElementById('homeLink');
    const ticketListLink2 = document.getElementById('ticketListLink2');
    const homeLink2 = document.getElementById('homeLink2');

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

    if (ticketListLink) ticketListLink.addEventListener('click', () => showPage('list'));
    if (ticketListLink2) ticketListLink2.addEventListener('click', () => showPage('list'));
    if (homeLink) homeLink.addEventListener('click', () => showPage('form'));
    if (homeLink2) homeLink2.addEventListener('click', () => showPage('form'));

    const form = document.getElementById('ticketForm');
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (validateForm()) {
                const fileInput = document.getElementById('myFile');
                const file = fileInput.files.length > 0 ? fileInput.files[0] : null;

                // Create ticket object and handle file as base64
                const ticket = {
                    id: generateId(),
                    fullName: document.getElementById('fullname').value,
                    email: document.getElementById('emailname').value,
                    phone: document.getElementById('phonenumber').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value,
                    preferredContact: document.querySelector('input[name="preferedcontact"]:checked').value,
                    attachment: file ? file.name : 'No attachment',
                    attachmentData: null, // Will store base64 string
                    date: new Date().toLocaleDateString()
                };

                // Convert file to base64 if present
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        ticket.attachmentData = e.target.result; // Base64 string
                        tickets.push(ticket);
                        saveTicketsToLocalStorage();
                        alert('Ticket submitted successfully!');
                        form.reset();
                        showPage('list');
                    };
                    reader.readAsDataURL(file);
                } else {
                    tickets.push(ticket);
                    saveTicketsToLocalStorage();
                    alert('Ticket submitted successfully!');
                    form.reset();
                    showPage('list');
                }
            }
        });
    }
    showPage('form');
});

function generateId() {
    return Date.now().toString();
}

function validateForm() {
    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('emailname').value;
    const phone = document.getElementById('phonenumber').value;
    const message = document.getElementById('message').value;
    const preferredContact = document.querySelector('input[name="preferedcontact"]:checked');
    const termsAccepted = document.getElementById('termsandconditions');

    if (fullName.trim() === '') { alert('Please enter your full name'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address'); return false; }
    if (!/^(254|\+254|07|01)?[0-9]{8,13}$/.test(phone)) { alert('Please enter a valid phone number'); return false; }
    if (message.trim() === '') { alert('Please enter a message'); return false; }
    if (!preferredContact) { alert('Please select a preferred contact method'); return false; }
    if (termsAccepted && !termsAccepted.checked) { alert('Please accept the Terms and Conditions'); return false; }
    return true;
}

function displayTickets() {
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }
    tableBody.innerHTML = '';
    if (tickets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="no-tickets">No tickets submitted yet</td></tr>';
        return;
    }
    tickets.forEach((ticket, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${ticket.fullName}</strong><br><small>${ticket.email || ticket.phone}</small></td>
            <td><strong>${ticket.subject}</strong><br><small>${ticket.message.substring(0, 50)}${ticket.message.length > 50 ? '...' : ''}</small></td>
            <td>${ticket.date}</td>
            <td>
                <button class="action-btn view-btn" onclick="showInfo(${index})" title="View Ticket" data-id="${ticket.id}">👁️</button>
                <button class="action-btn view-btn" onclick="editTicket(${index})" title="Edit Ticket" data-id="${ticket.id}">✏️</button>
                <button class="action-btn contact-btn" onclick="triggerCall('${ticket.phone}')" title="Contact" data-id="${ticket.id}">📞</button>
                <button class="action-btn email-btn" onclick="sendEmail('${ticket.email}')" title="Send Email" data-id="${ticket.id}">📧</button>
                <button onclick="downloadAttachment(${index})" title="Download Attachment">⬇️</button>
                <button class="action-btn delete-btn" title="Delete Ticket" data-id="${ticket.id}">🗑️</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            deleteTicket(id);
        });
    });
}

window.editTicket = function (index) {
    const content = document.getElementsByClassName("popup-content")[0];
    const entry = tickets[index];


    content.innerHTML = `
        <span class="close" id="closePopup">×</span>
        <h2>Edit Ticket</h2>
        <form id="editTicketForm">
            <p><strong>Ticket ID:</strong> ${entry.id}</p>
            <label>Full Name: <input type="text" id="editFullname" value="${entry.fullName}"></label><br>
            <label>Email: <input type="email" id="editEmailname" value="${entry.email}"></label><br>
            <label>Phone: <input type="tel" id="editPhonenumber" value="${entry.phone}"></label><br>
            <label>Subject: 
                <select id="editSubject">
                    <option value="Technical Issue" ${entry.subject === 'slowMBA' ? 'selected' : ''}>Mobile App is Slow</option>
                    <option value="Billing" ${entry.subject === 'slowWST' ? 'selected' : ''}>Web Site is Slow</option>
                </select>
            </label><br>
            <label>Message: <textarea id="editMessage">${entry.message}</textarea></label><br>
            <label>Preferred Contact: 
                <input type="radio" name="editPreferedcontact" value="email" ${entry.preferredContact === 'email' ? 'checked' : ''}> Email
                <input type="radio" name="editPreferedcontact" value="phone" ${entry.preferredContact === 'phone' ? 'checked' : ''}> Phone
            </label><br>
            <label>Attachment: <span>${entry.attachment}</span> <input type="file" id="editFile" accept=".jpg,.png,.pdf"></label><br>
            <button type="submit">Save Changes</button>
        </form>
    `;
    document.getElementById("popup").style.display = "block";

    // Close popup
    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("popup").style.display = "none";
    });

    // Handle form submission
    const form = document.getElementById("editTicketForm");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const fileInput = document.getElementById("editFile");
        const newFile = fileInput.files.length > 0 ? fileInput.files[0] : null;

        // Update ticket object
        const updatedTicket = {
            ...entry, // Spread to copy existing properties
            fullName: document.getElementById("editFullname").value,
            email: document.getElementById("editEmailname").value,
            phone: document.getElementById("editPhonenumber").value,
            subject: document.getElementById("editSubject").value,
            message: document.getElementById("editMessage").value,
            preferredContact: document.querySelector('input[name="editPreferedcontact"]:checked').value
        };

        if (newFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                updatedTicket.attachment = newFile.name;
                updatedTicket.attachmentData = e.target.result;
                tickets[index] = updatedTicket; // Update ticket in array
                saveTicketsToLocalStorage();
                document.getElementById("popup").style.display = "none";
                displayTickets();
            };
            reader.readAsDataURL(newFile);
        } else {
            tickets[index] = updatedTicket; // No new file, keep old attachment
            saveTicketsToLocalStorage();
            document.getElementById("popup").style.display = "none";
            displayTickets();
        }
    });
}

window.downloadAttachment = function (index) {
    const entry = tickets[index];
    if (!entry) {
        alert("Ticket not found.");
        return;
    }
    if (entry.attachmentData) {
        const a = document.createElement("a");
        a.href = entry.attachmentData;
        a.download = entry.attachment;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert("No attachment available for this ticket.");
    }
};

window.showInfo = function (index) {
    const content = document.getElementsByClassName("popup-content")[0];
    const entry = tickets[index];
    let previewHTML = '';

    // Generate preview based on file type
    if (entry.attachmentData) {
        const fileType = entry.attachment.split('.').pop().toLowerCase();
        if (fileType === 'jpg' || fileType === 'png') {
            previewHTML = `<img src="${entry.attachmentData}" alt="Attachment Preview" style="max-width: 100%; max-height: 300px;">`;
        } else if (fileType === 'pdf') {
            previewHTML = `<embed src="${entry.attachmentData}" type="application/pdf" width="100%" height="300px">`;
        }
    } else {
        previewHTML = 'No preview available.';
    }

    content.innerHTML = `
        <span class="close" id="closePopup">×</span>
        <h2>Ticket Details</h2>
        <p><strong>Ticket ID:</strong> ${entry.id}</p>
        <p><strong>Name:</strong> ${entry.fullName}</p>
        <p><strong>Email:</strong> ${entry.email}</p>
        <p><strong>Phone:</strong> ${entry.phone}</p>
        <p><strong>Subject:</strong> ${entry.subject}</p>
        <p><strong>Message:</strong> ${entry.message}</p>
        <p><strong>Preferred Contact:</strong> ${entry.preferredContact}</p>
        <p><strong>Attachment:</strong> ${entry.attachment}</p>
        <div><strong>Preview:</strong><br>${previewHTML}</div>
        <p><strong>Date:</strong> ${entry.date}</p>
    `;
    document.getElementById("popup").style.display = "block";
    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("popup").style.display = "none";
    });
};

window.addEventListener("click", function (event) {
    const popup = document.getElementById("popup");
    if (event.target === popup) popup.style.display = "none";
});

window.triggerCall = function (phone) {
    window.location.href = `tel:${phone}`;
};

window.sendEmail = function (email) {
    window.location.href = `mailto:${email}`;
};

function deleteTicket(id) {
    tickets = tickets.filter(ticket => ticket.id !== id);
    saveTicketsToLocalStorage();
    displayTickets();
}

function saveTicketsToLocalStorage() {
    localStorage.setItem('tickets', JSON.stringify(tickets));
}

function loadTicketsFromLocalStorage() {
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) tickets = JSON.parse(storedTickets);
}
