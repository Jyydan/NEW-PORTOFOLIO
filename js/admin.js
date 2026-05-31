// ═══════════════════════════════════════════════
// ═══ ADMIN PANEL ═══
// ═══════════════════════════════════════════════

class AdminPanel {
    constructor() {
        this.password = 'Anthropic87!';
        this.isAuthenticated = sessionStorage.getItem('portfolio_admin_auth') === 'true';
        this.currentImageBase64 = '';
        this.currentDocImages = [];

        this.initDOM();
        this.bindEvents();
        this.checkAuth();
    }

    initDOM() {
        this.overlay = document.getElementById('admin-overlay');
        this.loginScreen = document.getElementById('admin-login');
        this.dashboard = document.getElementById('admin-dashboard');
        this.passwordInput = document.getElementById('admin-password');
        this.loginBtn = document.getElementById('admin-login-btn');
        this.loginError = document.getElementById('admin-login-error');
        this.closeBtn = document.getElementById('admin-close');

        // Tabs
        this.tabBtns = document.querySelectorAll('.admin-tab');
        this.tabContents = document.querySelectorAll('.admin-tab-content');

        // Projects
        this.projectList = document.getElementById('admin-project-list');
        this.addBtn = document.getElementById('admin-add-btn');

        // Form Modal
        this.formOverlay = document.getElementById('admin-form-overlay');
        this.form = document.getElementById('admin-form');
        this.formClose = document.getElementById('admin-form-close');
        this.formCancel = document.getElementById('admin-form-cancel');
        this.formSave = document.getElementById('admin-form-save');
        this.formTitle = document.getElementById('admin-form-title');

        // Main Image Upload
        this.imageZone = document.getElementById('project-image-zone');
        this.imageInput = document.getElementById('project-image-input');
        this.imagePreview = document.getElementById('project-image-preview');

        // Multi-Image Upload
        this.multiImageZone = document.getElementById('multi-image-zone');
        this.multiImageInput = document.getElementById('multi-image-input');
        this.multiImagePreview = document.getElementById('multi-image-preview');

        // Profile
        this.profileUpload = document.getElementById('admin-profile-upload');
        this.profileInput = document.getElementById('profile-file-input');
        this.profileChangeBtn = document.getElementById('profile-change-btn');
        this.profileDeleteBtn = document.getElementById('profile-delete-btn');

        // CV
        this.cvCurrentInfo = document.getElementById('cv-current-info');
        this.cvUploadZone = document.getElementById('cv-upload-zone');
        this.cvFileInput = document.getElementById('cv-file-input');

        // Export/Import
        this.exportBtn = document.getElementById('admin-export-btn');
        this.importBtn = document.getElementById('admin-import-btn');
        this.importInput = document.getElementById('import-file-input');
    }

    bindEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.open();
            }
            if (e.key === 'Escape') {
                if (this.formOverlay?.classList.contains('active')) this.closeForm();
                else if (this.overlay?.classList.contains('active')) this.close();
            }
        });

        // Hash
        const checkHash = () => {
            if (window.location.hash === '#admin') {
                this.open();
                history.replaceState(null, null, ' ');
            }
        };
        window.addEventListener('hashchange', checkHash);
        checkHash();

        // Close
        this.closeBtn?.addEventListener('click', () => this.close());

        // Login
        this.loginBtn?.addEventListener('click', () => this.login());
        this.passwordInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        // Tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Add Project
        this.addBtn?.addEventListener('click', () => this.openForm());

        // Form
        this.formClose?.addEventListener('click', () => this.closeForm());
        this.formCancel?.addEventListener('click', (e) => { e.preventDefault(); this.closeForm(); });
        this.formSave?.addEventListener('click', (e) => { e.preventDefault(); this.saveProjectForm(); });

        // Main Image Upload
        if (this.imageZone) {
            this.imageZone.addEventListener('click', () => this.imageInput?.click());
            this.imageZone.addEventListener('dragover', (e) => { e.preventDefault(); this.imageZone.classList.add('dragover'); });
            this.imageZone.addEventListener('dragleave', () => this.imageZone.classList.remove('dragover'));
            this.imageZone.addEventListener('drop', (e) => {
                e.preventDefault(); this.imageZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) this.handleMainImage(e.dataTransfer.files[0]);
            });
        }
        this.imageInput?.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleMainImage(e.target.files[0]);
        });

        // Multi-Image Upload
        if (this.multiImageZone) {
            this.multiImageZone.addEventListener('click', () => this.multiImageInput?.click());
            this.multiImageZone.addEventListener('dragover', (e) => { e.preventDefault(); this.multiImageZone.classList.add('dragover'); });
            this.multiImageZone.addEventListener('dragleave', () => this.multiImageZone.classList.remove('dragover'));
            this.multiImageZone.addEventListener('drop', (e) => {
                e.preventDefault(); this.multiImageZone.classList.remove('dragover');
                this.handleMultiImages(e.dataTransfer.files);
            });
        }
        this.multiImageInput?.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleMultiImages(e.target.files);
        });

        // Profile
        this.profileUpload?.addEventListener('click', () => this.profileInput?.click());
        this.profileChangeBtn?.addEventListener('click', () => this.profileInput?.click());
        this.profileInput?.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleProfileUpload(e.target.files[0]);
        });
        this.profileDeleteBtn?.addEventListener('click', () => this.deleteProfile());

        // CV
        if (this.cvUploadZone) {
            this.cvUploadZone.addEventListener('click', () => this.cvFileInput?.click());
            this.cvUploadZone.addEventListener('dragover', (e) => { e.preventDefault(); this.cvUploadZone.classList.add('dragover'); });
            this.cvUploadZone.addEventListener('dragleave', () => this.cvUploadZone.classList.remove('dragover'));
            this.cvUploadZone.addEventListener('drop', (e) => {
                e.preventDefault(); this.cvUploadZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) this.handleCVUpload(e.dataTransfer.files[0]);
            });
        }
        this.cvFileInput?.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleCVUpload(e.target.files[0]);
        });

        // Export/Import
        this.exportBtn?.addEventListener('click', () => {
            DataManager.exportData();
            this.showToast('Data berhasil di-export');
        });
        this.importBtn?.addEventListener('click', () => this.importInput?.click());
        this.importInput?.addEventListener('change', (e) => {
            if (e.target.files.length) {
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    const success = await DataManager.importData(ev.target.result);
                    if (success) {
                        this.showToast('Data berhasil diimport');
                        this.renderProjectList();
                        this.updateProfilePreview();
                        this.renderCVInfo();
                        window.renderProjects?.();
                        window.renderProfileImage?.();
                    } else {
                        alert('Gagal mengimport data. Format JSON tidak valid.');
                    }
                };
                reader.readAsText(e.target.files[0]);
            }
        });
    }

    // ─── Auth ───
    open() {
        if (!this.overlay) return;
        this.overlay.classList.add('active');
        this.checkAuth();
    }

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('active');
    }

    checkAuth() {
        if (this.isAuthenticated) {
            if (this.loginScreen) this.loginScreen.style.display = 'none';
            if (this.dashboard) this.dashboard.style.display = 'block';
            this.renderProjectList();
            this.updateProfilePreview();
            this.renderCVInfo();
            this.updateFirebaseStatus();
        } else {
            if (this.loginScreen) this.loginScreen.style.display = 'block';
            if (this.dashboard) this.dashboard.style.display = 'none';
            if (this.passwordInput) { this.passwordInput.value = ''; this.passwordInput.focus(); }
        }
    }

    login() {
        if (this.passwordInput.value === this.password) {
            this.isAuthenticated = true;
            sessionStorage.setItem('portfolio_admin_auth', 'true');
            if (this.loginError) this.loginError.style.display = 'none';
            this.checkAuth();
            this.showToast('Login berhasil ⚡');
        } else {
            if (this.loginError) this.loginError.style.display = 'block';
            this.passwordInput.value = '';
            this.passwordInput.focus();
            this.loginScreen?.animate([
                { transform: 'translateX(0)' }, { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' }, { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }
            ], { duration: 400 });
        }
    }

    // ─── Tabs ───
    switchTab(tabId) {
        this.tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
        this.tabContents.forEach(c => c.style.display = c.id === `tab-${tabId}` ? 'block' : 'none');
        if (tabId === 'cv') this.renderCVInfo();
        if (tabId === 'profile') this.updateProfilePreview();
        if (tabId === 'data') this.updateFirebaseStatus();
    }

    // ─── Project List ───
    renderProjectList() {
        if (!this.projectList) return;
        const projects = DataManager.getProjects();

        if (projects.length === 0) {
            this.projectList.innerHTML = `<div class="admin-empty"><div class="empty-icon">📁</div><p>Belum ada project</p></div>`;
            return;
        }

        let html = '';
        projects.forEach(p => {
            const badge = p.isOriginal ? '<span class="admin-badge">ORIGINAL</span>' : '';
            const thumb = p.image ? `<img src="${p.image}">` : '<div style="font-size:1.2rem;color:var(--text-muted)">📝</div>';
            const imgCount = (p.images || []).length;
            const imgBadge = imgCount > 0 ? `<span class="admin-badge admin-badge-info">${imgCount} foto</span>` : '';

            html += `
            <div class="admin-project-item">
                <div class="admin-project-thumb">${thumb}</div>
                <div class="admin-project-info">
                    <h4>${p.title} ${badge} ${imgBadge}</h4>
                    <p>${p.description || ''}</p>
                </div>
                <div class="admin-project-actions">
                    <button class="admin-icon-btn edit-btn" data-id="${p.id}" title="Edit">✏️</button>
                    <button class="admin-icon-btn delete delete-btn" data-id="${p.id}" title="Delete">🗑️</button>
                </div>
            </div>`;
        });

        this.projectList.innerHTML = html;

        // Bind edit/delete
        this.projectList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = projects.find(pr => pr.id === btn.dataset.id);
                if (p) this.openForm(p);
            });
        });

        this.projectList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Yakin ingin menghapus project ini?')) {
                    await DataManager.deleteProject(btn.dataset.id);
                    this.renderProjectList();
                    window.renderProjects?.();
                    this.showToast('Project dihapus');
                }
            });
        });
    }

    // ─── Project Form ───
    openForm(project = null) {
        if (!this.formOverlay) return;
        this.form.reset();
        this.currentImageBase64 = '';
        this.currentDocImages = [];
        this.imagePreview.style.display = 'none';
        this.imageZone.style.display = 'flex';
        this.renderMultiImagePreview();

        if (project) {
            this.formTitle.textContent = 'Edit Project';
            document.getElementById('form-project-id').value = project.id;
            document.getElementById('form-title').value = project.title || '';
            document.getElementById('form-status').value = project.status || 'LIVE';
            document.getElementById('form-stack').value = project.stack || '';
            document.getElementById('form-tags').value = (project.tags || []).join(', ');
            document.getElementById('form-description').value = project.description || '';
            document.getElementById('form-live-url').value = project.liveUrl || '';
            document.getElementById('form-github-url').value = project.githubUrl || '';

            if (project.image) {
                this.currentImageBase64 = project.image;
                this.setPreviewImage(project.image);
            }
            if (project.images && project.images.length > 0) {
                this.currentDocImages = [...project.images];
                this.renderMultiImagePreview();
            }
        } else {
            this.formTitle.textContent = 'Tambah Project Baru';
            document.getElementById('form-project-id').value = '';
        }

        this.formOverlay.classList.add('active');
    }

    closeForm() {
        this.formOverlay?.classList.remove('active');
    }

    async saveProjectForm() {
        const title = document.getElementById('form-title').value.trim();
        if (!title) { alert('Nama project wajib diisi!'); return; }

        const id = document.getElementById('form-project-id').value || 'proj_' + Date.now();
        const tagsRaw = document.getElementById('form-tags').value;
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
        const existing = DataManager.getProjects().find(p => p.id === id) || {};

        const projectData = {
            id,
            title,
            status: document.getElementById('form-status').value,
            tags,
            description: document.getElementById('form-description').value,
            liveUrl: document.getElementById('form-live-url').value,
            githubUrl: document.getElementById('form-github-url').value,
            stack: document.getElementById('form-stack').value,
            image: this.currentImageBase64 || existing.image || '',
            images: this.currentDocImages.length > 0 ? this.currentDocImages : (existing.images || []),
            order: existing.order || Date.now(),
            isOriginal: existing.isOriginal || false
        };

        await DataManager.saveProject(projectData);
        this.closeForm();
        this.renderProjectList();
        window.renderProjects?.();
        this.showToast('Project berhasil disimpan ✓');
    }

    // ─── Main Image ───
    async handleMainImage(file) {
        if (!file.type.match('image.*')) { alert('File harus berupa gambar'); return; }
        if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }
        const base64 = await fileToBase64(file);
        const resized = await resizeImage(base64, 1200);
        this.currentImageBase64 = resized;
        this.setPreviewImage(resized);
    }

    setPreviewImage(base64) {
        this.imageZone.style.display = 'none';
        this.imagePreview.innerHTML = `
            <img src="${base64}">
            <button class="image-preview-remove" onclick="adminPanel.removePreviewImage(event)">✕</button>`;
        this.imagePreview.style.display = 'block';
    }

    removePreviewImage(e) {
        if (e) e.preventDefault();
        this.currentImageBase64 = '';
        this.imagePreview.style.display = 'none';
        this.imagePreview.innerHTML = '';
        this.imageZone.style.display = 'flex';
        if (this.imageInput) this.imageInput.value = '';
    }

    // ─── Multi-Image ───
    async handleMultiImages(files) {
        const remaining = 10 - this.currentDocImages.length;
        if (remaining <= 0) { alert('Maksimal 10 foto dokumentasi'); return; }

        const filesToProcess = Array.from(files).slice(0, remaining);
        for (const file of filesToProcess) {
            if (!file.type.match('image.*')) continue;
            if (file.size > 2 * 1024 * 1024) continue;
            try {
                const base64 = await fileToBase64(file);
                const resized = await resizeImage(base64, 1200);
                this.currentDocImages.push(resized);
            } catch (e) { console.error('Image process error:', e); }
        }

        this.renderMultiImagePreview();
        if (this.multiImageInput) this.multiImageInput.value = '';
    }

    renderMultiImagePreview() {
        if (!this.multiImagePreview) return;
        if (this.currentDocImages.length === 0) {
            this.multiImagePreview.innerHTML = '';
            return;
        }

        this.multiImagePreview.innerHTML = this.currentDocImages.map((img, i) => `
            <div class="multi-image-item">
                <img src="${img}" alt="Doc ${i + 1}">
                <button class="multi-image-remove" onclick="adminPanel.removeDocImage(${i}, event)">✕</button>
            </div>
        `).join('');

        // Update counter
        const zone = this.multiImageZone;
        if (zone) {
            const hint = zone.querySelector('.upload-hint');
            if (hint) hint.textContent = `${this.currentDocImages.length}/10 foto — JPG, PNG, WebP — Max 2MB per foto`;
        }
    }

    removeDocImage(index, e) {
        if (e) e.preventDefault();
        if (e) e.stopPropagation();
        this.currentDocImages.splice(index, 1);
        this.renderMultiImagePreview();
    }

    // ─── Profile ───
    async handleProfileUpload(file) {
        if (!file.type.match('image.*')) { alert('File harus berupa gambar'); return; }
        if (file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2MB'); return; }

        const base64 = await fileToBase64(file);
        const resized = await resizeImage(base64, 500);
        await DataManager.saveProfileImage(resized);
        this.updateProfilePreview();
        window.renderProfileImage?.();
        this.showToast('Foto profil diperbarui ✓');
    }

    async deleteProfile() {
        if (!confirm('Yakin ingin menghapus foto profil?')) return;
        await DataManager.deleteProfileImage();
        this.updateProfilePreview();
        window.renderProfileImage?.();
        this.showToast('Foto profil dihapus');
    }

    updateProfilePreview() {
        if (!this.profileUpload) return;
        const img = DataManager.getProfileImage();
        if (img) {
            this.profileUpload.innerHTML = `<img src="${img}" style="width:100%;height:100%;object-fit:cover;">`;
            if (this.profileDeleteBtn) this.profileDeleteBtn.style.display = 'inline-flex';
        } else {
            this.profileUpload.innerHTML = '<span class="profile-upload-hint">Klik untuk upload foto</span>';
            if (this.profileDeleteBtn) this.profileDeleteBtn.style.display = 'none';
        }
    }

    // ─── CV ───
    async handleCVUpload(file) {
        if (file.type !== 'application/pdf') { alert('File harus berupa PDF'); return; }
        if (file.size > 3 * 1024 * 1024) { alert('Ukuran file maksimal 3MB'); return; }

        this.showToast('Mengupload CV...');
        try {
            await DataManager.saveCV(file);
            this.renderCVInfo();
            this.showToast('CV berhasil diupload ✓');
        } catch (e) {
            console.error('CV upload error:', e);
            alert('Gagal mengupload CV');
        }
    }

    renderCVInfo() {
        if (!this.cvCurrentInfo) return;
        const cv = DataManager.getCV();

        if (cv) {
            const date = new Date(cv.uploadDate).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            const size = (cv.size / 1024).toFixed(1);

            this.cvCurrentInfo.innerHTML = `
            <div class="cv-file-card">
                <div class="cv-file-info">
                    <div class="cv-icon">📄</div>
                    <div>
                        <div class="cv-name">${cv.filename || 'CV.pdf'}</div>
                        <div class="cv-date">${size} KB · Diupload ${date}</div>
                    </div>
                </div>
                <div class="cv-file-actions">
                    <button class="admin-btn" onclick="adminPanel.previewCV()">👁️ Preview</button>
                    <button class="admin-btn admin-btn-danger" onclick="adminPanel.deleteCV()">🗑️ Hapus</button>
                </div>
            </div>`;
        } else {
            this.cvCurrentInfo.innerHTML = `
            <div class="cv-empty-state">
                <div class="cv-empty-icon">📄</div>
                <p>Belum ada CV yang diupload</p>
                <p class="admin-hint">Upload CV agar pengunjung bisa download dari halaman utama</p>
            </div>`;
        }
    }

    previewCV() {
        const cv = DataManager.getCV();
        if (cv && (cv.url || cv.data)) {
            window.open(cv.url || cv.data, '_blank');
        }
    }

    async deleteCV() {
        if (!confirm('Yakin ingin menghapus CV?')) return;
        await DataManager.deleteCV();
        this.renderCVInfo();
        this.showToast('CV dihapus');
    }

    // ─── Firebase Status ───
    updateFirebaseStatus() {
        const el = document.getElementById('firebase-status');
        if (!el) return;

        if (firebaseReady) {
            el.innerHTML = '<span class="status-dot status-online"></span><span>Firebase Connected</span>';
        } else {
            el.innerHTML = '<span class="status-dot status-offline"></span><span>Firebase Offline — menggunakan localStorage</span>';
        }
    }

    // ─── Toast ───
    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }
}

// ═══ Initialize ═══
let adminPanel;
window.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
    window.adminPanel = adminPanel;
});
