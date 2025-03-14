// Array to store ticket submissions
let tickets = [];
// Global arrays to store criteria
let filterCriteria = [];
let sortCriteria = [];
let originalTickets = [];
let displayedTickets = [];
let currentPage = 1;
const ticketsPerPage = 5;

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
    originalTickets = [...tickets]; // Backup original order
    displayedTickets = [...tickets]; // Initialize displayed tickets

    // Add refresh button event listener
    document.querySelector('.refresh-btn').addEventListener('click', function () {
        loadTicketsFromLocalStorage(); // Reload from localStorage
        sortCriteria = []; // Reset sort criteria
        filterCriteria = []; // Reset filter criteria
        displayedTickets = [...tickets]; // Reset displayed tickets
        displayTickets(); // Refresh the table
    });

    // Add event listener to sort button
    const sortBtn = document.getElementById('sortBtn');
    sortBtn.addEventListener('click', function (event) {
        const closeSort = event.target.closest('.close-sort');
        if (closeSort) {
            // Revert to original state
            displayedTickets = [...originalTickets]; // Fixed from displayTickets to displayedTickets
            sortCriteria = [];
            sortBtn.classList.remove('sorted');
            sortBtn.querySelector('.sort-label').textContent = 'Sort';
            sortBtn.querySelector('.close-sort').style.display = 'none';
            sortBtn.querySelector('.sort-image').style.display = 'inline';
            saveTicketsToLocalStorage();
            displayTickets();
            event.stopPropagation(); // Prevent popup from opening
        } else {
            showSortPopup();
        }
    });

    // Add event listener to filter button
    const filterBtn = document.getElementById('filterBtn');
    filterBtn.addEventListener('click', function (event) {
        const closeFilter = event.target.closest('.close-filter');
        if (closeFilter) {
            // Revert to original state
            displayedTickets = [...originalTickets]; // Reset displayed tickets
            filterCriteria = [];
            filterBtn.classList.remove('filtered');
            filterBtn.querySelector('.filter-label').textContent = 'Filter';
            filterBtn.querySelector('.close-filter').style.display = 'none';
            filterBtn.querySelector('.filter-image').style.display = 'inline';
            saveTicketsToLocalStorage(); // Save original tickets
            displayTickets();
            event.stopPropagation(); // Prevent popup from opening
        } else {
            showFilterPopup();
        }
    });

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

