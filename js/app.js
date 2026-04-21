// ========================================
// ODS 14 - SISTEMA DE REPORTES v2
// ========================================

// ========== CONSTANTS ==========
const ADMIN_CREDENTIALS = { email: 'admin@ods14.com', password: 'admin123', name: 'Administrador', lastname: 'Sistema', role: 'admin' };

const CATEGORY_LABELS = {
    contaminacion: '🏭 Contaminación', pesca_ilegal: '🎣 Pesca Ilegal', derrame: '🛢️ Derrame',
    residuos: '♻️ Residuos Plásticos', biodiversidad: '🐠 Pérdida de Biodiversidad',
    coral: '🪸 Daño a Corales', otro: '📋 Otro'
};

const CATEGORY_COLORS = {
    contaminacion: '#ef4444', pesca_ilegal: '#f59e0b', derrame: '#8b5cf6',
    residuos: '#3b82f6', biodiversidad: '#10b981', coral: '#ec4899', otro: '#6b7280'
};

const STATUS_LABELS = { pendiente: 'Pendiente', revision: 'En Revisión', proceso: 'En Proceso', resuelto: 'Resuelto' };
const SEVERITY_LABELS = { baja: '🟢 Baja', media: '🟡 Media', alta: '🟠 Alta', critica: '🔴 Crítica' };

// ========== DEFAULT CATEGORY IMAGES ==========
// Imágenes profesionales de Unsplash para cada categoría
// Si fallan, usan fallback SVG generado dinámicamente

const DEFAULT_CATEGORY_IMAGES = {
    contaminacion: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=600&h=400&fit=crop',
    pesca_ilegal: 'https://images.unsplash.com/photo-1568430462989-44146eb4e9bd?w=600&h=400&fit=crop',
    derrame: 'https://images.unsplash.com/photo-1581093458791-9f3c3900fb5a?w=600&h=400&fit=crop',
    residuos: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&h=400&fit=crop',
    biodiversidad: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=600&h=400&fit=crop',
    coral: 'https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=600&h=400&fit=crop',
    otro: 'https://images.unsplash.com/photo-1464929327128-37c3a906d31f?w=600&h=400&fit=crop'
};

// SVG Fallback images (always work, no external dependency)
const FALLBACK_CATEGORY_IMAGES = {
    contaminacion: generateCategorySVG('🏭', 'Contaminación', '#ef4444', '#7f1d1d', 'Aguas contaminadas'),
    pesca_ilegal: generateCategorySVG('🎣', 'Pesca Ilegal', '#f59e0b', '#78350f', 'Pesca no regulada'),
    derrame: generateCategorySVG('🛢️', 'Derrame', '#8b5cf6', '#4c1d95', 'Derrame de hidrocarburos'),
    residuos: generateCategorySVG('🗑️', 'Residuos Plásticos', '#3b82f6', '#1e3a5f', 'Contaminación plástica'),
    biodiversidad: generateCategorySVG('💀', 'Biodiversidad', '#10b981', '#064e3b', 'Pérdida de especies'),
    coral: generateCategorySVG('🪸', 'Daño a Corales', '#ec4899', '#831843', 'Blanqueamiento de coral'),
    otro: generateCategorySVG('⚠️', 'Otro', '#6b7280', '#1f2937', 'Problema ambiental')
};

