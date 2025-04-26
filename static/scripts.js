window.onload = function () {
    // Clear any stale user data when arriving at login page
    if (!document.getElementById('dashboardSection')) {
        console.log("Creating missing dashboardSection element");
        const mainContainer = document.querySelector('.container') || document.body;
        const dashboardSectionDiv = document.createElement('div');
        dashboardSectionDiv.id = 'dashboardSection';
        dashboardSectionDiv.className = 'container mt-4';
        
        // Make sure it's inserted at a good position in the DOM
        const existingContent = document.querySelector('main') || document.querySelector('.container');
        if (existingContent) {
            // Insert after the main content
            if (existingContent.nextSibling) {
                existingContent.parentNode.insertBefore(dashboardSectionDiv, existingContent.nextSibling);
            } else {
                existingContent.parentNode.appendChild(dashboardSectionDiv);
            }
        } else {
            // If no main content, append to body
            document.body.appendChild(dashboardSectionDiv);
        }
    }

    // Add dashboardContent container if it doesn't exist
    if (document.getElementById('dashboardSection') && !document.getElementById('dashboardContent')) {
        console.log("Creating missing dashboardContent element");
        const dashboardContent = document.createElement('div');
        dashboardContent.id = 'dashboardContent';
        dashboardContent.className = 'container';
        document.getElementById('dashboardSection').appendChild(dashboardContent);
    }
    
    // Rest of your existing window.onload code...
    // Clear any stale user data when arriving at login page
    localStorage.removeItem("currentUser");

    // Add SweetAlert library if not already included
    if (!window.Swal) {
        const sweetAlertScript = document.createElement('script');
        sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(sweetAlertScript);
    }

    // Add Leaflet if not already included
    if (typeof L === 'undefined') {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(leafletScript);
    }
    initOperatoriPage();    
    // Add custom styles for maps and markers
    const customStyles = document.createElement('style');
    customStyles.textContent = `
        #perizieMappa, #inspectionMap {
            height: 400px;
            width: 100%;
        }
        
        .marker-pin {
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            position: relative;
            transform: rotate(-45deg);
            margin: -15px 0 0 -15px;
        }
        
        .bg-green { background-color: #28a745; }
        .bg-orange { background-color: #ffc107; }
        .bg-blue { background-color: #3498db; }
        
        .loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 5px;
        }
        
        .map-popup h5 {
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .map-popup p {
            margin-bottom: 4px;
            font-size: 14px;
        }
        
        .avatar-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .avatar-circle {
                width: 28px;
                height: 28px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(customStyles);

    // Verificare che il contenitore perizie-content esista, altrimenti crearlo
    if (!document.getElementById('perizie-content')) {
        const perizieContentDiv = document.createElement('div');
        perizieContentDiv.id = 'perizie-content';
        perizieContentDiv.className = 'container d-none';
        perizieContentDiv.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2>Gestione Perizie</h2>
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-map-marked-alt me-2"></i>Mappa delle perizie
                        </div>
                        <div class="card-body">
                            <div id="perizieMappa" style="height: 400px;"></div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-clipboard-list me-2"></i>Elenco Perizie
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-light text-dark me-2">Totale: <span id="perizieTotali">0</span></span>
                                <span class="badge bg-light text-dark">Visualizzate: <span id="perizieVisualizzate">0</span></span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="selectAllInspections">
                                    <label class="form-check-label" for="selectAllInspections">Seleziona tutti</label>
                                </div>
                                <div>
                                    <button id="assignSelectedInspections" class="btn btn-sm btn-success me-2" disabled>
                                        <i class="fas fa-user-tag me-1"></i>Assegna selezionate (0)
                                    </button>
                                    <button id="deleteSelectedInspections" class="btn btn-sm btn-danger" disabled>
                                        <i class="fas fa-trash me-1"></i>Elimina selezionate (0)
                                    </button>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="headerCheckbox">
                                                </div>
                                            </th>
                                            <th>ID</th>
                                            <th>Operatore</th>
                                            <th>Data</th>
                                            <th>Tipo</th>
                                            <th>Indirizzo</th>
                                            <th>Stato</th>
                                            <th>Foto</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody id="perizieTableBody">
                                        <!-- Dati perizie verranno inseriti qui -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-between align-items-center">
                            <div>
                                Totale perizie: <span id="perizieTotaliFooter">0</span>
                            </div>
                            <nav aria-label="Paginazione perizie">
                                <ul class="pagination mb-0">
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Precedente</a>
                                    </li>
                                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                                    <li class="page-item">
                                        <a class="page-link" href="#">Successiva</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('dashboardSection').appendChild(perizieContentDiv);
    }

    // Login form submit handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;
            login(username, password);
        });
    }

    // Password change form submit handler
    const passwordChangeForm = document.getElementById("passwordChangeForm");
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener("submit", function (e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Fallback per la funzione inviaRichiesta se non esiste
    if (typeof inviaRichiesta !== 'function') {
        window.inviaRichiesta = async function(method, url, parameters = {}) {
            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
            };
            
            if(method.toUpperCase() != "GET") {
                options.body = JSON.stringify(parameters);
            } else if(Object.keys(parameters).length > 0) {
                const queryString = Object.entries(parameters)
                    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                    .join('&');
                url = `${url}?${queryString}`;
            }
            
            const response = await fetch(url, options);
            
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            if(response.headers.get("content-type")?.includes("application/json")) {
                return response.json();
            }
            
            return response.text();
        };
    }

    async function login(username, password) {
        if (!username || !password) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Inserire username e password',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Inserire username e password');
            }
            return;
        }

        try {
            const response = await inviaRichiesta("GET", "/api/login", { username, password });

            if (response && response.length > 0) {
                // Clear any existing user data first
                localStorage.removeItem("currentUser");

                // Store user data in localStorage
                const userData = {
                    username: response[0].username,
                    firstName: response[0].firstName || "",
                    lastName: response[0].lastName || "",
                    fullName: `${response[0].firstName || ""} ${response[0].lastName || ""}`.trim(),
                    role: response[0].role || "user",
                    loginTime: new Date().getTime(),
                    firstLogin: response[0].firstLogin || false
                };

                localStorage.setItem("currentUser", JSON.stringify(userData));

                // Check if it's first login - only show password change if firstLogin is true
                if (userData.firstLogin === true) {
                    console.log("First-time login detected, showing password change form");
                    // Show password change form
                    document.getElementById("loginCard").classList.add("d-none");
                    document.getElementById("passwordChangeCard").classList.remove("d-none");
                } else {
                    console.log("Regular login, proceeding to dashboard");

                    // Hide authentication section and show dashboard
                    document.getElementById("authSection").classList.add("d-none");
                    document.getElementById("dashboardSection").classList.remove("d-none");

                    // Aggiorna le informazioni utente nella navbar
                    updateUserInfoInNavbar(userData);

                    // Load dashboard data
                    loadDashboardData();
                }
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (error) {
            console.error("Errore nel login:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Accesso negato',
                    text: 'Credenziali non valide. Riprova.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Credenziali non valide. Riprova.');
            }
        }
    }

    // Nuova funzione per aggiornare le informazioni utente nella navbar
    function updateUserInfoInNavbar(userData) {
        // Aggiorna le iniziali dell'utente
        const userInitials = document.getElementById('userInitials');
        if (userInitials) {
            userInitials.textContent = userData.firstName.charAt(0) || userData.username.charAt(0);
        }

        // Aggiorna il nome dell'utente
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.textContent = userData.fullName || userData.username;
        }

        // Aggiorna il ruolo dell'utente
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = userData.role === 'admin' ? 'Amministratore' : 'Operatore';
        }

        // Aggiungi funzionalità al pulsante di logout
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", function () {
                localStorage.removeItem("currentUser");
                document.getElementById("dashboardSection").classList.add("d-none");
                document.getElementById("authSection").classList.remove("d-none");
                // Show login card and hide password change card when logging out
                document.getElementById("loginCard").classList.remove("d-none");
                document.getElementById("passwordChangeCard").classList.add("d-none");
            });
        }
    }

    // Function to handle password change for first-time login
    async function changePassword() {
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const passwordChangeError = document.getElementById("passwordChangeError");

        // Clear previous error
        if (passwordChangeError) {
            passwordChangeError.classList.add("d-none");
        }

        // Basic validation
        if (!newPassword || !confirmPassword) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Tutti i campi sono obbligatori";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Tutti i campi sono obbligatori',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Tutti i campi sono obbligatori');
            }
            return;
        }

        if (newPassword !== confirmPassword) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Le password non coincidono";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Le password non coincidono',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Le password non coincidono');
            }
            return;
        }

        // Get current user from localStorage
        const userData = JSON.parse(localStorage.getItem("currentUser"));
        if (!userData || !userData.username) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Sessione scaduta. Effettua di nuovo il login.";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Sessione scaduta. Effettua di nuovo il login.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Sessione scaduta. Effettua di nuovo il login.');
            }
            return;
        }

        // Skip password change if firstLogin is false
        if (userData.firstLogin === false) {
            console.log("Password change skipped, firstLogin is false");

            // Hide authentication section and show dashboard directly
            document.getElementById("authSection").classList.add("d-none");
            document.getElementById("dashboardSection").classList.remove("d-none");

            // Load dashboard data
            loadDashboardData();
            return;
        }

        try {
            // Send request to update password
            const response = await inviaRichiesta("PATCH", "/api/users/password", {
                username: userData.username,
                newPassword: newPassword,
                firstLogin: false
            });

            console.log("Password change response:", response);

            // Update firstLogin status in localStorage
            userData.firstLogin = false;
            localStorage.setItem("currentUser", JSON.stringify(userData));

            // Display user name in dashboard if element exists
            const userDisplayName = document.getElementById("userDisplayName");
            if (userDisplayName) {
                userDisplayName.textContent = userData.fullName || userData.username;
            }

            // Show success message
            if (window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Modificata',
                    text: 'La tua password è stata modificata con successo.',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    // Hide authentication section and show dashboard
                    document.getElementById("authSection").classList.add("d-none");
                    document.getElementById("dashboardSection").classList.remove("d-none");

                    // Aggiorna le informazioni utente nella navbar
                    updateUserInfoInNavbar(userData);

                    // Load dashboard data
                    loadDashboardData();
                });
            } else {
                alert('La tua password è stata modificata con successo.');
                // Hide authentication section and show dashboard
                document.getElementById("authSection").classList.add("d-none");
                document.getElementById("dashboardSection").classList.remove("d-none");

                // Aggiorna le informazioni utente nella navbar
                updateUserInfoInNavbar(userData);

                // Load dashboard data
                loadDashboardData();
            }
        } catch (error) {
            console.error("Errore nella modifica della password:", error);
            if (passwordChangeError) {
                passwordChangeError.textContent = "Impossibile modificare la password. Riprova.";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile modificare la password. Riprova.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile modificare la password. Riprova.');
            }
        }
    }

    // Add logout functionality
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            document.getElementById("dashboardSection").classList.add("d-none");
            document.getElementById("authSection").classList.remove("d-none");
            // Show login card and hide password change card when logging out
            document.getElementById("loginCard").classList.remove("d-none");
            document.getElementById("passwordChangeCard").classList.add("d-none");
        });
    }

    // Aggiungi gestione dei click sui link della navbar per mostrare le sezioni appropriate
    initNavbarListeners();

    // Function to initialize the navbar links
    function initNavbarListeners() {
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                // Rimuovi la classe active da tutti i link
                navLinks.forEach(l => l.classList.remove("active"));

                // Aggiungi la classe active a questo link
                this.classList.add("active");

                // Ottieni l'ID della sezione da mostrare
                const targetId = this.getAttribute("href").substring(1);

                // Nascondi tutte le sezioni
                document.getElementById("dashboardContent")?.classList.add("d-none");
                document.getElementById("operatori-content")?.classList.add("d-none");
                document.getElementById("perizie-content")?.classList.add("d-none");

                // Mostra la sezione appropriata
                if (targetId === "dashboard") {
                    const dashboardContent = document.getElementById("dashboardContent");
                    if (dashboardContent) {
                        dashboardContent.classList.remove("d-none");
                        // Ricarica i dati della dashboard se necessario
                        updateDashboardStatistics(window.perizie || []);
                        loadRecentPerizieDashboard(window.perizie || []);
                    }
                } else if (targetId === "operatori") {
                    document.getElementById("operatori-content")?.classList.remove("d-none");
                    // Carica i dati degli operatori
                    initOperatoriPage();
                } else if (targetId === "perizie") {
                    const perizieContent = document.getElementById("perizie-content");
                    if (perizieContent) {
                        perizieContent.classList.remove("d-none");
                        // Assicuriamoci che inizializziamo la sezione perizie
                        initPeriziePage();
                    }
                }
            });
        });
    }

    // Function to load dashboard data
    async function loadDashboardData() {
        console.log("Loading dashboard data...");
        try {
            await loadPerizie();
            initDashboardMap();
        } catch (error) {
            console.error("Errore nel caricamento della dashboard:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Si è verificato un errore nel caricamento dei dati della dashboard',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Si è verificato un errore nel caricamento dei dati della dashboard');
            }
        }
    }

    // Funzione per caricare le perizie dal server MongoDB
    async function loadPerizie() {
        console.log("Caricamento perizie dal server...");

        try {
            // Invia richiesta al server utilizzando la funzione esistente
            const response = await inviaRichiesta("GET", "/api/perizie");

            console.log("Risposta del server:", response);

            // Verifica che la risposta sia un array o un oggetto con dati
            if (Array.isArray(response)) {
                window.perizie = response;
            } else if (response && response.data) {
                window.perizie = response.data;
            } else if (response && typeof response === 'object') {
                window.perizie = [response]; // Converti oggetto singolo in array
            } else {
                throw new Error("Formato risposta non valido");
            }

            console.log(`Caricate ${window.perizie.length} perizie`);

            // Se siamo nella dashboard, aggiorna le statistiche
            if (document.getElementById('dashboardContent') &&
                !document.getElementById('dashboardContent').classList.contains('d-none')) {
                updateDashboardStatistics(window.perizie);
                loadRecentPerizieDashboard(window.perizie);
            }

            return window.perizie;
        } catch (error) {
            console.error("Errore nel caricamento delle perizie:", error);

            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile caricare i dati delle perizie dal server',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile caricare i dati delle perizie dal server');
            }

            // Inizializza con array vuoto per evitare errori
            window.perizie = [];
            return [];
        }
    }

    // Funzione per aggiornare le statistiche nella dashboard
    function updateDashboardStatistics(perizie) {
        // Totale perizie
        const totalElement = document.getElementById("totalInspections");
        if (totalElement) totalElement.textContent = perizie.length;

        // Operatori attivi (conteggio unico degli operatori)
        const operatoriUnici = [...new Set(perizie.map(p => p.operatoreId))].filter(Boolean);
        const activeElement = document.getElementById("activeUsers");
        if (activeElement) activeElement.textContent = operatoriUnici.length;

        // Totale foto
        const totaleFoto = perizie.reduce((acc, p) => {
            return acc + (p.fotografie ? p.fotografie.length : 0);
        }, 0);
        const photosElement = document.getElementById("totalPhotos");
        if (photosElement) photosElement.textContent = totaleFoto;
    }

    // Funzione per caricare le perizie recenti nella dashboard
    function loadRecentPerizieDashboard(perizie) {
        const tableBody = document.getElementById("inspectionTableBody");
        if (!tableBody) return;

        // Svuota la tabella
        tableBody.innerHTML = '';

        // Ordina le perizie per data più recenti prima
        const recentPerizie = [...perizie]
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 5); // Prendi solo le prime 5

        recentPerizie.forEach(perizia => {
            const row = document.createElement('tr');

            // Formatta la data in formato italiano
            const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Calcola il numero di foto
            const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;

            // Abbrevia la descrizione se troppo lunga
            const shortDesc = perizia.descrizione && perizia.descrizione.length > 30
                ? perizia.descrizione.substring(0, 30) + '...'
                : (perizia.descrizione || 'N/D');

            row.innerHTML = `
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo.split(',')[0] : 'N/D'}</td>
                <td>${shortDesc}</td>
                <td>${numFoto}</td>
                <td>
                    <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}"><i class="fas fa-edit"></i></button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Aggiungi listener agli elementi appena creati
        document.querySelectorAll('.view-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                viewPerizia(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.edit-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                editPerizia(this.getAttribute('data-id'));
            });
        });
    }

    // Funzione per inizializzare la mappa nella dashboard
    function initDashboardMap() {
        if (!window.perizie || typeof L === 'undefined') {
            console.log("Leaflet non disponibile o nessuna perizia da visualizzare");
            return;
        }

        const mapContainer = document.getElementById('inspectionMap');
        if (!mapContainer) {
            console.log("Container mappa dashboard non trovato");
            return;
        }

        console.log("Inizializzazione mappa dashboard");

        try {
            // Inizializza la mappa
            const map = L.map('inspectionMap').setView([41.9028, 12.4964], 6); // Centro su Italia

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Aggiungi marker per ogni perizia
            const markers = [];

            window.perizie.forEach(perizia => {
                if (perizia.posizione && perizia.posizione.lat && perizia.posizione.lng) {
                    // Crea il marker
                    const marker = L.marker([perizia.posizione.lat, perizia.posizione.lng]).addTo(map);
                    markers.push(marker);

                    // Aggiungi popup con informazioni
                    marker.bindPopup(`
                        <strong>${perizia.id}</strong><br>
                        ${perizia.tipo ? (perizia.tipo.charAt(0).toUpperCase() + perizia.tipo.slice(1)) : 'N/D'}, 
                        ${perizia.posizione.indirizzo || 'Indirizzo non disponibile'}<br>
                        <strong>Operatore:</strong> ${perizia.operatore || 'N/D'}<br>
                        <button class="btn btn-sm btn-primary mt-2 view-perizia-map" data-id="${perizia.id}">Dettagli</button>
                    `);
                }
            });

            // Se ci sono marker, adatta la vista per mostrarli tutti
            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }

            // Aggiungi listener per i pulsanti nei popup
            map.on('popupopen', function (e) {
                document.querySelectorAll('.view-perizia-map').forEach(btn => {
                    btn.addEventListener('click', function () {
                        viewPerizia(this.getAttribute('data-id'));
                    });
                });
            });

            // Aggiorna le dimensioni della mappa (importante per quando la mappa è in un tab)
            setTimeout(() => map.invalidateSize(), 100);

        } catch (error) {
            console.error("Errore nell'inizializzazione della mappa dashboard:", error);
            mapContainer.innerHTML = '<div class="alert alert-danger">Errore nel caricamento della mappa</div>';
        }
    }

    // Helpers per funzionalità relative alle perizie
    function viewPerizia(id) {
        if (!window.perizie) return;

        const perizia = window.perizie.find(p => p.id === id);
        if (!perizia) {
            console.error(`Perizia con ID ${id} non trovata`);
            return;
        }

        // Formatta la data in formato italiano
        const formattedDate = new Date(perizia.data).toLocaleString('it-IT');

        // Prepara galleria di foto se presenti
        let fotoHtml = "<p>Nessuna foto disponibile</p>";
        if (perizia.fotografie && perizia.fotografie.length > 0) {
            fotoHtml = `
                <div class="row">
                    ${perizia.fotografie.map((foto, index) => `
                        <div class="col-md-4 mb-3">
                            <img src="${foto.url}" class="img-fluid img-thumbnail" alt="Foto ${index + 1}" onerror="this.src='https://via.placeholder.com/300x200?text=Anteprima+non+disponibile'">
                            <p class="small mt-1">${foto.commento || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Visualizza la modal con i dettagli della perizia
        if (window.Swal) {
            Swal.fire({
                title: `Perizia ${perizia.id}`,
                html: `
                    <div class="text-start">
                        <p><strong>Tipo:</strong> ${perizia.tipo ? (perizia.tipo.charAt(0).toUpperCase() + perizia.tipo.slice(1)) : 'N/D'}</p>
                        <p><strong>Operatore:</strong> ${perizia.operatore || 'N/D'} ${perizia.operatoreId ? `(ID: ${perizia.operatoreId})` : ''}</p>
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Indirizzo:</strong> ${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</p>
                        <p><strong>Coordinate:</strong> ${perizia.posizione ? `${perizia.posizione.lat || 'N/D'}, ${perizia.posizione.lng || 'N/D'}` : 'N/D'}</p>
                        <p><strong>Descrizione:</strong> ${perizia.descrizione || 'N/D'}</p>
                        <p><strong>Cliente:</strong> ${perizia.cliente ? `${perizia.cliente.nome || 'N/D'} (${perizia.cliente.contatto || 'N/D'})` : 'N/D'}</p>
                        <p><strong>Polizza:</strong> ${perizia.polizza || 'N/D'}</p>
                        <h5 class="mt-4">Fotografie (${perizia.fotografie ? perizia.fotografie.length : 0})</h5>
                        ${fotoHtml}
                    </div>
                `,
                width: 800,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Chiudi'
            });
        } else {
            alert(`Perizia ${perizia.id} - Per visualizzare tutti i dettagli, assicurati che SweetAlert2 sia caricato.`);
        }
    }

    function isUserAdmin() {
        const userData = JSON.parse(localStorage.getItem("currentUser"));
        return userData && userData.role === 'admin';
    }

    // Funzione per verificare i permessi prima di eseguire un'azione riservata agli admin
    function checkAdminPermission() {
        if (!isUserAdmin()) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Permesso negato',
                    text: 'Questa operazione può essere eseguita solo da un amministratore',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Permesso negato. Questa operazione può essere eseguita solo da un amministratore');
            }
            return false;
        }
        return true;
    }

    // Funzione per modificare una perizia
    function editPerizia(id) {
        if (!checkAdminPermission()) {
            return;
        }

        // Trova la perizia corrente
        const perizia = window.perizie.find(p => p.id === id);
        if (!perizia) {
            console.error(`Perizia con ID ${id} non trovata`);
            return;
        }

        // Crea il form per la modifica
        const formHtml = `
            <form id="editPeriziaForm" class="text-start">
                <div class="mb-3">
                    <label for="editTipo" class="form-label">Tipo perizia</label>
                    <select class="form-select" id="editTipo" required>
                        <option value="incendio" ${perizia.tipo === 'incendio' ? 'selected' : ''}>Incendio</option>
                        <option value="allagamento" ${perizia.tipo === 'allagamento' ? 'selected' : ''}>Allagamento</option>
                        <option value="furto" ${perizia.tipo === 'furto' ? 'selected' : ''}>Furto</option>
                        <option value="grandine" ${perizia.tipo === 'grandine' ? 'selected' : ''}>Grandine</option>
                        <option value="altro" ${!['incendio', 'allagamento', 'furto', 'grandine'].includes(perizia.tipo) ? 'selected' : ''}>Altro</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="editOperatore" class="form-label">Operatore</label>
                    <input type="text" class="form-control" id="editOperatore" value="${perizia.operatore || ''}" required>
                </div>
                <div class="mb-3">
                    <label for="editData" class="form-label">Data</label>
                    <input type="datetime-local" class="form-control" id="editData" value="${new Date(perizia.data).toISOString().slice(0, 16)}" required>
                </div>
                <div class="mb-3">
                    <label for="editDescrizione" class="form-label">Descrizione</label>
                    <textarea class="form-control" id="editDescrizione" rows="3" required>${perizia.descrizione || ''}</textarea>
                </div>
                <div class="mb-3">
                    <label for="editIndirizzo" class="form-label">Indirizzo</label>
                    <input type="text" class="form-control" id="editIndirizzo" value="${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : ''}" required>
                </div>
                <div class="mb-3">
                    <label for="editStato" class="form-label">Stato</label>
                    <select class="form-select" id="editStato" required>
                        <option value="scheduled" ${perizia.stato === 'scheduled' ? 'selected' : ''}>Pianificata</option>
                        <option value="in_progress" ${perizia.stato === 'in_progress' ? 'selected' : ''}>In corso</option>
                        <option value="pending" ${perizia.stato === 'pending' ? 'selected' : ''}>In attesa</option>
                        <option value="completed" ${perizia.stato === 'completed' ? 'selected' : ''}>Completata</option>
                    </select>
                </div>
            </form>
        `;

        if (window.Swal) {
            Swal.fire({
                title: `Modifica Perizia ${perizia.id}`,
                html: formHtml,
                width: 800,
                showCancelButton: true,
                confirmButtonText: 'Salva Modifiche',
                cancelButtonText: 'Annulla',
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#dc3545',
                preConfirm: () => {
                    // Raccolta dati dal form
                    const updateData = {
                        tipo: document.getElementById('editTipo').value,
                        operatore: document.getElementById('editOperatore').value,
                        data: new Date(document.getElementById('editData').value).toISOString(),
                        descrizione: document.getElementById('editDescrizione').value,
                        stato: document.getElementById('editStato').value,
                        'posizione.indirizzo': document.getElementById('editIndirizzo').value
                    };

                    return { updateData };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    updatePerizia(id, result.value.updateData);
                }
            });
        } else {
            alert(`Modifica della perizia ${id} non disponibile. Verifica che SweetAlert2 sia caricato.`);
        }
    }

    // Set up event listeners for the navigation links
    const perizieNavLink = document.querySelector('a[href="#perizie"]');
    if (perizieNavLink) {
        console.log("Trovato link perizie, aggiungo event listener");
        perizieNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Click su link perizie");

            // Verifica esistenza elementi necessari
            const dashboardContent = document.getElementById('dashboardContent');
            const gestioneUtentiContent = document.getElementById('gestione-utenti-content');
            const perizieContent = document.getElementById('perizie-content');

            if (!perizieContent) {
                console.error("Elemento perizie-content non trovato");
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: 'Sezione perizie non disponibile',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('Sezione perizie non disponibile');
                }
                return;
            }

            // Nascondi altri contenuti e mostra sezione perizie
            if (dashboardContent) dashboardContent.classList.add('d-none');
            if (gestioneUtentiContent) gestioneUtentiContent.classList.add('d-none');
            perizieContent.classList.remove('d-none');

            // Carica dati perizie se non già caricato
            initPeriziePage();
        });
    } else {
        console.warn("Link perizie non trovato nel DOM");
    }

    const operatoriNavLink = document.querySelector('a[href="#operatori"]');
    if (operatoriNavLink) {
        console.log("Trovato link operatori, aggiungo event listener");
        operatoriNavLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log("Click su link operatori");

            // Nascondi altri contenuti
            const dashboardContent = document.getElementById('dashboardContent');
            const perizieContent = document.getElementById('perizie-content');

            if (dashboardContent) dashboardContent.classList.add('d-none');
            if (perizieContent) perizieContent.classList.add('d-none');

            // Inizializza la sezione operatori
            initOperatoriPage();
        });
    } else {
        console.warn("Link operatori non trovato nel DOM");
    }

    // Funzioni per la sezione perizie
    async function initPeriziePage() {
        console.log("Inizializzazione sezione perizie");

        // Assicurati che il container perizie-content sia visibile
        const perizieContent = document.getElementById('perizie-content');
        if (perizieContent) {
            perizieContent.classList.remove('d-none');
        } else {
            console.error("Container perizie-content non trovato");
            return;
        }

        // Implementazione della funzione setupPerizieButtons
        setupPerizieButtons();

        // Carica le perizie se non sono state già caricate
        if (!window.perizie) {
            try {
                await loadPerizie();
            } catch (error) {
                console.error("Errore nel caricamento perizie:", error);
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: 'Impossibile caricare le perizie',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('Impossibile caricare le perizie');
                }
                return;
            }
        }

        // Verifica che perizie sia stato caricato correttamente
        if (!window.perizie || !Array.isArray(window.perizie)) {
            console.error("Perizie non caricate correttamente:", window.perizie);
            window.perizie = [];
        }

        console.log("Perizie caricate, inizializzazione mappa");

        // Inizializza la mappa delle perizie
        initPerizieMappa();

        // Prima controlla che la tabella esista
        const tableExists = document.querySelector('#perizie-content table');
        if (!tableExists) {
            console.log("Tabella perizie non trovata, creazione...");
            createPerizieTable();
        }

        // Carica la tabella delle perizie
        console.log("Caricamento tabella perizie...");
        loadPerizieTable();

        // Aggiorna i contatori
        updatePerizieCounts();

        // Inizializza i filtri con gli operatori disponibili
        populateOperatorFilter();

        // Inizializza i listener per i filtri
        initFilterListeners();
    }

    // Nuova funzione per creare la tabella delle perizie se non esiste
    function createPerizieTable() {
        const perizieContent = document.getElementById('perizie-content');
        if (!perizieContent) return;

        const cardBody = perizieContent.querySelector('.card-body');
        if (!cardBody) {
            console.error("Card body not found in perizie-content");
            return;
        }

        const tableResponsive = document.createElement('div');
        tableResponsive.className = 'table-responsive';

        tableResponsive.innerHTML = `
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Operatore</th>
                        <th>Data</th>
                        <th>Tipo</th>
                        <th>Indirizzo</th>
                        <th>Stato</th>
                        <th>Foto</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody id="perizieTableBody">
                    <!-- Dati perizie verranno inseriti qui -->
                </tbody>
            </table>
        `;

        cardBody.appendChild(tableResponsive);
    }

    // Funzione per inizializzare la mappa delle perizie
    function initPerizieMappa() {
        console.log("Inizializzazione mappa perizie");

        // Verifica che Leaflet sia caricato e che il container della mappa esista
        if (typeof L === 'undefined') {
            console.error("Leaflet non è disponibile");
            return;
        }

        const mappaContainer = document.getElementById('perizieMappa');
        if (!mappaContainer) {
            console.error("Container mappa non esiste nel DOM");
            return;
        }

        // Verifica che perizie siano caricate
        if (!window.perizie || window.perizie.length === 0) {
            console.warn("Nessuna perizia disponibile per la mappa");
            mappaContainer.innerHTML = '<div class="alert alert-info">Nessuna perizia disponibile</div>';
            return;
        }

        console.log(`Inizializzazione mappa con ${window.perizie.length} perizie`);

        try {
            // Elimina la mappa esistente se presente
            if (window.perizieMap) {
                window.perizieMap.remove();
            }

            // Centro Italia come posizione di default
            const italyCoords = [41.9028, 12.4964];

            // Inizializza la mappa
            window.perizieMap = L.map('perizieMappa').setView(italyCoords, 6);

            // Aggiungi il layer di OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(window.perizieMap);

            // Aggiorna le dimensioni della mappa
            setTimeout(() => {
                if (window.perizieMap) {
                    window.perizieMap.invalidateSize();
                }
            }, 300);

            // Aggiungi marker per ogni perizia
            const markers = [];
            const showOnlyActiveCheckbox = document.getElementById('showOnlyActiveInspections');
            const showOnlyActive = showOnlyActiveCheckbox ? showOnlyActiveCheckbox.checked : false;

            window.perizie.forEach(perizia => {
                // Se l'opzione "solo perizie attive" è selezionata, filtra per stato
                if (showOnlyActive && perizia.stato !== 'pending' && perizia.stato !== 'in_progress') {
                    return;
                }

                // Verifica che la perizia abbia coordinate valide
                if (perizia.posizione && perizia.posizione.lat && perizia.posizione.lng) {
                    // Crea il marker
                    const marker = L.marker([perizia.posizione.lat, perizia.posizione.lng]).addTo(window.perizieMap);

                    // Aggiungi popup con informazioni
                    marker.bindPopup(`
                        <div class="map-popup">
                            <h5>${perizia.id}</h5>
                            <p><strong>Operatore:</strong> ${perizia.operatore || 'N/D'}</p>
                            <p><strong>Indirizzo:</strong> ${perizia.posizione.indirizzo || 'N/D'}</p>
                            <div class="text-center mt-2">
                                <button class="btn btn-sm btn-primary view-perizia-map" data-id="${perizia.id}">
                                    <i class="fas fa-eye me-1"></i> Dettagli
                                </button>
                            </div>
                        </div>
                    `);

                    markers.push(marker);
                }
            });

            // Se ci sono marker, adatta la vista per mostrarli tutti
            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                window.perizieMap.fitBounds(group.getBounds(), { padding: [50, 50] });
            }

            // Aggiungi listener per la vista dei dettagli della perizia
            window.perizieMap.on('popupopen', function () {
                document.querySelectorAll('.view-perizia-map').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const periziaId = this.getAttribute('data-id');
                        viewPerizia(periziaId);
                    });
                });
            });
        } catch (error) {
            console.error("Errore nell'inizializzazione della mappa:", error);
            mappaContainer.innerHTML = `
                <div class="alert alert-danger">
                    Errore nell'inizializzazione della mappa: ${error.message}
                </div>
            `;
        }
    }

    // Funzione per aggiornare i contatori delle perizie
    function updatePerizieCounts() {
        if (!window.perizie) return;

        const totalElement = document.getElementById('perizieTotali');
        const totalFooterElement = document.getElementById('perizieTotaliFooter');
        const visualizzateElement = document.getElementById('perizieVisualizzate');

        if (totalElement) totalElement.textContent = window.perizie.length;
        if (totalFooterElement) totalFooterElement.textContent = window.perizie.length;
        if (visualizzateElement) visualizzateElement.textContent = window.perizie.length;
    }

    // Funzione per popolare i filtri degli operatori
    function populateOperatorFilter() {
        if (!window.perizie) return;

        const filterSelect = document.getElementById('filterOperator');
        if (!filterSelect) return;

        // Svuota il select tranne l'opzione "Tutti gli operatori"
        while (filterSelect.options.length > 1) {
            filterSelect.remove(1);
        }

        // Estrai operatori unici
        const operatori = [...new Set(window.perizie
            .map(p => p.operatore)
            .filter(Boolean)
        )];

        // Aggiungi le opzioni
        operatori.forEach(operatore => {
            const option = document.createElement('option');
            option.value = operatore;
            option.textContent = operatore;
            filterSelect.appendChild(option);
        });
    }

    // Funzione per impostare i listener dei filtri
    function initFilterListeners() {
        const applyFilters = document.getElementById('applyFilters');
        const resetFilters = document.getElementById('resetFilters');

        if (applyFilters) {
            applyFilters.addEventListener('click', function () {
                applyFiltersToPerizie();
            });
        }

        if (resetFilters) {
            resetFilters.addEventListener('click', function () {
                // Reset filtri
                const filterOperator = document.getElementById('filterOperator');
                const filterDate = document.getElementById('filterDate');
                if (filterOperator) filterOperator.value = '';
                if (filterDate) filterDate.value = '';

                // Ricarica tutte le perizie
                loadPerizieTable();
            });
        }
    }

    // Funzione per applicare i filtri alle perizie
    function applyFiltersToPerizie() {
        if (!window.perizie) return;

        const filterOperator = document.getElementById('filterOperator');
        const filterDate = document.getElementById('filterDate');

        let filteredPerizie = [...window.perizie];

        // Filtra per operatore se selezionato
        if (filterOperator && filterOperator.value) {
            filteredPerizie = filteredPerizie.filter(p =>
                p.operatore && p.operatore.includes(filterOperator.value)
            );
        }

        // Filtra per data se selezionata
        if (filterDate && filterDate.value) {
            const selectedDate = new Date(filterDate.value);
            selectedDate.setHours(0, 0, 0, 0);

            filteredPerizie = filteredPerizie.filter(p => {
                if (!p.data) return false;
                const periziaDate = new Date(p.data);
                periziaDate.setHours(0, 0, 0, 0);
                return periziaDate.getTime() === selectedDate.getTime();
            });
        }

        // Aggiorna il contatore delle visualizzate
        const visualizzateElement = document.getElementById('perizieVisualizzate');
        if (visualizzateElement) {
            visualizzateElement.textContent = filteredPerizie.length;
        }

        // Carica la tabella con le perizie filtrate
        loadPerizieTable(filteredPerizie);
    }

    // Funzione per caricare la tabella delle perizie, modificata per accettare perizie filtrate
    function loadPerizieTable(filteredPerizie = null) {
        console.log("Caricamento tabella perizie...");

        // Trova il tbody della tabella
        const tableBody = document.getElementById('perizieTableBody');
        if (!tableBody) {
            console.error("Elemento perizieTableBody non trovato");
            return;
        }

        // Svuota la tabella
        tableBody.innerHTML = '';

        // Usa le perizie filtrate o tutte se non specificate
        const perizie = filteredPerizie || window.perizie;

        // Verifica che perizie siano caricate
        if (!perizie || perizie.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-3">Nessuna perizia disponibile</td>
                </tr>
            `;
            return;
        }

        // Crea una copia delle perizie da ordinare
        const sortedPerizie = [...perizie].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        // Popola la tabella
        sortedPerizie.forEach(perizia => {
            const row = document.createElement('tr');

            // Formatta la data
            const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Determina il badge di stato
            let statusBadge = '<span class="badge bg-primary">Pianificata</span>';
            if (perizia.stato === 'completed') {
                statusBadge = '<span class="badge bg-success">Completata</span>';
            } else if (perizia.stato === 'pending') {
                statusBadge = '<span class="badge bg-warning text-dark">In attesa</span>';
            } else if (perizia.stato === 'in_progress') {
                statusBadge = '<span class="badge bg-warning text-dark">In corso</span>';
            }

            // Conta foto
            const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;

            row.innerHTML = `
                <td>
                    <div class="form-check">
                        <input class="form-check-input inspection-select" type="checkbox" data-id="${perizia.id}">
                    </div>
                </td>
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.tipo || 'N/D'}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</td>
                <td>${statusBadge}</td>
                <td>${numFoto}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-inspection" data-id="${perizia.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Aggiungi listener alle azioni
        document.querySelectorAll('.view-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                viewPerizia(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.edit-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                editPerizia(this.getAttribute('data-id'));
            });
        });

        // Modifica il listener del pulsante di eliminazione singola perizia
        document.querySelectorAll('.delete-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                // Ottieni l'ID della perizia da eliminare
                const periziaId = this.getAttribute('data-id');

                // Chiama la funzione deletePerizia
                deletePerizia(periziaId);
            });
        });

        // Aggiungi listener alle checkbox
        document.querySelectorAll('.inspection-select').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                // Aggiorna il conteggio quando una checkbox cambia stato
                updateSelectedCount();

                // Controlla se tutte le checkbox sono selezionate
                const allCheckboxes = document.querySelectorAll('.inspection-select');
                const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);

                // Aggiorna il checkbox "seleziona tutti"
                const selectAllCheckbox = document.getElementById('selectAllInspections');
                const headerCheckbox = document.getElementById('headerCheckbox');

                if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
                if (headerCheckbox) headerCheckbox.checked = allChecked;
            });
        });
    }

    // Funzione per eliminare perizie dal database
    window.deletePerizieByIds = async function(ids) {
        try {
            const response = await inviaRichiesta("DELETE", "/api/perizie", { ids });
            if (response && response.success) {
                // Ricarica le perizie dopo l'eliminazione
                await loadPerizie();
                loadPerizieTable();
                updatePerizieCounts();

                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminazione completata',
                        text: 'Perizie eliminate con successo',
                        confirmButtonColor: '#3085d6'
                    });
                }
            }
        } catch (error) {
            console.error("Errore nell'eliminazione delle perizie:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `Impossibile eliminare le perizie: ${error.message}`,
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert(`Impossibile eliminare le perizie: ${error.message}`);
            }
        }
    }

    // Funzione per gestire i bottoni delle perizie
    function setupPerizieButtons() {
        // Gestione bottone per assegnare perizie selezionate
        const assignBtn = document.getElementById('assignSelectedInspections');
        if (assignBtn) {
            assignBtn.addEventListener('click', function () {
                assignSelectedPerizie();
            });
        }

        // Gestione bottone per eliminare perizie selezionate
        const deleteBtn = document.getElementById('deleteSelectedInspections');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function () {
                deleteSelectedPerizie();
            });
        }

        // Gestione checkbox "seleziona tutti"
        const selectAllCheckbox = document.getElementById('selectAllInspections');
        const headerCheckbox = document.getElementById('headerCheckbox');

        if (selectAllCheckbox && headerCheckbox) {
            // Assicurati che entrambi i checkbox si comportino allo stesso modo
            selectAllCheckbox.addEventListener('change', function () {
                headerCheckbox.checked = this.checked;
                toggleAllCheckboxes(this.checked);
            });

        headerCheckbox.addEventListener('change', function () {
            selectAllCheckbox.checked = this.checked;
            toggleAllCheckboxes(this.checked);
        });
    }
}