// Update displayTickets with pagination
function displayTickets() {
    const tableBody = document.getElementById('ticketTableBody');
    if (!tableBody) {
        console.error("Table body not found!");
        return;
    }
    tableBody.innerHTML = '';

    const totalPages = Math.ceil(displayedTickets.length / ticketsPerPage);
    const startIndex = (currentPage - 1) * ticketsPerPage;
    const endIndex = startIndex + ticketsPerPage;
    const paginatedTickets = displayedTickets.slice(startIndex, endIndex);

    if (paginatedTickets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="no-tickets">No tickets submitted yet</td></tr>';
        return;
    }

    paginatedTickets.forEach((ticket, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td><strong>${ticket.fullName}</strong><br><small>${ticket.email || ticket.phone}</small></td>
            <td><strong>${ticket.subject}</strong><br><small>${ticket.message.substring(0, 50)}${ticket.message.length > 50 ? '...' : ''}</small></td>
            <td>${ticket.date}</td>
            <td class="ticket-buttons">
                <button class="action-btn view-btn" onclick="showInfo(${index})" title="View Ticket" data-id="${ticket.id}"><img alt="image" src="information.png" width="20" height="20"></button>
                <button onclick="downloadAttachment(${index})"><img alt="image" src="download.png" width="20" height="20"></button>
                <button class="action-btn contact-btn" onclick="triggerCall('${ticket.phone}')" title="Contact" data-id="${ticket.id}"><img alt="image" src="call.png" width="20" height="20"></button>
                <button class="action-btn email-btn" onclick="sendEmail('${ticket.email}')" title="Send Email" data-id="${ticket.id}"><img alt="image" src="mailing.png" width="20" height="20"></button>
                <button class="action-btn edit-btn" onclick="editTicket(${index})" title="Edit Ticket" data-id="${ticket.id}"><img alt="image" src="edit.png" width="20" height="20"></button>
                <button class="action-btn delete-btn" title="Delete Ticket" data-id="${ticket.id}"><img alt="image" src="delete.png" width="20" height="20"></button>
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

    // Add pagination controls
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.innerHTML = `
        <button onclick="jumpToFirstPage()" ${currentPage === 1 ? 'disabled' : ''}>First</button>
        <button onclick="previousPage()" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button onclick="nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
        <button onclick="jumpToLastPage()" ${currentPage === totalPages ? 'disabled' : ''}>Last</button>
    `;
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) existingPagination.replaceWith(paginationDiv);
    else document.querySelector('.table-container').appendChild(paginationDiv);
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
    originalTickets = [...tickets]; // Update originalTickets after deletion
    displayedTickets = [...tickets]; // Sync displayedTickets
    saveTicketsToLocalStorage();
    displayTickets();
}

function saveTicketsToLocalStorage() {
    localStorage.setItem('tickets', JSON.stringify(tickets)); // Save original tickets
}

function loadTicketsFromLocalStorage() {
    const storedTickets = localStorage.getItem('tickets');
    if (storedTickets) {
        tickets = JSON.parse(storedTickets);
        originalTickets = [...tickets];
        displayedTickets = [...tickets];
    }
}


window.showSortPopup = function () {
    const content = document.getElementsByClassName("popup-content")[0];
    content.innerHTML = `
        <div class="sort-popup">
            <div class="sort-popup-header">
                <div class="sort-header-start">
                    <img src="Vector.svg" alt="image" width="20" height="20">
                    <h2>Sort Tickets</h2>
                </div>
                <img class="close" id="closePopup" src="cancel.svg" alt="image" width="20" height="20">
            </div>
            <div id="sortCriteriaList"></div>
            <button onclick="addSortCriteria()">Add Sort</button>
            <div class="filter-popup-footer">
                <button id="resetBtn" onclick="resetSort()">Reset Sorting</button>
                <button id="submitBtn" onclick="applySort(); document.getElementById('popup').style.display = 'none';">Submit</button>
            </div>
        </div>
    `;
    document.getElementById("popup").style.display = "block";
    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("popup").style.display = "none";
    });
    // Keep existing sort criteria
    document.getElementById("sortCriteriaList").innerHTML = '';
    sortCriteria.forEach(criterion => {
        const criterionId = criterion.id;
        const div = document.createElement("div");
        div.classList.add("sort-criterion-list");
        div.dataset.id = criterionId;
        div.innerHTML = `
            <div>
                <p><b>Column</b></p>
                <select class="sort-column">
                    <option value="fullName" ${criterion.column === 'fullName' ? 'selected' : ''}>Full Name</option>
                    <option value="email" ${criterion.column === 'email' ? 'selected' : ''}>Email</option>
                    <option value="phone" ${criterion.column === 'phone' ? 'selected' : ''}>Phone</option>
                    <option value="subject" ${criterion.column === 'subject' ? 'selected' : ''}>Subject</option>
                    <option value="date" ${criterion.column === 'date' ? 'selected' : ''}>Date Created</option>
                </select>
            </div>
            <div>
                <p><b>Order</b></p>
                <select class="sort-order">
                    <option value="asc" ${criterion.order === 'asc' ? 'selected' : ''}>Ascending</option>
                    <option value="desc" ${criterion.order === 'desc' ? 'selected' : ''}>Descending</option>
                </select>
            </div>
            <button id="deleteBtn" class="delete-sort" onclick="deleteSortCriteria(${criterionId})">🗑️</button>
        `;
        document.getElementById("sortCriteriaList").appendChild(div);

        div.querySelector(".sort-column").addEventListener("change", (e) => {
            criterion.column = e.target.value;
        });
        div.querySelector(".sort-order").addEventListener("change", (e) => {
            criterion.order = e.target.value;
        });
    });
    if (sortCriteria.length === 0) addSortCriteria();
};

window.addSortCriteria = function () {
    const list = document.getElementById("sortCriteriaList");
    const criterionId = Date.now();
    const div = document.createElement("div");
    div.classList.add("sort-criterion-list");
    div.dataset.id = criterionId;
    div.innerHTML = `
        <div>
            <select class="sort-column">
                <option value="fullName">Full Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="subject">Subject</option>
                <option value="date">Date Created</option>
            </select>
        </div>
        <div>
            <select class="sort-order">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
        <button class="delete-sort" onclick="deleteSortCriteria(${criterionId})">🗑️</button>
    `;
    list.appendChild(div);
    sortCriteria.push({ id: criterionId, column: "fullName", order: "asc" });

    div.querySelector(".sort-column").addEventListener("change", (e) => {
        const criterion = sortCriteria.find(c => c.id === criterionId);
        criterion.column = e.target.value;
    });
    div.querySelector(".sort-order").addEventListener("change", (e) => {
        const criterion = sortCriteria.find(c => c.id === criterionId);
        criterion.order = e.target.value;
    });
};

window.deleteSortCriteria = function (id) {
    sortCriteria = sortCriteria.filter(c => c.id !== id);
    const criterionDiv = document.querySelector(`#sortCriteriaList div[data-id="${id}"]`);
    if (criterionDiv) criterionDiv.remove();
};