function generateCategorySVG(emoji, title, color, darkColor, subtitle) {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${darkColor}"/>
                <stop offset="100%" style="stop-color:${color}20"/>
            </linearGradient>
            <linearGradient id="wave" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:${color};stop-opacity:0.3"/>
                <stop offset="100%" style="stop-color:${color};stop-opacity:0.05"/>
            </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#bg)"/>
        <path d="M0,320 Q150,280 300,310 T600,290 L600,400 L0,400 Z" fill="url(#wave)"/>
        <path d="M0,350 Q150,320 300,340 T600,320 L600,400 L0,400 Z" fill="${color}" opacity="0.15"/>
        <circle cx="300" cy="140" r="60" fill="${color}" opacity="0.15"/>
        <circle cx="300" cy="140" r="45" fill="${color}" opacity="0.1"/>
        <text x="300" y="160" text-anchor="middle" font-size="50">${emoji}</text>
        <text x="300" y="230" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="white">${title}</text>
        <text x="300" y="260" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="white" opacity="0.6">${subtitle}</text>
        <text x="300" y="380" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="white" opacity="0.3">Imagen referencial • ODS 14</text>
    </svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Track uploaded image data
let uploadedImageData = null;

// ========== DATA STORE ==========
function initData() {
    if (!localStorage.getItem('ods14_users')) {
        const users = [{
            id: 1, email: ADMIN_CREDENTIALS.email, password: ADMIN_CREDENTIALS.password,
            name: ADMIN_CREDENTIALS.name, lastname: ADMIN_CREDENTIALS.lastname,
            role: 'admin', createdAt: '2024-01-01T00:00:00'
        }];
        localStorage.setItem('ods14_users', JSON.stringify(users));
    }

    if (!localStorage.getItem('ods14_reports')) {
        const sampleReports = [
            {
                id: 1,
                title: 'Derrame de petróleo en costa norte',
                category: 'derrame',
                severity: 'critica',
                description: 'Se ha detectado un derrame significativo de petróleo que afecta aproximadamente 2km de costa. La mancha se extiende mar adentro y está afectando la fauna marina local.',
                lat: 21.1619,
                lng: -86.8515,
                status: 'proceso',
                userId: 1,
                userName: 'Administrador',
                image: '',
                imageType: 'default',
                adminNote: 'Equipo de limpieza desplegado.',
                createdAt: '2024-11-15T10:30:00'
            },
            {
                id: 2,
                title: 'Residuos plásticos en playa del Carmen',
                category: 'residuos',
                severity: 'alta',
                description: 'Gran acumulación de residuos plásticos en la zona de playa. Se observan botellas, bolsas y microplásticos afectando el ecosistema de tortugas marinas.',
                lat: 20.6296,
                lng: -87.0739,
                status: 'pendiente',
                userId: 1,
                userName: 'Administrador',
                image: '',
                imageType: 'default',
                adminNote: '',
                createdAt: '2024-11-20T14:00:00'
            },
            {
                id: 3,
                title: 'Blanqueamiento de corales en arrecife',
                category: 'coral',
                severity: 'alta',
                description: 'Se ha observado blanqueamiento significativo en el arrecife de coral. Aproximadamente el 40% de los corales muestran signos de estrés térmico.',
                lat: 20.4230,
                lng: -86.9223,
                status: 'revision',
                userId: 1,
                userName: 'Administrador',
                image: '',
                imageType: 'default',
                adminNote: 'Investigadores marinos notificados.',
                createdAt: '2024-11-22T09:15:00'
            },
            {
                id: 4,
                title: 'Pesca ilegal con redes de arrastre',
                category: 'pesca_ilegal',
                severity: 'critica',
                description: 'Se detectaron embarcaciones realizando pesca con redes de arrastre en zona protegida, destruyendo el fondo marino y capturando especies en peligro.',
                lat: 19.8968,
                lng: -90.3840,
                status: 'pendiente',
                userId: 1,
                userName: 'Administrador',
                image: '',
                imageType: 'default',
                adminNote: '',
                createdAt: '2024-11-25T16:45:00'
            },
            {
                id: 5,
                title: 'Contaminación por aguas residuales',
                category: 'contaminacion',
                severity: 'media',
                description: 'Descarga de aguas residuales sin tratamiento directamente al mar. El agua presenta coloración anormal y mal olor.',
                lat: 19.2115,
                lng: -96.1533,
                status: 'resuelto',
                userId: 1,
                userName: 'Administrador',
                image: '',
                imageType: 'default',
                adminNote: 'Problema resuelto. Se instaló sistema de tratamiento.',
                createdAt: '2024-10-10T08:00:00'
            },
            {
                id: 6,
                title: 'Disminución de población de tortugas',
                category: 'biodiversidad',
                severity: 'media',
                description: 'Los pescadores locales reportan una disminución notable en el avistamiento de tortugas marinas posiblemente por contaminación lumínica.',
                lat: 16.8531,
                lng: -99.8237,
                status: 'revision',
                userId: 1,
                userName: 'Administrador',
                image: '',
                imageType: 'default',
                adminNote: 'Estudio de impacto ambiental en curso.',
                createdAt: '2024-11-28T11:30:00'
            }
        ];
        localStorage.setItem('ods14_reports', JSON.stringify(sampleReports));
    }
}

function getUsers() { return JSON.parse(localStorage.getItem('ods14_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('ods14_users', JSON.stringify(u)); }
function getReports() { return JSON.parse(localStorage.getItem('ods14_reports') || '[]'); }
function saveReports(r) { localStorage.setItem('ods14_reports', JSON.stringify(r)); }
function getCurrentUser() { const u = localStorage.getItem('ods14_currentUser'); return u ? JSON.parse(u) : null; }
function setCurrentUser(u) { localStorage.setItem('ods14_currentUser', JSON.stringify(u)); }
function clearCurrentUser() { localStorage.removeItem('ods14_currentUser'); }

// Get the display image for a report
// Get the display image for a report (with fallback)
function getReportImage(report) {
    // If user uploaded their own photo, use it
    if (report.image && report.imageType === 'user') {
        return report.image;
    }
    // Otherwise return default for category
    return DEFAULT_CATEGORY_IMAGES[report.category] || DEFAULT_CATEGORY_IMAGES.otro;
}

// Handle broken images - automatically switch to SVG fallback
function setupImageFallbacks() {
    document.addEventListener('error', function (e) {
        if (e.target.tagName === 'IMG') return; // only for img tags handled separately
    }, true);
}

// Call after rendering report cards to fix broken bg images
function fixBrokenBackgrounds() {
    document.querySelectorAll('.report-card-image').forEach(el => {
        const bgImage = el.style.backgroundImage;
        if (!bgImage || bgImage === 'none') return;

        const url = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');

        // Skip data URIs (SVG/base64) - they always work
        if (url.startsWith('data:')) return;

        // Test if the image loads
        const img = new Image();
        img.onerror = () => {
            // Find category from the card
            const card = el.closest('.report-card');
            if (card) {
                const categoryBadge = card.querySelector('.category-badge');
                if (categoryBadge) {
                    const classes = categoryBadge.className;
                    const catMatch = classes.match(/cat-(\w+)/);
                    if (catMatch) {
                        const category = catMatch[1];
                        const fallback = FALLBACK_CATEGORY_IMAGES[category] || FALLBACK_CATEGORY_IMAGES.otro;
                        el.style.backgroundImage = `url('${fallback}')`;
                    }
                }
            }
        };
        img.src = url;
    });
}

// ========== LOADER ==========
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
        initApp();
    }, 1500);
});

// ========== INIT ==========
function initApp() {
    initData();
    createBubbles();
    checkAuth();
    setupScrollAnimations();
    setupNavbarScroll();
    setupDragDrop();
    updateHomeStats();
    renderRecentReports();
    renderReportsList();
    updateStats();

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userDropdown');
        const btn = document.getElementById('btnUserMenu');
        if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // URL preview listener
    const urlInput = document.getElementById('reportImageUrl');
    if (urlInput) {
        urlInput.addEventListener('input', debounce(function () {
            const url = this.value.trim();
            const preview = document.getElementById('urlPreview');
            const previewImg = document.getElementById('urlPreviewImg');
            if (url) {
                previewImg.src = url;
                previewImg.onload = () => { preview.style.display = 'block'; };
                previewImg.onerror = () => { preview.style.display = 'none'; };
            } else {
                preview.style.display = 'none';
            }
        }, 500));
    }
}