// Function to toggle all checkboxes
function toggleAllCheckboxes(checked) {
    document.querySelectorAll('.inspection-select').forEach(checkbox => {
        checkbox.checked = checked;
    });
    updateSelectedCount();
}

        const sweetAlertScript = document.createElement('script');
        sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
        document.head.appendChild(sweetAlertScript);
    }

    // Add Leaflet if not already included
    if (typeof L === 'undefined') {
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        const leafletScript = document.createElement('script');
        leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(leafletScript);
    }

    // Add custom styles for maps and markers
    const customStyles = document.createElement('style');
    customStyles.textContent = `
        #perizieMappa, #inspectionMap {
            height: 400px;
            width: 100%;
        }
        
        .marker-pin {
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            position: relative;
            transform: rotate(-45deg);
            margin: -15px 0 0 -15px;
        }
        
        .bg-green { background-color: #28a745; }
        .bg-orange { background-color: #ffc107; }
        .bg-blue { background-color: #3498db; }
        
        .loading-spinner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background-color: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 5px;
        }
        
        .map-popup h5 {
            font-size: 16px;
            margin-bottom: 8px;
        }
        
        .map-popup p {
            margin-bottom: 4px;
            font-size: 14px;
        }
        
        .avatar-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .avatar-circle {
                width: 28px;
                height: 28px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(customStyles);

    // Verificare che il contenitore perizie-content esista, altrimenti crearlo
    if (!document.getElementById('perizie-content')) {
        const perizieContentDiv = document.createElement('div');
        perizieContentDiv.id = 'perizie-content';
        perizieContentDiv.className = 'container d-none';
        perizieContentDiv.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2>Gestione Perizie</h2>
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <i class="fas fa-map-marked-alt me-2"></i>Mappa delle perizie
                        </div>
                        <div class="card-body">
                            <div id="perizieMappa" style="height: 400px;"></div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-clipboard-list me-2"></i>Elenco Perizie
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="badge bg-light text-dark me-2">Totale: <span id="perizieTotali">0</span></span>
                                <span class="badge bg-light text-dark">Visualizzate: <span id="perizieVisualizzate">0</span></span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="selectAllInspections">
                                    <label class="form-check-label" for="selectAllInspections">Seleziona tutti</label>
                                </div>
                                <div>
                                    <button id="assignSelectedInspections" class="btn btn-sm btn-success me-2" disabled>
                                        <i class="fas fa-user-tag me-1"></i>Assegna selezionate (0)
                                    </button>
                                    <button id="deleteSelectedInspections" class="btn btn-sm btn-danger" disabled>
                                        <i class="fas fa-trash me-1"></i>Elimina selezionate (0)
                                    </button>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="headerCheckbox">
                                                </div>
                                            </th>
                                            <th>ID</th>
                                            <th>Operatore</th>
                                            <th>Data</th>
                                            <th>Tipo</th>
                                            <th>Indirizzo</th>
                                            <th>Stato</th>
                                            <th>Foto</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody id="perizieTableBody">
                                        <!-- Dati perizie verranno inseriti qui -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card-footer d-flex justify-content-between align-items-center">
                            <div>
                                Totale perizie: <span id="perizieTotaliFooter">0</span>
                            </div>
                            <nav aria-label="Paginazione perizie">
                                <ul class="pagination mb-0">
                                    <li class="page-item disabled">
                                        <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Precedente</a>
                                    </li>
                                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                                    <li class="page-item">
                                        <a class="page-link" href="#">Successiva</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            dashboardSection.appendChild(perizieContentDiv);
        } else {
            console.error("dashboardSection element not found - add it to your HTML");
            // Create dashboardSection if it doesn't exist
            const dashboardSectionDiv = document.createElement('div');
            dashboardSectionDiv.id = 'dashboardSection';
            document.body.appendChild(dashboardSectionDiv);
            dashboardSectionDiv.appendChild(perizieContentDiv);
        }
    }
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        dashboardSection.appendChild(perizieContentDiv);
    } else {
        console.error("dashboardSection element not found in the DOM");
    }
    // Login form submit handler
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = document.getElementById("loginUsername").value;
            const password = document.getElementById("loginPassword").value;
            login(username, password);
        });
    }

    // Password change form submit handler
    const passwordChangeForm = document.getElementById("passwordChangeForm");
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener("submit", function (e) {
            e.preventDefault();
            changePassword();
        });
    }

    // Fallback per la funzione inviaRichiesta se non esiste
    if (typeof inviaRichiesta !== 'function') {
        window.inviaRichiesta = async function(method, url, parameters = {}) {
            let options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
            };
            
            if(method.toUpperCase() != "GET") {
                options.body = JSON.stringify(parameters);
            } else if(Object.keys(parameters).length > 0) {
                const queryString = Object.entries(parameters)
                    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                    .join('&');
                url = `${url}?${queryString}`;
            }
            
            const response = await fetch(url, options);
            
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            if(response.headers.get("content-type")?.includes("application/json")) {
                return response.json();
            }
            
            return response.text();
        };
    }

    async function login(username, password) {
        if (!username || !password) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Inserire username e password',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Inserire username e password');
            }
            return;
        }

        try {
            const response = await inviaRichiesta("GET", "/api/login", { username, password });

            if (response && response.length > 0) {
                // Clear any existing user data first
                localStorage.removeItem("currentUser");

                // Store user data in localStorage
                const userData = {
                    username: response[0].username,
                    firstName: response[0].firstName || "",
                    lastName: response[0].lastName || "",
                    fullName: `${response[0].firstName || ""} ${response[0].lastName || ""}`.trim(),
                    role: response[0].role || "user",
                    loginTime: new Date().getTime(),
                    firstLogin: response[0].firstLogin || false
                };

                localStorage.setItem("currentUser", JSON.stringify(userData));

                // Check if it's first login - only show password change if firstLogin is true
                if (userData.firstLogin === true) {
                    console.log("First-time login detected, showing password change form");
                    // Show password change form
                    document.getElementById("loginCard").classList.add("d-none");
                    document.getElementById("passwordChangeCard").classList.remove("d-none");
                } else {
                    console.log("Regular login, proceeding to dashboard");

                    // Hide authentication section and show dashboard
                    document.getElementById("authSection").classList.add("d-none");
                    document.getElementById("dashboardSection").classList.remove("d-none");

                    // Aggiorna le informazioni utente nella navbar
                    updateUserInfoInNavbar(userData);

                    // Load dashboard data
                    loadDashboardData();
                }
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (error) {
            console.error("Errore nel login:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Accesso negato',
                    text: 'Credenziali non valide. Riprova.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Credenziali non valide. Riprova.');
            }
        }
    }

    // Nuova funzione per aggiornare le informazioni utente nella navbar
    function updateUserInfoInNavbar(userData) {
        // Aggiorna le iniziali dell'utente
        const userInitials = document.getElementById('userInitials');
        if (userInitials) {
            userInitials.textContent = userData.firstName.charAt(0) || userData.username.charAt(0);
        }

        // Aggiorna il nome dell'utente
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
            userDisplayName.textContent = userData.fullName || userData.username;
        }

        // Aggiorna il ruolo dell'utente
        const userRole = document.getElementById('userRole');
        if (userRole) {
            userRole.textContent = userData.role === 'admin' ? 'Amministratore' : 'Operatore';
        }

        // Aggiungi funzionalità al pulsante di logout
        const btnLogout = document.getElementById("btnLogout");
        if (btnLogout) {
            btnLogout.addEventListener("click", function () {
                localStorage.removeItem("currentUser");
                document.getElementById("dashboardSection").classList.add("d-none");
                document.getElementById("authSection").classList.remove("d-none");
                // Show login card and hide password change card when logging out
                document.getElementById("loginCard").classList.remove("d-none");
                document.getElementById("passwordChangeCard").classList.add("d-none");
            });
        }
    }

    // Function to handle password change for first-time login
    async function changePassword() {
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const passwordChangeError = document.getElementById("passwordChangeError");

        // Clear previous error
        if (passwordChangeError) {
            passwordChangeError.classList.add("d-none");
        }

        // Basic validation
        if (!newPassword || !confirmPassword) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Tutti i campi sono obbligatori";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Tutti i campi sono obbligatori',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Tutti i campi sono obbligatori');
            }
            return;
        }

        if (newPassword !== confirmPassword) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Le password non coincidono";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Le password non coincidono',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Le password non coincidono');
            }
            return;
        }

        // Get current user from localStorage
        const userData = JSON.parse(localStorage.getItem("currentUser"));
        if (!userData || !userData.username) {
            if (passwordChangeError) {
                passwordChangeError.textContent = "Sessione scaduta. Effettua di nuovo il login.";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Sessione scaduta. Effettua di nuovo il login.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Sessione scaduta. Effettua di nuovo il login.');
            }
            return;
        }

        // Skip password change if firstLogin is false
        if (userData.firstLogin === false) {
            console.log("Password change skipped, firstLogin is false");

            // Hide authentication section and show dashboard directly
            document.getElementById("authSection").classList.add("d-none");
            document.getElementById("dashboardSection").classList.remove("d-none");

            // Load dashboard data
            loadDashboardData();
            return;
        }

        try {
            // Send request to update password
            const response = await inviaRichiesta("PATCH", "/api/users/password", {
                username: userData.username,
                newPassword: newPassword,
                firstLogin: false
            });

            console.log("Password change response:", response);

            // Update firstLogin status in localStorage
            userData.firstLogin = false;
            localStorage.setItem("currentUser", JSON.stringify(userData));

            // Display user name in dashboard if element exists
            const userDisplayName = document.getElementById("userDisplayName");
            if (userDisplayName) {
                userDisplayName.textContent = userData.fullName || userData.username;
            }

            // Show success message
            if (window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password Modificata',
                    text: 'La tua password è stata modificata con successo.',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    // Hide authentication section and show dashboard
                    document.getElementById("authSection").classList.add("d-none");
                    document.getElementById("dashboardSection").classList.remove("d-none");

                    // Aggiorna le informazioni utente nella navbar
                    updateUserInfoInNavbar(userData);

                    // Load dashboard data
                    loadDashboardData();
                });
            } else {
                alert('La tua password è stata modificata con successo.');
                // Hide authentication section and show dashboard
                document.getElementById("authSection").classList.add("d-none");
                document.getElementById("dashboardSection").classList.remove("d-none");

                // Aggiorna le informazioni utente nella navbar
                updateUserInfoInNavbar(userData);

                // Load dashboard data
                loadDashboardData();
            }
        } catch (error) {
            console.error("Errore nella modifica della password:", error);
            if (passwordChangeError) {
                passwordChangeError.textContent = "Impossibile modificare la password. Riprova.";
                passwordChangeError.classList.remove("d-none");
            } else if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile modificare la password. Riprova.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile modificare la password. Riprova.');
            }
        }
    }

    // Add logout functionality
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            document.getElementById("dashboardSection").classList.add("d-none");
            document.getElementById("authSection").classList.remove("d-none");
            // Show login card and hide password change card when logging out
            document.getElementById("loginCard").classList.remove("d-none");
            document.getElementById("passwordChangeCard").classList.add("d-none");
        });
    }

    // Aggiungi gestione dei click sui link della navbar per mostrare le sezioni appropriate
    initNavbarListeners();

    // Function to initialize the navbar links
    function initNavbarListeners() {
        const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
        navLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                // Rimuovi la classe active da tutti i link
                navLinks.forEach(l => l.classList.remove("active"));

                // Aggiungi la classe active a questo link
                this.classList.add("active");

                // Ottieni l'ID della sezione da mostrare
                const targetId = this.getAttribute("href").substring(1);

                // Nascondi tutte le sezioni
                document.getElementById("dashboardContent")?.classList.add("d-none");
                document.getElementById("operatori-content")?.classList.add("d-none");
                document.getElementById("perizie-content")?.classList.add("d-none");

                // Mostra la sezione appropriata
                if (targetId === "dashboard") {
                    const dashboardContent = document.getElementById("dashboardContent");
                    if (dashboardContent) {
                        dashboardContent.classList.remove("d-none");
                        // Ricarica i dati della dashboard se necessario
                        updateDashboardStatistics(window.perizie || []);
                        loadRecentPerizieDashboard(window.perizie || []);
                    }
                } else if (targetId === "operatori") {
                    document.getElementById("operatori-content")?.classList.remove("d-none");
                    // Carica i dati degli operatori
                    initOperatoriPage();
                } else if (targetId === "perizie") {
                    const perizieContent = document.getElementById("perizie-content");
                    if (perizieContent) {
                        perizieContent.classList.remove("d-none");
                        // Assicuriamoci che inizializziamo la sezione perizie
                        initPeriziePage();
                    }
                }
            });
        });
    }

    // Function to load dashboard data
    async function loadDashboardData() {
        console.log("Loading dashboard data...");
        try {
            await loadPerizie();
            initDashboardMap();
        } catch (error) {
            console.error("Errore nel caricamento della dashboard:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Si è verificato un errore nel caricamento dei dati della dashboard',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Si è verificato un errore nel caricamento dei dati della dashboard');
            }
        }
    }

    // Funzione per caricare le perizie dal server MongoDB
    async function loadPerizie() {
        console.log("Caricamento perizie dal server...");

        try {
            // Invia richiesta al server utilizzando la funzione esistente
            const response = await inviaRichiesta("GET", "/api/perizie");

            console.log("Risposta del server:", response);

            // Verifica che la risposta sia un array o un oggetto con dati
            if (Array.isArray(response)) {
                window.perizie = response;
            } else if (response && response.data) {
                window.perizie = response.data;
            } else if (response && typeof response === 'object') {
                window.perizie = [response]; // Converti oggetto singolo in array
            } else {
                throw new Error("Formato risposta non valido");
            }

            console.log(`Caricate ${window.perizie.length} perizie`);

            // Se siamo nella dashboard, aggiorna le statistiche
            if (document.getElementById('dashboardContent') &&
                !document.getElementById('dashboardContent').classList.contains('d-none')) {
                updateDashboardStatistics(window.perizie);
                loadRecentPerizieDashboard(window.perizie);
            }

            return window.perizie;
        } catch (error) {
            console.error("Errore nel caricamento delle perizie:", error);

            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: 'Impossibile caricare i dati delle perizie dal server',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Impossibile caricare i dati delle perizie dal server');
            }

            // Inizializza con array vuoto per evitare errori
            window.perizie = [];
            return [];
        }
    }

    // Funzione per aggiornare le statistiche nella dashboard
    function updateDashboardStatistics(perizie) {
        // Totale perizie
        const totalElement = document.getElementById("totalInspections");
        if (totalElement) totalElement.textContent = perizie.length;

        // Operatori attivi (conteggio unico degli operatori)
        const operatoriUnici = [...new Set(perizie.map(p => p.operatoreId))].filter(Boolean);
        const activeElement = document.getElementById("activeUsers");
        if (activeElement) activeElement.textContent = operatoriUnici.length;

        // Totale foto
        const totaleFoto = perizie.reduce((acc, p) => {
            return acc + (p.fotografie ? p.fotografie.length : 0);
        }, 0);
        const photosElement = document.getElementById("totalPhotos");
        if (photosElement) photosElement.textContent = totaleFoto;
    }

    // Funzione per caricare le perizie recenti nella dashboard
    function loadRecentPerizieDashboard(perizie) {
        const tableBody = document.getElementById("inspectionTableBody");
        if (!tableBody) return;

        // Svuota la tabella
        tableBody.innerHTML = '';

        // Ordina le perizie per data più recenti prima
        const recentPerizie = [...perizie]
            .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
            .slice(0, 5); // Prendi solo le prime 5

        recentPerizie.forEach(perizia => {
            const row = document.createElement('tr');

            // Formatta la data in formato italiano
            const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Calcola il numero di foto
            const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;

            // Abbrevia la descrizione se troppo lunga
            const shortDesc = perizia.descrizione && perizia.descrizione.length > 30
                ? perizia.descrizione.substring(0, 30) + '...'
                : (perizia.descrizione || 'N/D');

            row.innerHTML = `
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo.split(',')[0] : 'N/D'}</td>
                <td>${shortDesc}</td>
                <td>${numFoto}</td>
                <td>
                    <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}"><i class="fas fa-edit"></i></button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Aggiungi listener agli elementi appena creati
        document.querySelectorAll('.view-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                viewPerizia(this.getAttribute('data-id'));
            });
        });

        document.querySelectorAll('.edit-inspection').forEach(btn => {
            btn.addEventListener('click', function () {
                editPerizia(this.getAttribute('data-id'));
            });
        });
    }

    // Funzione per inizializzare la mappa nella dashboard
    function initDashboardMap() {
        if (!window.perizie || typeof L === 'undefined') {
            console.log("Leaflet non disponibile o nessuna perizia da visualizzare");
            return;
        }

        const mapContainer = document.getElementById('inspectionMap');
        if (!mapContainer) {
            console.log("Container mappa dashboard non trovato");
            return;
        }

        console.log("Inizializzazione mappa dashboard");

        try {
            // Inizializza la mappa
            const map = L.map('inspectionMap').setView([41.9028, 12.4964], 6); // Centro su Italia

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Aggiungi marker per ogni perizia
            const markers = [];

            window.perizie.forEach(perizia => {
                if (perizia.posizione && perizia.posizione.lat && perizia.posizione.lng) {
                    // Crea il marker
                    const marker = L.marker([perizia.posizione.lat, perizia.posizione.lng]).addTo(map);
                    markers.push(marker);

                    // Aggiungi popup con informazioni
                    marker.bindPopup(`
                        <strong>${perizia.id}</strong><br>
                        ${perizia.tipo ? (perizia.tipo.charAt(0).toUpperCase() + perizia.tipo.slice(1)) : 'N/D'}, 
                        ${perizia.posizione.indirizzo || 'Indirizzo non disponibile'}<br>
                        <strong>Operatore:</strong> ${perizia.operatore || 'N/D'}<br>
                        <button class="btn btn-sm btn-primary mt-2 view-perizia-map" data-id="${perizia.id}">Dettagli</button>
                    `);
                }
            });

            // Se ci sono marker, adatta la vista per mostrarli tutti
            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds(), { padding: [50, 50] });
            }

            // Aggiungi listener per i pulsanti nei popup
            map.on('popupopen', function (e) {
                document.querySelectorAll('.view-perizia-map').forEach(btn => {
                    btn.addEventListener('click', function () {
                        viewPerizia(this.getAttribute('data-id'));
                    });
                });
            });

            // Aggiorna le dimensioni della mappa (importante per quando la mappa è in un tab)
            setTimeout(() => map.invalidateSize(), 100);

        } catch (error) {
            console.error("Errore nell'inizializzazione della mappa dashboard:", error);
            mapContainer.innerHTML = '<div class="alert alert-danger">Errore nel caricamento della mappa</div>';
        }
    }

    // Helpers per funzionalità relative alle perizie
    function viewPerizia(id) {
        if (!window.perizie) return;

        const perizia = window.perizie.find(p => p.id === id);
        if (!perizia) {
            console.error(`Perizia con ID ${id} non trovata`);
            return;
        }

        // Formatta la data in formato italiano
        const formattedDate = new Date(perizia.data).toLocaleString('it-IT');

        // Prepara galleria di foto se presenti
        let fotoHtml = "<p>Nessuna foto disponibile</p>";
        if (perizia.fotografie && perizia.fotografie.length > 0) {
            fotoHtml = `
                <div class="row">
                    ${perizia.fotografie.map((foto, index) => `
                        <div class="col-md-4 mb-3">
                            <img src="${foto.url}" class="img-fluid img-thumbnail" alt="Foto ${index + 1}" onerror="this.src='https://via.placeholder.com/300x200?text=Anteprima+non+disponibile'">
                            <p class="small mt-1">${foto.commento || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Visualizza la modal con i dettagli della perizia
        if (window.Swal) {
            Swal.fire({
                title: `Perizia ${perizia.id}`,
                html: `
                    <div class="text-start">
                        <p><strong>Tipo:</strong> ${perizia.tipo ? (perizia.tipo.charAt(0).toUpperCase() + perizia.tipo.slice(1)) : 'N/D'}</p>
                        <p><strong>Operatore:</strong> ${perizia.operatore || 'N/D'} ${perizia.operatoreId ? `(ID: ${perizia.operatoreId})` : ''}</p>
                        <p><strong>Data:</strong> ${formattedDate}</p>
                        <p><strong>Indirizzo:</strong> ${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</p>
                        <p><strong>Coordinate:</strong> ${perizia.posizione ? `${perizia.posizione.lat || 'N/D'}, ${perizia.posizione.lng || 'N/D'}` : 'N/D'}</p>
                        <p><strong>Descrizione:</strong> ${perizia.descrizione || 'N/D'}</p>
                        <p><strong>Cliente:</strong> ${perizia.cliente ? `${perizia.cliente.nome || 'N/D'} (${perizia.cliente.contatto || 'N/D'})` : 'N/D'}</p>
                        <p><strong>Polizza:</strong> ${perizia.polizza || 'N/D'}</p>
                        <h5 class="mt-4">Fotografie (${perizia.fotografie ? perizia.fotografie.length : 0})</h5>
                        ${fotoHtml}
                    </div>
                `,
                width: 800,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Chiudi'
            });
        } else {
            alert(`Perizia ${perizia.id} - Per visualizzare tutti i dettagli, assicurati che SweetAlert2 sia caricato.`);
        }
    }

    function isUserAdmin() {
        const userData = JSON.parse(localStorage.getItem("currentUser"));
        return userData && userData.role === 'admin';
    }

    // Funzione per verificare i permessi prima di eseguire un'azione riservata agli admin
    function checkAdminPermission() {
        if (!isUserAdmin()) {
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Permesso negato',
                    text: 'Questa operazione può essere eseguita solo da un amministratore',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert('Permesso negato. Questa operazione può essere eseguita solo da un amministratore');
            }
            return false;
        }
        return true;
    }

    // Function to toggle all checkboxes
    function toggleAllCheckboxes(checked) {
        document.querySelectorAll('.inspection-select').forEach(checkbox => {
            checkbox.checked = checked;
        });
        updateSelectedCount();
    }

    // Function to update the count of selected perizie
    function updateSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
        const count = selectedCheckboxes.length;
        
        // Update the text in the assign button
        const assignButton = document.getElementById('assignSelectedInspections');
        if (assignButton) {
            assignButton.innerHTML = `<i class="fas fa-user-tag me-1"></i>Assegna selezionate (${count})`;
            assignButton.disabled = count === 0;
        }
        
        // Update the text in the delete button
        const deleteButton = document.getElementById('deleteSelectedInspections');
        if (deleteButton) {
            deleteButton.innerHTML = `<i class="fas fa-trash me-1"></i>Elimina selezionate (${count})`;
            deleteButton.disabled = count === 0;
        }
    }

    // Function to delete a single perizia
    async function deletePerizia(id) {
        // Check admin permissions first
        if (!checkAdminPermission()) return;
        const request = inviaRichiesta("DELETE", `/api/perizie/${id}`);
        // Confirm deletion
        if (window.Swal) {
            const confirmation = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare la perizia ${id}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla'
            });

            if (confirmation.isConfirmed) {
                await deletePerizieByIds([id]);
            }
        } else {
            if (confirm(`Sei sicuro di voler eliminare la perizia ${id}?`)) {
                await deletePerizieByIds([id]);
            }
        }
    }

    // Function to delete selected perizie
    async function deleteSelectedPerizie() {
        // Check admin permissions first
        if (!checkAdminPermission()) return;

        const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
        if (selectedCheckboxes.length === 0) return;

        const ids = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

        // Confirm deletion
        if (window.Swal) {
            const confirmation = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare ${ids.length} perizie?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla'
            });

            if (confirmation.isConfirmed) {
                await window.deletePerizieByIds(ids);
            }
        } else {
            if (confirm(`Sei sicuro di voler eliminare ${ids.length} perizie?`)) {
                await deletePerizieByIds(ids);
            }
        }
    }

    // Function to assign selected perizie to an operator
    async function assignSelectedPerizie() {
        // Check admin permissions first
        if (!checkAdminPermission()) return;

        const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
        if (selectedCheckboxes.length === 0) return;

        const ids = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));

        // Get operators list for the dropdown
        let operatoriOptions = '';
        try {
            const operatori = await inviaRichiesta("GET", "/api/users");
            if (Array.isArray(operatori) && operatori.length > 0) {
                operatoriOptions = operatori.map(op => 
                    `<option value="${op.id}">${op.nome} ${op.cognome} (${op.username})</option>`
                ).join('');
            } else {
                operatoriOptions = '<option value="">Nessun operatore disponibile</option>';
            }
        } catch (error) {
            console.error("Errore nel caricamento degli operatori:", error);
            operatoriOptions = '<option value="">Errore nel caricamento degli operatori</option>';
        }

        // Show assignment modal
        if (window.Swal) {
            const result = await Swal.fire({
                title: 'Assegna Perizie',
                html: `
                    <p>Stai per assegnare ${ids.length} perizie all'operatore selezionato.</p>
                    <div class="mb-3">
                        <label for="operatoreSelect" class="form-label">Seleziona operatore:</label>
                        <select id="operatoreSelect" class="form-select">
                            <option value="">-- Seleziona operatore --</option>
                            ${operatoriOptions}
                        </select>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Assegna',
                cancelButtonText: 'Annulla',
                preConfirm: () => {
                    const operatoreId = document.getElementById('operatoreSelect').value;
                    if (!operatoreId) {
                        Swal.showValidationMessage('Seleziona un operatore');
                        return false;
                    }
                    return { operatoreId };
                }
            });

            if (result.isConfirmed && result.value) {
                try {
                    const response = await inviaRichiesta("PATCH", "/api/perizie/assegna", {
                        ids: ids,
                        operatoreId: result.value.operatoreId
                    });

                    if (response && response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Perizie assegnate',
                            text: `${ids.length} perizie assegnate con successo`,
                            confirmButtonColor: '#3085d6'
                        });

                        // Reload perizie to update the UI
                        await loadPerizie();
                        loadPerizieTable();
                    } else {
                        throw new Error("Errore nell'assegnazione delle perizie");
                    }
                } catch (error) {
                    console.error("Errore nell'assegnazione delle perizie:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: `Impossibile assegnare le perizie: ${error.message}`,
                        confirmButtonColor: '#3085d6'
                    });
                }
            }
        } else {
            alert('Funzionalità di assegnazione avanzata non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    }

    // Function to update a perizia
    async function updatePerizia(id, updateData) {
        try {
            const response = await inviaRichiesta("PATCH", `/api/perizie/${id}`, updateData);
            
            if (response && response.success) {
                // Reload perizie after update
                await loadPerizie();
                
                // Refresh the table if we're in the perizie section
                if (!document.getElementById('perizie-content').classList.contains('d-none')) {
                    loadPerizieTable();
                }
                
                // Show success message
                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Perizia Aggiornata',
                        text: 'La perizia è stata aggiornata con successo',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('La perizia è stata aggiornata con successo');
                }
            } else {
                throw new Error("Errore nell'aggiornamento della perizia");
            }
        } catch (error) {
            console.error("Errore nell'aggiornamento della perizia:", error);
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `Impossibile aggiornare la perizia: ${error.message}`,
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert(`Impossibile aggiornare la perizia: ${error.message}`);
            }
        }
    }

    // Function to initialize the operators page
    function initOperatoriPage() {
        console.log("Inizializzazione pagina operatori");
        
        if (!checkAdminPermission()) {
            console.log("Permesso admin negato");
            return;
        }
    
        // Create operators content if it doesn't exist
        if (!document.getElementById('operatori-content')) {
            console.log("Creazione contenitore operatori");
            createOperatoriContent();
        }
    
        // Hide other sections
        document.getElementById('dashboardContent')?.classList.add('d-none');
        document.getElementById('perizie-content')?.classList.add('d-none');
    
        // Show the operators section
        const operatoriContent = document.getElementById('operatori-content');
        if (operatoriContent) {
            console.log("Mostrando sezione operatori");
            operatoriContent.classList.remove('d-none');
            // Mettere un timeout per evitare potenziali loop di caricamento
            setTimeout(() => {
                console.log("Caricamento operatori dopo timeout");
                loadOperatori();
            }, 100);
        } else {
            console.error("Container operatori-content non trovato");
        }
    }
    function addOperatorCardStyles() {
        const styleElement = document.getElementById('operator-card-styles');
        if (!styleElement) {
            const cardStyles = document.createElement('style');
            cardStyles.id = 'operator-card-styles';
            cardStyles.textContent = `
                .avatar-circle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 32px;
                    font-weight: bold;
                }
                
                .operator-cards-container .card {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .operator-cards-container .card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                .operator-cards-container .card-footer {
                    padding-top: 15px;
                }
            `;
            document.head.appendChild(cardStyles);
        }
    }

    function initOperatoriPage() {
        console.log("Inizializzazione pagina operatori");
        
        if (!checkAdminPermission()) {
            console.log("Permesso admin negato");
            return;
        }
    
        // Create operators content if it doesn't exist
        if (!document.getElementById('operatori-content')) {
            console.log("Creazione contenitore operatori");
            createOperatoriContent();
        }
    
        // Add custom styles for operator cards
        addOperatorCardStyles();
    
        // Hide other sections
        document.getElementById('dashboardContent')?.classList.add('d-none');
        document.getElementById('perizie-content')?.classList.add('d-none');
    
        // Show the operators section
        const operatoriContent = document.getElementById('operatori-content');
        if (operatoriContent) {
            console.log("Mostrando sezione operatori");
            operatoriContent.classList.remove('d-none');
            // Set timeout to avoid potential loading loops
            setTimeout(() => {
                console.log("Caricamento operatori dopo timeout");
                loadOperatori();
            }, 100);
        } else {
            console.error("Container operatori-content non trovato");
        }
    }

    // Function to create operators content
    function createOperatoriContent() {
        const operatoriContentDiv = document.createElement('div');
        operatoriContentDiv.id = 'operatori-content';
        operatoriContentDiv.className = 'container d-none';
        operatoriContentDiv.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-12">
                    <h2>Gestione Operatori</h2>
                    <!-- The operator cards will be inserted here -->
                    <!-- <div class="operator-cards-container row mt-4"></div> -->
                    <div class="card mt-4">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-users me-2"></i>Elenco Operatori
                            </div>
                            <button id="addOperatorBtn" class="btn btn-sm btn-light">
                                <i class="fas fa-plus me-1"></i>Nuovo Operatore
                            </button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Nome</th>
                                            <th>Cognome</th>
                                            <th>Email</th>
                                            <th>Ruolo</th>
                                            <th>Perizie Assegnate</th>
                                            <th>Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody id="operatoriTableBody">
                                        <!-- Dati operatori verranno inseriti qui -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('dashboardSection').appendChild(operatoriContentDiv);
    
        // Add event listener to the new operator button
        const addOperatorBtn = operatoriContentDiv.querySelector('#addOperatorBtn');
        if (addOperatorBtn) {
            addOperatorBtn.addEventListener('click', addOperator);
        }
    }

    // Function to load operators from the server
    async function loadOperatori() {
        console.log("Caricamento operatori...");
        
        // Find both the table container and where we'll put the cards
        const tableBody = document.getElementById('operatoriTableBody');
        const operatoriContent = document.getElementById('operatori-content');
        
        if (!operatoriContent) {
            console.error("Container operatori-content non trovato");
            return;
        }
        
        // Add a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'text-center my-4';
        loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento...</span></div>';
        operatoriContent.querySelector('.card-body').appendChild(loadingIndicator);
        
        try {
            // Fetch operators
            const operatori = await inviaRichiesta("GET", "/api/users");
            console.log("Operatori caricati:", operatori);
            
            // Remove loading indicator
            loadingIndicator.remove();
            
            // Check if we got any data
            if (!Array.isArray(operatori) || operatori.length === 0) {
                if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nessun operatore trovato</td></tr>';
                return;
            }
            
            // Get the card container or create one if not exists
            let cardsContainer = operatoriContent.querySelector('.operator-cards-container');
            if (!cardsContainer) {
                cardsContainer = document.createElement('div');
                cardsContainer.className = 'operator-cards-container row mt-4';
                
                // Insert before the operators table card
                const tableCard = operatoriContent.querySelector('.card');
                operatoriContent.querySelector('.col-md-12').insertBefore(cardsContainer, tableCard);
            }
            
            // Clear previous cards if any
            cardsContainer.innerHTML = '';
            
            // Populate cards for each operator
            operatori.forEach(operatore => {
                // Create operator card
                const card = document.createElement('div');
                card.className = 'col-md-3 col-sm-6 mb-4';
                
                // Get operator initials for the avatar
                const initials = operatore.firstName && operatore.lastName 
                    ? `${operatore.firstName.charAt(0)}${operatore.lastName.charAt(0)}`.toUpperCase()
                    : operatore.username.substring(0, 2).toUpperCase();
                    
                // Generate random color based on username
                const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#d35400', '#34495e'];
                const colorIndex = operatore.username.charCodeAt(0) % colors.length;
                const avatarColor = colors[colorIndex];
                
                // Format role for badge
                const roleBadge = operatore.role === 'admin'
                    ? '<span class="badge bg-danger position-absolute top-0 end-0 m-2">Admin</span>'
                    : '<span class="badge bg-primary position-absolute top-0 end-0 m-2">Operatore</span>';
                    
                card.innerHTML = `
                    <div class="card h-100 position-relative">
                        ${roleBadge}
                        <div class="text-center pt-4">
                            <div class="avatar-circle mx-auto mb-3" style="width: 80px; height: 80px; background-color: ${avatarColor}; color: white;">
                                ${initials}
                            </div>
                            <h5 class="card-title">${operatore.firstName || ''} ${operatore.lastName || ''}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">@${operatore.username}</h6>
                            <p class="card-text">
                                <i class="fas fa-envelope me-2"></i>${operatore.email || 'N/D'}<br>
                                <small class="text-muted mt-2">
                                    <i class="fas fa-clipboard-list me-1"></i>Perizie: ${operatore.perizieCount || 0}
                                </small>
                            </p>
                            <div class="card-footer bg-transparent border-0">
                                <button class="btn btn-sm btn-warning edit-operator me-1" data-id="${operatore.username}">
                                    <i class="fas fa-edit"></i> Modifica
                                </button>
                                <button class="btn btn-sm btn-danger delete-operator" data-id="${operatore.username}">
                                    <i class="fas fa-trash"></i> Elimina
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                cardsContainer.appendChild(card);
            });
            
            // Now also update the table if needed
            if (tableBody) {
                tableBody.innerHTML = '';
                
                // Populate table
                operatori.forEach(operatore => {
                    const row = document.createElement('tr');
                    
                    // Format role
                    let roleBadge = '<span class="badge bg-primary">Operatore</span>';
                    if (operatore.role === 'admin') {
                        roleBadge = '<span class="badge bg-danger">Amministratore</span>';
                    }
        
                    row.innerHTML = `
                        <td>${operatore.username || 'N/D'}</td>
                        <td>${operatore.firstName || 'N/D'}</td>
                        <td>${operatore.lastName || 'N/D'}</td>
                        <td>${operatore.email || 'N/D'}</td>
                        <td>${roleBadge}</td>
                        <td>${operatore.perizieCount || 0}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-operator" data-id="${operatore.username}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-operator" data-id="${operatore.username}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
        
                    tableBody.appendChild(row);
                });
            }
            
            // Add event listeners to buttons
            document.querySelectorAll('.edit-operator').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-id');
                    const operatore = operatori.find(op => op.username === username);
                    if (operatore) {
                        editOperator(operatore);
                    } else {
                        console.error(`Operatore con username ${username} non trovato`);
                    }
                });
            });
        
            document.querySelectorAll('.delete-operator').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-id');
                    deleteOperator(username);
                });
            });
            
        } catch (error) {
            console.error("Errore nel caricamento degli operatori:", error);
            
            // Remove loading indicator
            loadingIndicator.remove();
            
            if (tableBody) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            Errore nel caricamento degli operatori: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    }

    // Function to add a new operator
    function addOperator() {
        if (!checkAdminPermission()) return;

        if (window.Swal) {
            Swal.fire({
                title: 'Aggiungi Operatore',
                html: `
                    <form id="addOperatorForm" class="text-start">
                        <div class="mb-3">
                            <label for="newUsername" class="form-label">Username*</label>
                            <input type="text" class="form-control" id="newUsername" required>
                        </div>
                        <div class="mb-3">
                            <label for="newPassword" class="form-label">Password*</label>
                            <input type="password" class="form-control" id="newPassword" required>
                        </div>
                        <div class="mb-3">
                            <label for="newFirstName" class="form-label">Nome</label>
                            <input type="text" class="form-control" id="newFirstName">
                        </div>
                        <div class="mb-3">
                            <label for="newLastName" class="form-label">Cognome</label>
                            <input type="text" class="form-control" id="newLastName">
                        </div>
                        <div class="mb-3">
                            <label for="newEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="newEmail">
                        </div>
                        <div class="mb-3">
                            <label for="newRole" class="form-label">Ruolo</label>
                            <select class="form-select" id="newRole">
                                <option value="user">Operatore</option>
                                <option value="admin">Amministratore</option>
                            </select>
                        </div>
                        <p class="text-muted">* Campi obbligatori</p>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Salva',
                cancelButtonText: 'Annulla',
                preConfirm: () => {
                    const username = document.getElementById('newUsername').value;
                    const password = document.getElementById('newPassword').value;
                    
                    if (!username || !password) {
                        Swal.showValidationMessage('Username e password sono obbligatori');
                        return false;
                    }

                    return {
                        username: username,
                        password: password,
                        firstName: document.getElementById('newFirstName').value,
                        lastName: document.getElementById('newLastName').value,
                        email: document.getElementById('newEmail').value,
                        role: document.getElementById('newRole').value,
                        firstLogin: true
                    };
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await inviaRichiesta("POST", "/api/users", result.value);
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Operatore Aggiunto',
                            text: 'Nuovo operatore aggiunto con successo',
                            confirmButtonColor: '#3085d6'
                        });
                        
                        // Reload the operators table
                        loadOperatori();
                    } catch (error) {
                        console.error("Errore nell'aggiunta dell'operatore:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore',
                            text: `Impossibile aggiungere l'operatore: ${error.message}`,
                            confirmButtonColor: '#3085d6'
                        });
                    }
                }
            });
        } else {
            alert('Funzionalità avanzata non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    }

    // Function to edit an operator
    function editOperator(operatore) {
        if (!checkAdminPermission()) return;

        if (window.Swal) {
            Swal.fire({
                title: `Modifica Operatore: ${operatore.username}`,
                html: `
                    <form id="editOperatorForm" class="text-start">
                        <div class="mb-3">
                            <label for="editFirstName" class="form-label">Nome</label>
                            <input type="text" class="form-control" id="editFirstName" value="${operatore.firstName || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="editLastName" class="form-label">Cognome</label>
                            <input type="text" class="form-control" id="editLastName" value="${operatore.lastName || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="editEmail" class="form-label">Email</label>
                            <input type="email" class="form-control" id="editEmail" value="${operatore.email || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="editRole" class="form-label">Ruolo</label>
                            <select class="form-select" id="editRole">
                                <option value="user" ${operatore.role !== 'admin' ? 'selected' : ''}>Operatore</option>
                                <option value="admin" ${operatore.role === 'admin' ? 'selected' : ''}>Amministratore</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="resetPassword">
                                <label class="form-check-label" for="resetPassword">
                                    Resetta password
                                </label>
                            </div>
                        </div>
                    </form>
                `,
                showCancelButton: true,
                confirmButtonText: 'Salva Modifiche',
                cancelButtonText: 'Annulla',
                preConfirm: () => {
                    const updateData = {
                        firstName: document.getElementById('editFirstName').value,
                        lastName: document.getElementById('editLastName').value,
                        email: document.getElementById('editEmail').value,
                        role: document.getElementById('editRole').value
                    };

                    const resetPassword = document.getElementById('resetPassword').checked;
                    if (resetPassword) {
                        updateData.resetPassword = true;
                    }

                    return updateData;
                }
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await inviaRichiesta("PATCH", `/api/users/${operatore.username}`, result.value);
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Operatore Aggiornato',
                            text: 'Operatore aggiornato con successo',
                            confirmButtonColor: '#3085d6'
                        });
                        
                        // Reload the operators table
                        loadOperatori();
                    } catch (error) {
                        console.error("Errore nell'aggiornamento dell'operatore:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Errore',
                            text: `Impossibile aggiornare l'operatore: ${error.message}`,
                            confirmButtonColor: '#3085d6'
                        });
                    }
                }
            });
        } else {
            alert('Funzionalità avanzata non disponibile. Verifica che SweetAlert2 sia caricato.');
        }
    }

    // Function to delete an operator
    async function deleteOperator(username) {
        if (!checkAdminPermission()) return;

        // Confirm deletion
        let shouldDelete = false;
        
        if (window.Swal) {
            const confirmation = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare l'operatore ${username}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla'
            });
            
            shouldDelete = confirmation.isConfirmed;
        } else {
            shouldDelete = confirm(`Sei sicuro di voler eliminare l'operatore ${username}?`);
        }
        
        if (shouldDelete) {
            try {
                await inviaRichiesta("DELETE", `/api/users/${username}`);
                
                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Operatore Eliminato',
                        text: 'Operatore eliminato con successo',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('Operatore eliminato con successo');
                }
                
                // Reload the operators table
                loadOperatori();
            } catch (error) {
                console.error("Errore nell'eliminazione dell'operatore:", error);
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: `Impossibile eliminare l'operatore: ${error.message}`,
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert(`Impossibile eliminare l'operatore: ${error.message}`);
             
                }
            }
    }
    async function deleteOperator(username) {
        if (!checkAdminPermission()) return;
    
        // Confirm deletion
        let shouldDelete = false;
        
        if (window.Swal) {
            const confirmation = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare l'operatore ${username}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla'
            });
            
            shouldDelete = confirmation.isConfirmed;
        } else {
            shouldDelete = confirm(`Sei sicuro di voler eliminare l'operatore ${username}?`);
        }
        
        if (shouldDelete) {
            try {
                await inviaRichiesta("DELETE", `/api/users/${username}`);
                
                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Operatore Eliminato',
                        text: 'Operatore eliminato con successo',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('Operatore eliminato con successo');
                }
                
                // Reload the operators table
                loadOperatori();
            } catch (error) {
                console.error("Errore nell'eliminazione dell'operatore:", error);
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Errore',
                        text: `Impossibile eliminare l'operatore: ${error.message}`,
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert(`Impossibile eliminare l'operatore: ${error.message}`);
                }
            }
        }
    }
    
    // Fixed function for loading perizie table
    function loadPerizieTable(filteredPerizie = null) {
        console.log("Caricamento tabella perizie...");
    
        // Find the table body element
        const tableBody = document.getElementById('perizieTableBody');
        if (!tableBody) {
            console.error("Elemento perizieTableBody non trovato");
            return;
        }
    
        // Empty the table
        tableBody.innerHTML = '';
    
        // Use filtered perizie if provided, otherwise use all perizie
        const perizie = filteredPerizie || window.perizie;
    
        // Check if perizie are loaded
        if (!perizie || perizie.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-3">Nessuna perizia disponibile</td>
                </tr>
            `;
            return;
        }
    
        // Sort perizie by date (most recent first)
        const sortedPerizie = [...perizie].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    
        // Populate the table
        sortedPerizie.forEach(perizia => {
            const row = document.createElement('tr');
    
            // Format date
            const formattedDate = new Date(perizia.data).toLocaleString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    
            // Determine status badge
            let statusBadge = '<span class="badge bg-primary">Pianificata</span>';
            if (perizia.stato === 'completed') {
                statusBadge = '<span class="badge bg-success">Completata</span>';
            } else if (perizia.stato === 'pending') {
                statusBadge = '<span class="badge bg-warning text-dark">In attesa</span>';
            } else if (perizia.stato === 'in_progress') {
                statusBadge = '<span class="badge bg-warning text-dark">In corso</span>';
            }
    
            // Count photos
            const numFoto = perizia.fotografie ? perizia.fotografie.length : 0;
    
            row.innerHTML = `
                <td>
                    <div class="form-check">
                        <input class="form-check-input inspection-select" type="checkbox" data-id="${perizia.id}">
                    </div>
                </td>
                <td>${perizia.id}</td>
                <td>${perizia.operatore || 'N/D'}</td>
                <td>${formattedDate}</td>
                <td>${perizia.tipo || 'N/D'}</td>
                <td>${perizia.posizione && perizia.posizione.indirizzo ? perizia.posizione.indirizzo : 'N/D'}</td>
                <td>${statusBadge}</td>
                <td>${numFoto}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-info view-inspection" data-id="${perizia.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning edit-inspection" data-id="${perizia.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-inspection" data-id="${perizia.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
    
            tableBody.appendChild(row);
        });
    
        // Add event listeners to action buttons
        document.querySelectorAll('.view-inspection').forEach(btn => {
            btn.addEventListener('click', function() {
                viewPerizia(this.getAttribute('data-id'));
            });
        });
    
        document.querySelectorAll('.edit-inspection').forEach(btn => {
            btn.addEventListener('click', function() {
                editPerizia(this.getAttribute('data-id'));
            });
        });
    
        document.querySelectorAll('.delete-inspection').forEach(btn => {
            btn.addEventListener('click', function() {
                deletePerizia(this.getAttribute('data-id'));
            });
        });
    
        // Add event listeners to checkboxes
        document.querySelectorAll('.inspection-select').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                // Update count when a checkbox changes state
                updateSelectedCount();
                
                // Check if all checkboxes are selected
                const allCheckboxes = document.querySelectorAll('.inspection-select');
                const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
                
                // Update the "select all" checkbox
                const selectAllCheckbox = document.getElementById('selectAllInspections');
                const headerCheckbox = document.getElementById('headerCheckbox');
                
                if (selectAllCheckbox) selectAllCheckbox.checked = allChecked;
                if (headerCheckbox) headerCheckbox.checked = allChecked;
            });
        });
    }
    
    // Function for deleting perizie by IDs (corrected version)
    async function deletePerizieByIds(ids) {
        try {
            if (!ids || ids.length === 0) {
                console.error("Nessun ID fornito per l'eliminazione");
                return;
            }
            
            console.log("Tentativo di eliminazione delle perizie con ID:", ids);
    
            const response = await inviaRichiesta("DELETE", "/api/perizie", { ids });
            
            console.log("Risposta eliminazione:", response);
    
            if (response && response.success) {
                // Reload perizie after deletion
                await loadPerizie();
                loadPerizieTable();
                updatePerizieCounts();
                
                if (window.Swal) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminazione completata',
                        text: 'Perizie eliminate con successo',
                        confirmButtonColor: '#3085d6'
                    });
                } else {
                    alert('Perizie eliminate con successo');
                }
            } else {
                throw new Error("La risposta dal server non indica successo");
            }
        } catch (error) {
            console.error("Errore nell'eliminazione delle perizie:", error);
            
            if (window.Swal) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errore',
                    text: `Impossibile eliminare le perizie: ${error.message}`,
                    confirmButtonColor: '#3085d6'
                });
            } else {
                alert(`Impossibile eliminare le perizie: ${error.message}`);
            }
        }
    }
    
    // Function to delete a single perizia (corrected version)
    async function deletePerizia(id) {
        // Check admin permissions first
        if (!checkAdminPermission()) return;
        
        console.log("Tentativo di eliminare la perizia con ID:", id);
    
        // Confirm deletion
        if (window.Swal) {
            const confirmation = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare la perizia ${id}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla'
            });
    
            if (confirmation.isConfirmed) {
                await deletePerizieByIds([id]);
            }
        } else {
            if (confirm(`Sei sicuro di voler eliminare la perizia ${id}?`)) {
                await deletePerizieByIds([id]);
            }
        }
    }
    
    // Function to delete selected perizie (corrected version)
    async function deleteSelectedPerizie() {
        // Check admin permissions first
        if (!checkAdminPermission()) return;
    
        const selectedCheckboxes = document.querySelectorAll('.inspection-select:checked');
        if (selectedCheckboxes.length === 0) {
            console.log("Nessuna perizia selezionata per l'eliminazione");
            return;
        }
    
        const ids = Array.from(selectedCheckboxes).map(checkbox => checkbox.getAttribute('data-id'));
        console.log("Perizie selezionate per l'eliminazione:", ids);
    
        // Confirm deletion
        if (window.Swal) {
            const confirmation = await Swal.fire({
                title: 'Conferma eliminazione',
                text: `Sei sicuro di voler eliminare ${ids.length} perizie?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sì, elimina',
                cancelButtonText: 'Annulla'
            });
    
            if (confirmation.isConfirmed) {
                await deletePerizieByIds(ids);
            }
        } else {
            if (confirm(`Sei sicuro di voler eliminare ${ids.length} perizie?`)) {
                await deletePerizieByIds(ids);
            }
        }
    }
    
    // Fixed function to load operators
    async function loadOperatori() {
        console.log("Caricamento operatori...");
        const tableBody = document.getElementById('operatoriTableBody');
        if (!tableBody) {
            console.error("Elemento operatoriTableBody non trovato");
            return;
        }
    
        try {
            // Show loading message
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Caricamento operatori...</td></tr>';
    
            // Fetch operators
            const operatori = await inviaRichiesta("GET", "/api/users");
            console.log("Operatori caricati:", operatori);
    
            if (!Array.isArray(operatori) || operatori.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nessun operatore trovato</td></tr>';
                return;
            }
    
            // Clear table
            tableBody.innerHTML = '';
    
            // Populate table
            operatori.forEach(operatore => {
                const row = document.createElement('tr');
                
                // Format role
                let roleBadge = '<span class="badge bg-primary">Operatore</span>';
                if (operatore.role === 'admin') {
                    roleBadge = '<span class="badge bg-danger">Amministratore</span>';
                }
    
                row.innerHTML = `
                    <td>${operatore.username || 'N/D'}</td>
                    <td>${operatore.firstName || 'N/D'}</td>
                    <td>${operatore.lastName || 'N/D'}</td>
                    <td>${operatore.email || 'N/D'}</td>
                    <td>${roleBadge}</td>
                    <td>${operatore.perizieCount || 0}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-operator" data-id="${operatore.username}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-operator" data-id="${operatore.username}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    
                tableBody.appendChild(row);
            });
    
            // Add event listeners to buttons
            document.querySelectorAll('.edit-operator').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-id');
                    const operatore = operatori.find(op => op.username === username);
                    if (operatore) {
                        editOperator(operatore);
                    } else {
                        console.error(`Operatore con username ${username} non trovato`);
                    }
                });
            });
    
            document.querySelectorAll('.delete-operator').forEach(btn => {
                btn.addEventListener('click', function() {
                    const username = this.getAttribute('data-id');
                    deleteOperator(username);
                });
            });
        } catch (error) {
            console.error("Errore nel caricamento degli operatori:", error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        Errore nel caricamento degli operatori: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
 }