// Update applySort and applyFilter to reset page to 1
window.applySort = function () {
    if (sortCriteria.length > 0) {
        displayedTickets.sort((a, b) => {
            for (const { column, order } of sortCriteria) {
                const valueA = a[column] || "";
                const valueB = b[column] || "";
                const comparison = valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
                if (comparison !== 0) {
                    return order === "asc" ? comparison : -comparison;
                }
            }
            return 0;
        });
        const sortBtn = document.getElementById('sortBtn');
        sortBtn.classList.add('sorted');
        sortBtn.querySelector('.sort-image').style.display = 'none';
        sortBtn.querySelector('.sort-label').textContent = `${sortCriteria.length} Sort`;
        sortBtn.querySelector('.close-sort').style.display = 'inline';
    }
    currentPage = 1; // Reset to first page after sorting
    displayTickets();
};

window.resetSort = function () {
    sortCriteria = []; // Clear sort criteria
    showSortPopup(); // Refresh popup to initial state
};

// Define column types and their valid relations
const columnTypes = {
    fullName: 'string',
    email: 'string',
    phone: 'string',
    subject: 'string',
    date: 'date'
};

const relationsByType = {
    string: [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts With' }
    ],
    date: [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' }
    ]
};

window.showFilterPopup = function () {
    const content = document.getElementsByClassName("popup-content")[0];
    content.innerHTML = `
        <div class="filter-popup">
            <div class="filter-popup-header">
                <div class="filter-header-start">
                    <img src="filtercolor.svg" alt="image" width="20" height="20">
                    <h2>Filter Tickets</h2>
                </div>
                <img class="close" id="closePopup" src="cancel.svg" alt="image" width="20" height="20">
            </div>
            <div id="filterCriteriaList"></div>
            <button onclick="addFilterCriteria()">Add Filter</button>
            <div class="filter-popup-footer">
                <button id="resetBtn" onclick="resetFilter()">Reset Filter</button>
                <button id="submitBtn" onclick="applyFilter(); document.getElementById('popup').style.display = 'none';">Submit</button>
            </div>
        </div>
    `;
    document.getElementById("popup").style.display = "block";
    document.getElementById("closePopup").addEventListener("click", () => {
        document.getElementById("popup").style.display = "none";
    });

    // Populate existing filter criteria
    document.getElementById("filterCriteriaList").innerHTML = '';
    filterCriteria.forEach(criterion => {
        const criterionId = criterion.id;
        const columnType = columnTypes[criterion.column];
        const relations = relationsByType[columnType];
        const div = document.createElement("div");
        div.dataset.id = criterionId;
        div.classList.add('filter-criterion');
        div.innerHTML = `
            <div>
                <p><b>Column:</b></p>
                <select class="filter-column">
                    <option value="fullName" ${criterion.column === 'fullName' ? 'selected' : ''}>Full Name</option>
                    <option value="email" ${criterion.column === 'email' ? 'selected' : ''}>Email</option>
                    <option value="phone" ${criterion.column === 'phone' ? 'selected' : ''}>Phone</option>
                    <option value="subject" ${criterion.column === 'subject' ? 'selected' : ''}>Subject</option>
                    <option value="date" ${criterion.column === 'date' ? 'selected' : ''}>Date Created</option>
                </select>
            </div>
            <div>
                <p><b>Relation:</b></p>
                <select class="filter-relation">
                    ${relations.map(rel => `<option value="${rel.value}" ${criterion.relation === rel.value ? 'selected' : ''}>${rel.label}</option>`).join('')}
                </select>
            </div>
            <div>
            <p><b>Filter value:</b></p>
            <input class="filter-value" type="${columnType === 'date' ? 'date' : 'text'}" value="${criterion.value}" placeholder="Enter a value">
            </div>
            <button id="deleteBtn" class="delete-filter" onclick="deleteFilterCriteria(${criterionId})">🗑️</button>
        `;
        document.getElementById("filterCriteriaList").appendChild(div);

        // Update criterion on change
        div.querySelector(".filter-column").addEventListener("change", (e) => {
            criterion.column = e.target.value;
            // Update relations dropdown based on new column type
            const newType = columnTypes[criterion.column];
            const newRelations = relationsByType[newType];
            const relationSelect = div.querySelector(".filter-relation");
            relationSelect.innerHTML = newRelations.map(rel => `<option value="${rel.value}">${rel.label}</option>`).join('');
            criterion.relation = newRelations[0].value; // Reset to first relation
            // Update input type based on column
            const input = div.querySelector(".filter-value");
            input.type = newType === 'date' ? 'date' : 'text';
        });
        div.querySelector(".filter-relation").addEventListener("change", (e) => {
            criterion.relation = e.target.value;
        });
        div.querySelector(".filter-value").addEventListener("input", (e) => {
            criterion.value = e.target.value;
        });
    });
    if (filterCriteria.length === 0) addFilterCriteria();
};