// ========== BUBBLES ==========
function createBubbles() {
    const container = document.getElementById('bubblesBg');
    for (let i = 0; i < 20; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        const size = Math.random() * 60 + 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + '%';
        bubble.style.animationDuration = (Math.random() * 15 + 10) + 's';
        bubble.style.animationDelay = (Math.random() * 10) + 's';
        container.appendChild(bubble);
    }
}

// ========== NAVBAR ==========
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
    });
}
function toggleNav() { document.getElementById('navMenu').classList.toggle('open'); }

// ========== DRAG & DROP ==========
function setupDragDrop() {
    const dropZone = document.getElementById('fileDropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        dropZone.addEventListener(evt, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    });
}

// ========== FILE HANDLING ==========
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
}

function processFile(file) {
    // Validate
    if (!file.type.startsWith('image/')) {
        showToast('Solo se permiten archivos de imagen', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen no debe superar 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImageData = e.target.result;
        // Show preview
        document.getElementById('dropZoneContent').style.display = 'none';
        const preview = document.getElementById('dropZonePreview');
        preview.style.display = 'block';
        document.getElementById('imagePreviewImg').src = uploadedImageData;
    };
    reader.readAsDataURL(file);
}

function removeUploadedImage(event) {
    event.stopPropagation();
    uploadedImageData = null;
    document.getElementById('dropZoneContent').style.display = 'block';
    document.getElementById('dropZonePreview').style.display = 'none';
    document.getElementById('imagePreviewImg').src = '';
    document.getElementById('reportImageFile').value = '';
}

function switchUploadTab(tab) {
    document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.upload-panel').forEach(p => p.classList.remove('active'));

    if (tab === 'file') {
        document.querySelector('.upload-tab:first-child').classList.add('active');
        document.getElementById('uploadFile').classList.add('active');
    } else {
        document.querySelector('.upload-tab:last-child').classList.add('active');
        document.getElementById('uploadUrl').classList.add('active');
    }
}

// ========== GEOLOCATION ==========
function useMyLocation() {
    if (!navigator.geolocation) {
        showToast('Tu navegador no soporta geolocalización', 'error');
        return;
    }

    const btn = document.querySelector('.btn-geolocation');
    const btnText = document.getElementById('geoButtonText');
    const spinner = document.getElementById('geoSpinner');

    btn.classList.add('locating');
    btnText.textContent = 'Obteniendo ubicación...';
    spinner.style.display = 'block';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            // Update map and marker
            if (reportMap) {
                reportMap.setView([lat, lng], 15);

                if (reportMarker) {
                    reportMarker.setLatLng([lat, lng]);
                } else {
                    reportMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div class="marker-pin" style="background:#059669"><i class="fas fa-map-pin"></i></div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15]
                        })
                    }).addTo(reportMap);
                }
            }

            // Update display
            document.getElementById('reportLat').textContent = lat.toFixed(6);
            document.getElementById('reportLng').textContent = lng.toFixed(6);
            document.getElementById('reportLatInput').value = lat;
            document.getElementById('reportLngInput').value = lng;

            // Reset button
            btn.classList.remove('locating');
            btnText.textContent = '✓ Ubicación obtenida';
            spinner.style.display = 'none';

            setTimeout(() => {
                btnText.textContent = 'Usar mi ubicación actual';
            }, 3000);

            showToast('Ubicación obtenida exitosamente', 'success');
        },
        (error) => {
            btn.classList.remove('locating');
            btnText.textContent = 'Usar mi ubicación actual';
            spinner.style.display = 'none';

            let msg = 'No se pudo obtener tu ubicación';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = 'Permiso de ubicación denegado. Habilítalo en tu navegador.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = 'Información de ubicación no disponible';
                    break;
                case error.TIMEOUT:
                    msg = 'Tiempo de espera agotado para obtener ubicación';
                    break;
            }
            showToast(msg, 'error');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ========== SECTIONS ==========
function showSection(sectionName) {
    document.getElementById('navMenu').classList.remove('open');
    document.getElementById('userDropdown').classList.remove('show');

    const protectedSections = ['myreports', 'profile', 'admin'];
    if (protectedSections.includes(sectionName) && !getCurrentUser()) {
        openModal('loginModal');
        return;
    }
    if (sectionName === 'admin' && (!getCurrentUser() || getCurrentUser().role !== 'admin')) {
        showToast('Acceso denegado', 'error');
        return;
    }

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const sectionId = 'section' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
    if (activeLink) activeLink.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setupScrollAnimations(), 100);

    // Toggle FAB button visibility
    const fab = document.getElementById('fabButton');
    if (fab) {
        const showFabSections = ['home', 'reports', 'map'];
        if (showFabSections.includes(sectionName) && getCurrentUser()) {
            fab.classList.remove('hidden');
        } else {
            fab.classList.add('hidden');
        }
    }

    if (sectionName === 'map') setTimeout(() => initMainMap(), 200);
    if (sectionName === 'reports') renderReportsList();
    if (sectionName === 'myreports') renderMyReports();
    if (sectionName === 'profile') renderProfile();
    if (sectionName === 'admin') { renderAdminReports(); renderAdminUsers(); renderAdminOverview(); }
    if (sectionName === 'stats') { updateStats(); renderCharts(); }
    if (sectionName === 'home') { updateHomeStats(); renderRecentReports(); }
}

// ========== SCROLL ANIMATIONS ==========
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

// ========== AUTH ==========
function checkAuth() {
    const user = getCurrentUser();
    if (user) showLoggedInUI(user);
    else showLoggedOutUI();
}

function showLoggedInUI(user) {
    document.getElementById('btnLogin').style.display = 'none';
    document.getElementById('btnUserMenu').style.display = 'flex';
    document.getElementById('userAvatarNav').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('userNameNav').textContent = user.name;
    document.getElementById('adminLink').style.display = user.role === 'admin' ? 'flex' : 'none';
}

function showLoggedOutUI() {
    document.getElementById('btnLogin').style.display = 'flex';
    document.getElementById('btnUserMenu').style.display = 'none';
    document.getElementById('adminLink').style.display = 'none';
}

function toggleUserDropdown() { document.getElementById('userDropdown').classList.toggle('show'); }

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Verificar si el usuario está baneado
        if (user.banned) {
            showToast('Tu cuenta ha sido suspendida. Contacta al administrador.', 'error');
            return;
        }
        setCurrentUser(user);
        showLoggedInUI(user);
        closeModal('loginModal');
        showToast('¡Bienvenido, ' + user.name + '!', 'success');
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        showToast('Credenciales incorrectas', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const lastname = document.getElementById('regLastname').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;

    if (password !== password2) { showToast('Las contraseñas no coinciden', 'error'); return; }

    const users = getUsers();
    if (users.find(u => u.email === email)) { showToast('El correo ya está registrado', 'error'); return; }

    const newUser = { id: Date.now(), email, password, name, lastname, role: 'user', createdAt: new Date().toISOString() };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    showLoggedInUI(newUser);
    closeModal('registerModal');
    showToast('¡Cuenta creada exitosamente!', 'success');

    document.getElementById('regName').value = '';
    document.getElementById('regLastname').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('regPassword2').value = '';
    updateHomeStats();
}

function logout() {
    clearCurrentUser();
    showLoggedOutUI();
    showSection('home');
    showToast('Sesión cerrada', 'info');
    document.getElementById('userDropdown').classList.remove('show');
}