window.addFilterCriteria = function () {
    const list = document.getElementById("filterCriteriaList");
    const criterionId = Date.now();
    const div = document.createElement("div");
    div.dataset.id = criterionId;
    div.classList.add('filter-criterion');
    const defaultColumn = 'fullName';
    const defaultType = columnTypes[defaultColumn];
    const defaultRelations = relationsByType[defaultType];
    div.innerHTML = `
        <select class="filter-column">
            <option value="fullName">Full Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="subject">Subject</option>
            <option value="date">Date Created</option>
        </select>
        <select class="filter-relation">
            ${defaultRelations.map(rel => `<option value="${rel.value}">${rel.label}</option>`).join('')}
        </select>
        <input class="filter-value" type="${defaultType === 'date' ? 'date' : 'text'}" placeholder="Enter a value">
        <button class="delete-filter" onclick="deleteFilterCriteria(${criterionId})">🗑️</button>
    `;
    list.appendChild(div);
    filterCriteria.push({ id: criterionId, column: defaultColumn, relation: defaultRelations[0].value, value: '' });

    // Add event listeners for dynamic updates
    div.querySelector(".filter-column").addEventListener("change", (e) => {
        const criterion = filterCriteria.find(c => c.id === criterionId);
        criterion.column = e.target.value;
        // Update relations dropdown based on new column type
        const newType = columnTypes[criterion.column];
        const newRelations = relationsByType[newType];
        const relationSelect = div.querySelector(".filter-relation");
        relationSelect.innerHTML = newRelations.map(rel => `<option value="${rel.value}">${rel.label}</option>`).join('');
        criterion.relation = newRelations[0].value;
        // Update input type
        const input = div.querySelector(".filter-value");
        input.type = newType === 'date' ? 'date' : 'text';
        criterion.value = '';
        input.value = '';
    });
    div.querySelector(".filter-relation").addEventListener("change", (e) => {
        const criterion = filterCriteria.find(c => c.id === criterionId);
        criterion.relation = e.target.value;
    });
    div.querySelector(".filter-value").addEventListener("input", (e) => {
        const criterion = filterCriteria.find(c => c.id === criterionId);
        criterion.value = e.target.value;
    });
};

window.deleteFilterCriteria = function (id) {
    filterCriteria = filterCriteria.filter(c => c.id !== id);
    const criterionDiv = document.querySelector(`#filterCriteriaList div[data-id="${id}"]`);
    if (criterionDiv) criterionDiv.remove();
};

window.applyFilter = function () {
    if (filterCriteria.length > 0) {
        displayedTickets = [...originalTickets].filter(ticket => {
            return filterCriteria.every(criterion => {
                const columnValue = ticket[criterion.column] || '';
                const filterValue = criterion.value;
                const type = columnTypes[criterion.column];

                if (!filterValue) return true;

                if (type === 'string') {
                    const columnStr = columnValue.toLowerCase();
                    const filterStr = filterValue.toLowerCase();
                    switch (criterion.relation) {
                        case 'equals': return columnStr === filterStr;
                        case 'contains': return columnStr.includes(filterStr);
                        case 'startsWith': return columnStr.startsWith(filterStr);
                        default: return true;
                    }
                } else if (type === 'date') {
                    const columnDate = new Date(columnValue);
                    const filterDate = new Date(filterValue);
                    if (isNaN(columnDate) || isNaN(filterDate)) return true;
                    switch (criterion.relation) {
                        case 'equals': return columnDate.toDateString() === filterDate.toDateString();
                        case 'greaterThan': return columnDate > filterDate;
                        case 'lessThan': return columnDate < filterDate;
                        default: return true;
                    }
                }
                return true;
            });
        });

        const filterBtn = document.getElementById('filterBtn');
        filterBtn.classList.add('filtered');
        filterBtn.querySelector('.filter-label').textContent = `${filterCriteria.length} Filter`;
        filterBtn.querySelector('.close-filter').style.display = 'block';
        filterBtn.querySelector('.filter-image').style.display = 'none';
    }
    currentPage = 1; // Reset to first page after filtering
    displayTickets();
};

window.resetFilter = function () {
    filterCriteria = []; // Clear filter criteria
    showFilterPopup(); // Refresh popup to initial state
};

// Pagination functions
function jumpToFirstPage() {
    currentPage = 1;
    displayTickets();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTickets();
    }
}

function nextPage() {
    const totalPages = Math.ceil(displayedTickets.length / ticketsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTickets();
    }
}

function jumpToLastPage() {
    currentPage = Math.ceil(displayedTickets.length / ticketsPerPage);
    displayTickets();
}