// ========== MODALS ==========
function openModal(id) {
    document.getElementById(id).classList.add('show');
    document.body.style.overflow = 'hidden';
    if (id === 'reportModal') {
        setTimeout(() => {
            initReportMap();
            setupDragDrop();
        }, 200);
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = '';
}

function switchModal(from, to) {
    closeModal(from);
    setTimeout(() => openModal(to), 200);
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');
    if (input.type === 'password') { input.type = 'text'; if (icon) icon.className = 'fas fa-eye-slash'; }
    else { input.type = 'password'; if (icon) icon.className = 'fas fa-eye'; }
}

// ========== REPORT MAP ==========
let reportMap, reportMarker;

function initReportMap() {
    const container = document.getElementById('reportMap');
    if (!container) return;
    if (reportMap) { reportMap.remove(); reportMap = null; }

    reportMap = L.map('reportMap').setView([20.0, -99.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(reportMap);
    reportMarker = null;

    reportMap.on('click', function (e) {
        const { lat, lng } = e.latlng;
        if (reportMarker) {
            reportMarker.setLatLng(e.latlng);
        } else {
            reportMarker = L.marker(e.latlng, {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '<div class="marker-pin" style="background:#3b82f6"><i class="fas fa-map-pin"></i></div>',
                    iconSize: [30, 30], iconAnchor: [15, 15]
                })
            }).addTo(reportMap);
        }
        document.getElementById('reportLat').textContent = lat.toFixed(6);
        document.getElementById('reportLng').textContent = lng.toFixed(6);
        document.getElementById('reportLatInput').value = lat;
        document.getElementById('reportLngInput').value = lng;
    });

    setTimeout(() => reportMap.invalidateSize(), 300);
}

// ========== SUBMIT REPORT ==========
function handleNewReportSubmit(e) {
    e.preventDefault();

    const lat = document.getElementById('reportLatInput').value;
    const lng = document.getElementById('reportLngInput').value;

    if (!lat || !lng) { showToast('Selecciona una ubicación en el mapa o usa tu ubicación actual', 'warning'); return; }

    const user = getCurrentUser();
    const reports = getReports();
    const category = document.getElementById('reportCategory').value;

    // Determine image
    let finalImage = '';
    let imageType = 'default';

    // Check uploaded file first
    if (uploadedImageData) {
        finalImage = uploadedImageData;
        imageType = 'user';
    }
    // Then check URL
    else {
        const urlInput = document.getElementById('reportImageUrl');
        if (urlInput && urlInput.value.trim()) {
            finalImage = urlInput.value.trim();
            imageType = 'user';
        }
    }

    const newReport = {
        id: Date.now(),
        title: document.getElementById('reportTitle').value.trim(),
        category: category,
        severity: document.getElementById('reportSeverity').value,
        description: document.getElementById('reportDescription').value.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        status: 'pendiente',
        userId: user.id,
        userName: user.name + ' ' + (user.lastname || ''),
        image: finalImage,
        imageType: imageType,
        adminNote: '',
        createdAt: new Date().toISOString()
    };

    reports.push(newReport);
    saveReports(reports);
    closeModal('reportModal');
    showToast('¡Reporte enviado exitosamente!', 'success');

    // Reset form
    document.getElementById('reportTitle').value = '';
    document.getElementById('reportCategory').value = '';
    document.getElementById('reportSeverity').value = '';
    document.getElementById('reportDescription').value = '';
    document.getElementById('reportImageUrl').value = '';
    document.getElementById('reportLatInput').value = '';
    document.getElementById('reportLngInput').value = '';
    document.getElementById('reportLat').textContent = '-';
    document.getElementById('reportLng').textContent = '-';
    document.getElementById('urlPreview').style.display = 'none';
    removeUploadedImage(new Event('click'));
    uploadedImageData = null;

    if (reportMarker) { reportMap.removeLayer(reportMarker); reportMarker = null; }

    renderReportsList();
    renderRecentReports();
    updateHomeStats();
    updateStats();
}

function handleNewReport() {
    if (!getCurrentUser()) { openModal('loginModal'); showToast('Inicia sesión para crear un reporte', 'warning'); return; }
    openModal('reportModal');
}

// ========== RENDER REPORTS ==========
function renderReportsList() {
    const container = document.getElementById('reportsList');
    const reports = getReports();
    const search = (document.getElementById('searchReports')?.value || '').toLowerCase();
    const catFilter = document.getElementById('filterCategory')?.value || '';
    const statusFilter = document.getElementById('filterStatus')?.value || '';

    let filtered = reports.filter(r => {
        return (r.title.toLowerCase().includes(search) || r.description.toLowerCase().includes(search))
            && (!catFilter || r.category === catFilter)
            && (!statusFilter || r.status === statusFilter);
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-inbox"></i><h3>No se encontraron reportes</h3><p>Intenta con otros filtros o crea un nuevo reporte</p></div>`;
        return;
    }
    container.innerHTML = filtered.map(r => createReportCard(r)).join('');

    // Fix broken background images after render
    setTimeout(() => fixBrokenBackgrounds(), 100);
}

function renderRecentReports() {
    const container = document.getElementById('recentReportsHome');
    const reports = getReports().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

    if (reports.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-water"></i><h3>Aún no hay reportes</h3><p>Sé el primero en reportar una amenaza marina</p></div>`;
        return;
    }
    container.innerHTML = reports.map(r => createReportCard(r)).join('');

    // Fix broken background images after render
    setTimeout(() => fixBrokenBackgrounds(), 100);
}

function filterReports() { renderReportsList(); }

function renderRecentReports() {
    const container = document.getElementById('recentReportsHome');
    const reports = getReports().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

    if (reports.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-water"></i><h3>Aún no hay reportes</h3><p>Sé el primero en reportar una amenaza marina</p></div>`;
        return;
    }
    container.innerHTML = reports.map(r => createReportCard(r)).join('');
}

function createReportCard(report) {
    const date = new Date(report.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
    const displayImage = getReportImage(report);
    const isUserPhoto = report.imageType === 'user' && report.image;

    const photoBadge = isUserPhoto
        ? `<span class="photo-badge"><i class="fas fa-camera"></i> Foto del usuario</span>`
        : `<span class="photo-badge"><i class="fas fa-image"></i> Imagen referencial</span>`;

    return `
        <div class="report-card" onclick="viewReport(${report.id})">
            <div class="report-card-image" style="background-image: url('${displayImage}')">
                <span class="category-badge cat-${report.category}">${CATEGORY_LABELS[report.category] || report.category}</span>
                <span class="severity-badge sev-${report.severity}">${SEVERITY_LABELS[report.severity] || report.severity}</span>
                ${photoBadge}
            </div>
            <div class="report-card-body">
                <h3>${escapeHtml(report.title)}</h3>
                <p>${escapeHtml(report.description)}</p>
                <div class="report-card-footer">
                    <span class="status-tag status-${report.status}">${STATUS_LABELS[report.status]}</span>
                    <span class="date"><i class="fas fa-calendar"></i> ${date}</span>
                </div>
            </div>
        </div>`;
}

function viewReport(id) {
    const reports = getReports();
    const r = reports.find(rep => rep.id === id);
    if (!r) return;

    const date = new Date(r.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const displayImage = getReportImage(r);
    const isUserPhoto = r.imageType === 'user' && r.image;
    const photoLabel = isUserPhoto
        ? '<i class="fas fa-camera"></i> Fotografía del usuario'
        : '<i class="fas fa-image"></i> Imagen referencial de la categoría';

    // Use a test image load with fallback
    const fallbackImage = FALLBACK_CATEGORY_IMAGES[r.category] || FALLBACK_CATEGORY_IMAGES.otro;

    let html = `
        <div class="view-report-header">
            <h2>${escapeHtml(r.title)}</h2>
            <div class="view-report-badges">
                <span class="category-badge cat-${r.category}" style="padding:6px 14px;border-radius:20px;font-size:0.8rem;color:white">${CATEGORY_LABELS[r.category]}</span>
                <span class="status-tag status-${r.status}" style="padding:6px 14px">${STATUS_LABELS[r.status]}</span>
                <span class="severity-badge sev-${r.severity}" style="padding:6px 14px;border-radius:20px">${SEVERITY_LABELS[r.severity]}</span>
            </div>
        </div>
        <div class="view-report-image" id="viewReportImage" style="background-image:url('${displayImage}')" data-fallback="${fallbackImage}">
            <span class="photo-type-badge">${photoLabel}</span>
        </div>
        <div class="view-report-info">
            <div class="view-report-info-item"><label>Reportado por</label><span>${escapeHtml(r.userName)}</span></div>
            <div class="view-report-info-item"><label>Fecha</label><span>${date}</span></div>
            <div class="view-report-info-item"><label>Latitud</label><span>${r.lat.toFixed(6)}</span></div>
            <div class="view-report-info-item"><label>Longitud</label><span>${r.lng.toFixed(6)}</span></div>
        </div>
        <div class="view-report-description"><h4>Descripción</h4><p>${escapeHtml(r.description)}</p></div>
        <div id="viewReportMapContainer" class="view-report-map"></div>`;

    if (r.adminNote) {
        html += `<div class="admin-note"><h4><i class="fas fa-shield-alt"></i> Nota del Administrador</h4><p>${escapeHtml(r.adminNote)}</p></div>`;
    }

    document.getElementById('viewReportContent').innerHTML = html;
    openModal('viewReportModal');

    // Test image and apply fallback if needed
    if (!isUserPhoto && !displayImage.startsWith('data:')) {
        const testImg = new Image();
        testImg.onerror = () => {
            const el = document.getElementById('viewReportImage');
            if (el) el.style.backgroundImage = `url('${fallbackImage}')`;
        };
        testImg.src = displayImage;
    }

    setTimeout(() => {
        const viewMap = L.map('viewReportMapContainer').setView([r.lat, r.lng], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(viewMap);
        const color = CATEGORY_COLORS[r.category] || '#6b7280';
        L.marker([r.lat, r.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-pin" style="background:${color}"><i class="fas fa-exclamation"></i></div>`,
                iconSize: [30, 30], iconAnchor: [15, 15]
            })
        }).addTo(viewMap);
        setTimeout(() => viewMap.invalidateSize(), 200);
    }, 300);
}

function renderMyReports() {
    const user = getCurrentUser();
    if (!user) return;
    const container = document.getElementById('myReportsList');
    const reports = getReports().filter(r => r.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (reports.length === 0) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-file-alt"></i><h3>No has creado reportes</h3><p>Crea tu primer reporte para contribuir</p><button class="btn btn-primary" onclick="handleNewReport()" style="margin-top:16px"><i class="fas fa-plus"></i> Crear Reporte</button></div>`;
        return;
    }
    container.innerHTML = reports.map(r => createReportCard(r)).join('');

    // Fix broken background images after render
    setTimeout(() => fixBrokenBackgrounds(), 100);
}

// ========== MAIN MAP ==========
let mainMap;

function initMainMap() {
    const container = document.getElementById('mainMap');
    if (!container) return;
    if (mainMap) { mainMap.remove(); mainMap = null; }

    mainMap = L.map('mainMap').setView([20.0, -99.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mainMap);

    getReports().forEach(r => {
        const color = CATEGORY_COLORS[r.category] || '#6b7280';
        const marker = L.marker([r.lat, r.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: `<div class="marker-pin" style="background:${color}"><i class="fas fa-exclamation"></i></div>`,
                iconSize: [30, 30], iconAnchor: [15, 15]
            })
        }).addTo(mainMap);

        marker.bindPopup(`
            <div style="min-width:200px">
                <strong style="font-size:14px">${escapeHtml(r.title)}</strong><br>
                <span style="color:#666;font-size:12px">${CATEGORY_LABELS[r.category]}</span><br>
                <span style="font-size:12px">Estado: ${STATUS_LABELS[r.status]}</span><br>
                <button onclick="viewReport(${r.id})" style="margin-top:8px;padding:4px 12px;background:#0369a1;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px">Ver detalle</button>
            </div>`);
    });

    setTimeout(() => mainMap.invalidateSize(), 300);
}

// ========== STATS ==========
function updateHomeStats() {
    const reports = getReports();
    const users = getUsers();
    animateCounter('statReports', reports.length);
    animateCounter('statUsers', users.length);
    animateCounter('statResolved', reports.filter(r => r.status === 'resuelto').length);

    // Calcular regiones únicas basadas en coordenadas aproximadas
    const uniqueRegions = new Set();
    reports.forEach(r => {
        if (r.lat && r.lng) {
            // Agrupar por región aproximada (redondear coordenadas)
            const region = `${Math.floor(r.lat)},${Math.floor(r.lng)}`;
            uniqueRegions.add(region);
        }
    });
    animateCounter('statRegions', uniqueRegions.size || reports.length > 0 ? Math.min(uniqueRegions.size || 1, 12) : 0);
}

function updateStats() {
    const reports = getReports();
    const users = getUsers();

    // Basic stats
    document.getElementById('totalReportsStat').textContent = reports.length;
    document.getElementById('resolvedStat').textContent = reports.filter(r => r.status === 'resuelto').length;
    document.getElementById('pendingStat').textContent = reports.filter(r => r.status === 'pendiente').length;
    document.getElementById('criticalStat').textContent = reports.filter(r => r.severity === 'critica').length;

    // Impact section
    const resolved = reports.filter(r => r.status === 'resuelto').length;
    const resolutionRate = reports.length > 0 ? Math.round((resolved / reports.length) * 100) : 0;
    const impactScore = document.getElementById('impactScore');
    if (impactScore) impactScore.textContent = resolutionRate + '%';

    // Reports this month
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyReports = reports.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const impactReports = document.getElementById('impactReports');
    if (impactReports) impactReports.textContent = monthlyReports;

    // Active reports (pendiente + revision + proceso)
    const activeReports = reports.filter(r => ['pendiente', 'revision', 'proceso'].includes(r.status)).length;
    const impactActive = document.getElementById('impactActive');
    if (impactActive) impactActive.textContent = activeReports;

    renderCharts();
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    let current = 0;
    const step = target / (1500 / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        element.textContent = Math.floor(current);
    }, 16);
}

function renderCharts() {
    const reports = getReports();

    // Category chart
    const catContainer = document.getElementById('categoryChart');
    const catCounts = {};
    reports.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const maxCat = Math.max(...Object.values(catCounts), 1);
    let catHtml = '<div class="chart-bar-container">';
    for (const [cat, count] of Object.entries(catCounts)) {
        catHtml += `<div class="chart-bar-row"><div class="chart-bar-label">${CATEGORY_LABELS[cat] || cat}</div><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${count / maxCat * 100}%;background:${CATEGORY_COLORS[cat] || '#6b7280'}">${count}</div></div></div>`;
    }
    catContainer.innerHTML = catHtml + '</div>';

    // Status chart
    const statusContainer = document.getElementById('statusChart');
    const statusCounts = {};
    const statusColors = { pendiente: '#f59e0b', revision: '#3b82f6', proceso: '#8b5cf6', resuelto: '#10b981' };
    reports.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    const maxStatus = Math.max(...Object.values(statusCounts), 1);
    let statusHtml = '<div class="chart-bar-container">';
    for (const [status, count] of Object.entries(statusCounts)) {
        statusHtml += `<div class="chart-bar-row"><div class="chart-bar-label">${STATUS_LABELS[status] || status}</div><div class="chart-bar-track"><div class="chart-bar-fill" style="width:${count / maxStatus * 100}%;background:${statusColors[status] || '#6b7280'}">${count}</div></div></div>`;
    }
    statusContainer.innerHTML = statusHtml + '</div>';
}

// ========== PROFILE ==========
function renderProfile() {
    const user = getCurrentUser();
    if (!user) return;
    document.getElementById('profileAvatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = user.name + ' ' + (user.lastname || '');
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileBadge').textContent = user.role === 'admin' ? '👑 Administrador' : '👤 Usuario';
    document.getElementById('profileReports').textContent = getReports().filter(r => r.userId === user.id).length;
    document.getElementById('profileDate').textContent = new Date(user.createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' });
}

// ========== ADMIN ==========
function switchAdminTab(tabId) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.closest('.admin-tab').classList.add('active');
    if (tabId === 'adminReports') renderAdminReports();
    if (tabId === 'adminUsers') renderAdminUsers();
    if (tabId === 'adminOverview') renderAdminOverview();
}

function renderAdminReports() {
    const tbody = document.getElementById('adminReportsTable');
    const reports = getReports();
    const search = (document.getElementById('adminSearchReports')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('adminFilterStatus')?.value || '';

    let filtered = reports.filter(r => {
        return (r.title.toLowerCase().includes(search) || r.userName.toLowerCase().includes(search))
            && (!statusFilter || r.status === statusFilter);
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    tbody.innerHTML = filtered.map(r => {
        const date = new Date(r.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' });
        const hasPhoto = r.imageType === 'user' ? '<i class="fas fa-camera" style="color:#34d399;margin-left:4px" title="Con foto"></i>' : '';
        return `<tr>
            <td>#${r.id.toString().slice(-4)}</td>
            <td>${escapeHtml(r.title.substring(0, 30))}${r.title.length > 30 ? '...' : ''}${hasPhoto}</td>
            <td><span class="category-badge cat-${r.category}" style="padding:3px 8px;border-radius:10px;font-size:0.7rem;color:white">${(CATEGORY_LABELS[r.category] || '').split(' ')[1] || r.category}</span></td>
            <td>${escapeHtml(r.userName)}</td>
            <td>${date}</td>
            <td><span class="status-tag status-${r.status}" style="padding:3px 10px;font-size:0.75rem">${STATUS_LABELS[r.status]}</span></td>
            <td class="actions-cell">
                <button class="action-btn action-btn-view" onclick="viewReport(${r.id})" title="Ver"><i class="fas fa-eye"></i></button>
                <button class="action-btn action-btn-edit" onclick="openEditReport(${r.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn action-btn-delete" onclick="deleteReport(${r.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td></tr>`;
    }).join('');
}

function filterAdminReports() { renderAdminReports(); }

function openEditReport(id) {
    const r = getReports().find(rep => rep.id === id);
    if (!r) return;
    document.getElementById('editReportId').value = r.id;
    document.getElementById('editTitle').value = r.title;
    document.getElementById('editCategory').value = r.category;
    document.getElementById('editStatus').value = r.status;
    document.getElementById('editSeverity').value = r.severity;
    document.getElementById('editDescription').value = r.description;
    document.getElementById('editAdminNote').value = r.adminNote || '';
    openModal('editReportModal');
}

function handleEditReport(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editReportId').value);
    const reports = getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) return;

    reports[idx].title = document.getElementById('editTitle').value.trim();
    reports[idx].category = document.getElementById('editCategory').value;
    reports[idx].status = document.getElementById('editStatus').value;
    reports[idx].severity = document.getElementById('editSeverity').value;
    reports[idx].description = document.getElementById('editDescription').value.trim();
    reports[idx].adminNote = document.getElementById('editAdminNote').value.trim();

    saveReports(reports);
    closeModal('editReportModal');
    showToast('Reporte actualizado', 'success');
    renderAdminReports(); renderReportsList(); renderRecentReports(); updateStats(); updateHomeStats();
}

function deleteReport(id) {
    if (!confirm('¿Estás seguro de eliminar este reporte?')) return;
    let reports = getReports().filter(r => r.id !== id);
    saveReports(reports);
    showToast('Reporte eliminado', 'warning');
    renderAdminReports(); renderReportsList(); renderRecentReports(); updateStats(); updateHomeStats(); renderAdminOverview();
}

function renderAdminUsers() {
    const tbody = document.getElementById('adminUsersTable');
    const users = getUsers();
    const reports = getReports();
    const search = (document.getElementById('adminSearchUsers')?.value || '').toLowerCase();

    let filtered = users.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));

    tbody.innerHTML = filtered.map(u => {
        const userReports = reports.filter(r => r.userId === u.id).length;
        const date = new Date(u.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
        const roleStyle = u.role === 'admin' ? 'background:rgba(245,158,11,0.15);color:#fbbf24' : 'background:rgba(59,130,246,0.15);color:#60a5fa';
        const bannedStyle = u.banned ? 'opacity:0.5;text-decoration:line-through' : '';
        const bannedBadge = u.banned ? '<span style="padding:2px 8px;background:#ef4444;color:white;border-radius:10px;font-size:0.7rem;margin-left:8px;">BANEADO</span>' : '';

        let actions = '';
        if (u.role !== 'admin') {
            if (u.banned) {
                actions = `<button class="action-btn action-btn-view" onclick="unbanUser(${u.id})" title="Desbanear"><i class="fas fa-user-check"></i></button>
                    <button class="action-btn action-btn-delete" onclick="deleteUser(${u.id})" title="Eliminar"><i class="fas fa-trash"></i></button>`;
            } else {
                actions = `<button class="action-btn action-btn-edit" onclick="banUser(${u.id})" title="Banear" style="background:rgba(239,68,68,0.2);color:#f87171"><i class="fas fa-user-slash"></i></button>
                    <button class="action-btn action-btn-delete" onclick="deleteUser(${u.id})" title="Eliminar"><i class="fas fa-trash"></i></button>`;
            }
        } else {
            actions = '<span style="color:var(--gray);font-size:0.8rem">Admin</span>';
        }

        return `<tr style="${bannedStyle}">
            <td><div class="user-avatar" style="width:32px;height:32px;font-size:0.8rem;${u.banned ? 'background:#ef4444' : ''}">${u.name.charAt(0).toUpperCase()}</div></td>
            <td>${escapeHtml(u.name)} ${escapeHtml(u.lastname || '')}${bannedBadge}</td>
            <td>${escapeHtml(u.email)}</td>
            <td><span style="padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;${roleStyle}">${u.role === 'admin' ? 'Admin' : 'Usuario'}</span></td>
            <td>${userReports}</td><td>${date}</td>
            <td class="actions-cell">${actions}</td></tr>`;
    }).join('');
}

function deleteUser(id) {
    const user = getUsers().find(u => u.id === id);
    showConfirmModal(
        'Eliminar Usuario',
        `¿Eliminar permanentemente a "${user?.name || 'este usuario'}"? Esta acción no se puede deshacer.`,
        () => {
            saveUsers(getUsers().filter(u => u.id !== id));
            showToast('Usuario eliminado permanentemente', 'warning');
            renderAdminUsers(); renderAdminOverview(); updateHomeStats();
        },
        'danger'
    );
}

function banUser(id) {
    const user = getUsers().find(u => u.id === id);
    showConfirmModal(
        'Banear Usuario',
        `¿Banear a "${user?.name || 'este usuario'}"? No podrá iniciar sesión hasta que sea desbaneado.`,
        () => {
            const users = getUsers();
            const u = users.find(us => us.id === id);
            if (u) {
                u.banned = true;
                u.bannedAt = new Date().toISOString();
                saveUsers(users);
                showToast(`Usuario "${u.name}" ha sido baneado`, 'warning');
                renderAdminUsers();
            }
        },
        'warning'
    );
}

function unbanUser(id) {
    const user = getUsers().find(u => u.id === id);
    showConfirmModal(
        'Desbanear Usuario',
        `¿Desbanear a "${user?.name || 'este usuario'}"? Podrá volver a iniciar sesión.`,
        () => {
            const users = getUsers();
            const u = users.find(us => us.id === id);
            if (u) {
                u.banned = false;
                delete u.bannedAt;
                saveUsers(users);
                showToast(`Usuario "${u.name}" ha sido desbaneado`, 'success');
                renderAdminUsers();
            }
        },
        'success'
    );
}

function renderAdminOverview() {
    const reports = getReports();
    const users = getUsers();
    document.getElementById('overviewTotal').textContent = reports.length;
    document.getElementById('overviewResolved').textContent = reports.filter(r => r.status === 'resuelto').length;
    document.getElementById('overviewPending').textContent = reports.filter(r => r.status === 'pendiente').length;
    document.getElementById('overviewUsers').textContent = users.length;

    const activityList = document.getElementById('activityList');
    const recent = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

    if (recent.length === 0) {
        activityList.innerHTML = '<p style="color:var(--gray);text-align:center;padding:20px;">No hay actividad reciente</p>';
        return;
    }

    activityList.innerHTML = recent.map(r => {
        const time = getTimeAgo(r.createdAt);
        const iconBg = r.status === 'resuelto' ? 'background:rgba(16,185,129,0.2);color:#34d399' : r.status === 'pendiente' ? 'background:rgba(245,158,11,0.2);color:#fbbf24' : 'background:rgba(59,130,246,0.2);color:#60a5fa';
        const photoIcon = r.imageType === 'user' ? ' 📷' : '';
        return `<div class="activity-item"><div class="activity-icon" style="${iconBg}"><i class="fas fa-file-alt"></i></div><div class="activity-text"><strong>${escapeHtml(r.userName)}</strong> creó: "${escapeHtml(r.title.substring(0, 35))}${r.title.length > 35 ? '...' : ''}"${photoIcon}</div><div class="activity-time">${time}</div></div>`;
    }).join('');
}

// ========== TOAST ==========
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${icons[type]}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
    }, duration);
}

// ========== CONFIRMATION MODAL ==========
let confirmCallback = null;

function showConfirmModal(title, message, callback, type = 'warning') {
    confirmCallback = callback;
    const modal = document.getElementById('confirmModal');
    const iconEl = document.getElementById('confirmIcon');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const actionBtn = document.getElementById('confirmAction');

    titleEl.textContent = title;
    messageEl.textContent = message;

    // Set icon and colors based on type
    const styles = {
        warning: { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: 'fa-exclamation-triangle' },
        danger: { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: 'fa-trash-alt' },
        info: { bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: 'fa-info-circle' },
        success: { bg: 'linear-gradient(135deg,#10b981,#047857)', icon: 'fa-check-circle' }
    };

    const style = styles[type] || styles.warning;
    iconEl.style.background = style.bg;
    iconEl.innerHTML = `<i class="fas ${style.icon}"></i>`;
    actionBtn.style.background = style.bg;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
    document.body.style.overflow = '';
    confirmCallback = null;
}

// Bind confirm action button
document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirmAction');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            if (confirmCallback) {
                confirmCallback();
                closeConfirmModal();
            }
        };
    }
});

// ========== EXPORT TO CSV ==========
function exportReportsToCSV() {
    const reports = getReports();
    if (reports.length === 0) {
        showToast('No hay reportes para exportar', 'warning');
        return;
    }

    const headers = ['ID', 'Titulo', 'Categoria', 'Severidad', 'Estado', 'Usuario', 'Fecha', 'Latitud', 'Longitud', 'Descripcion'];
    const rows = reports.map(r => [
        r.id,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        CATEGORY_LABELS[r.category] || r.category,
        SEVERITY_LABELS[r.severity] || r.severity,
        STATUS_LABELS[r.status] || r.status,
        `"${(r.userName || '').replace(/"/g, '""')}"`,
        new Date(r.createdAt).toLocaleString('es'),
        r.lat || '',
        r.lng || '',
        `"${(r.description || '').replace(/"/g, '""').substring(0, 200)}${r.description?.length > 200 ? '...' : ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ODS14_Reportes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${reports.length} reportes exportados a CSV`, 'success');
}

// ========== UTILS ==========
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getTimeAgo(dateStr) {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} d`;
    return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}