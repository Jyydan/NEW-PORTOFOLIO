// ═══════════════════════════════════════════════
// ═══ DATA MANAGEMENT LAYER ═══
// ═══════════════════════════════════════════════

const PROJECTS_DATA = [
    {
        id: 'nawaitu',
        title: 'NAWAITU',
        status: 'LIVE',
        tags: ['Music', 'Python', 'HuggingFace'],
        description: 'Platform streaming musik offline gratis selamanya. Dibangun di Hugging Face Spaces dengan Python, memungkinkan siapa pun menikmati musik tanpa biaya.',
        liveUrl: 'https://jaydan87-nawaitu.hf.space/',
        githubUrl: '',
        stack: 'Python · Hugging Face',
        image: '',
        images: [],
        isOriginal: true,
        order: 1
    },
    {
        id: 'anthropic-stock',
        title: 'ANTHROPIC STOCK',
        status: 'LIVE',
        tags: ['Finance', 'AI', 'Education'],
        description: 'Platform edukasi pasar saham Indonesia paling lengkap, dilengkapi outlook saham terkini dan analisa Bandarmology.',
        liveUrl: 'https://anthropicstock.up.railway.app/',
        githubUrl: '',
        stack: 'Railway · AI',
        image: '',
        images: [],
        isOriginal: true,
        order: 2
    },
    {
        id: 'yulan-collection',
        title: 'YULAN COLLECTION',
        status: 'LIVE',
        tags: ['E-Commerce', 'UMKM', 'Vercel'],
        description: 'Platform e-commerce jilbab untuk UMKM di Deli Serdang. Membuktikan bahwa teknologi bukan hanya untuk korporasi besar.',
        liveUrl: 'https://jilbabyulancollection.vercel.app/',
        githubUrl: '',
        stack: 'Vercel · E-Commerce',
        image: '',
        images: [],
        isOriginal: true,
        order: 3
    },
    {
        id: 'deli-go',
        title: 'DELI-GO',
        status: 'LIVE',
        tags: ['Government', 'PHP', 'MySQL'],
        description: 'Sistem digitalisasi SPPD untuk Dinas Pendidikan Kabupaten Deli Serdang. Mengurangi birokrasi kertas dan meningkatkan efisiensi.',
        liveUrl: 'http://deligo.kesug.com',
        githubUrl: '',
        stack: 'PHP · MySQL · CSS',
        image: '',
        images: [],
        isOriginal: true,
        order: 4
    },
    {
        id: 'cek-siplah',
        title: 'CEK SIPLAH',
        status: 'LIVE',
        tags: ['Education', 'Monitoring', 'Transparency'],
        description: 'Aplikasi monitoring pengadaan SIPLAH pada SMPN untuk memastikan transparansi dan akuntabilitas proses pengadaan.',
        liveUrl: 'http://ceksiplah.kesug.com',
        githubUrl: '',
        stack: 'PHP · MySQL',
        image: '',
        images: [],
        isOriginal: true,
        order: 5
    }
];

// ═══ Image Helpers ═══
function resizeImage(base64, maxWidth) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(c.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(file);
    });
}

// ═══ Data Manager ═══
const DataManager = {
    _projectsCache: [],
    _settingsCache: {},
    _initialized: false,

    // ─── Initialize: Load from Firebase or localStorage ───
    init: async function() {
        if (this._initialized) return;

        // Load settings from Firestore
        try {
            if (firebaseReady) {
                const doc = await db.collection('settings').doc('profile').get();
                if (doc.exists) this._settingsCache = doc.data();
            }
        } catch (e) { console.warn('Settings load from Firebase failed:', e); }

        // Fallback settings from localStorage
        if (!this._settingsCache.profileImage) {
            this._settingsCache.profileImage = localStorage.getItem('portfolio_profile_image') || '';
        }
        if (!this._settingsCache.cv) {
            try {
                this._settingsCache.cv = JSON.parse(localStorage.getItem('portfolio_cv_info')) || null;
            } catch (e) { this._settingsCache.cv = null; }
        }

        // Load CV data from Firestore chunks (if metadata exists but no base64 data)
        if (this._settingsCache.cv && !this._settingsCache.cv.data && firebaseReady) {
            try {
                const chunksSnap = await db.collection('cv_chunks').orderBy('index').get();
                if (!chunksSnap.empty) {
                    let fullData = '';
                    chunksSnap.docs.forEach(doc => { fullData += doc.data().data; });
                    this._settingsCache.cv.data = fullData;
                }
            } catch (e) { console.warn('CV chunks load failed:', e); }
        }

        // Load projects from Firestore
        let fbProjects = [];
        try {
            if (firebaseReady) {
                const snap = await db.collection('projects').get();
                if (!snap.empty) {
                    fbProjects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    // Sort by order manually
                    fbProjects.sort((a, b) => (a.order || 99) - (b.order || 99));
                    
                    // Load doc images from separate collection
                    for (const proj of fbProjects) {
                        try {
                            const imgDoc = await db.collection('project_images').doc(proj.id).get();
                            if (imgDoc.exists) proj.images = imgDoc.data().images || [];
                        } catch (e) { /* no images doc */ }
                    }
                }
            }
        } catch (e) { console.warn('Projects load from Firebase failed:', e); }

        // Merge originals with localStorage AND Firebase
        this._projectsCache = this._mergeAllProjects(fbProjects);
        this._initialized = true;
    },

    _mergeAllProjects: function(fbProjects = []) {
        const stored = JSON.parse(localStorage.getItem('portfolio_custom_projects')) || [];
        let all = [...PROJECTS_DATA];
        
        // Merge from LocalStorage
        stored.forEach(sp => {
            const idx = all.findIndex(p => p.id === sp.id);
            if (idx !== -1) {
                if (sp.deleted) all[idx].deleted = true;
                else all[idx] = { ...all[idx], ...sp, isOriginal: true };
            } else if (!sp.deleted) {
                all.push({ ...sp, isOriginal: false });
            }
        });
        
        // Merge from Firebase (Firebase is the ultimate source of truth)
        fbProjects.forEach(fp => {
            const idx = all.findIndex(p => p.id === fp.id);
            if (idx !== -1) {
                if (fp.deleted) all[idx].deleted = true;
                else all[idx] = { ...all[idx], ...fp, isOriginal: all[idx].isOriginal };
            } else if (!fp.deleted) {
                all.push({ ...fp, isOriginal: false });
            }
        });
        
        // Filter out deleted
        all = all.filter(p => !p.deleted);
        
        // Sort by order
        all.sort((a, b) => (a.order || 99) - (b.order || 99));
        
        return all;
    },

    _mergeLocalProjects: function() {
        const stored = JSON.parse(localStorage.getItem('portfolio_custom_projects')) || [];
        let all = [...PROJECTS_DATA];
        stored.forEach(sp => {
            const idx = all.findIndex(p => p.id === sp.id);
            if (idx !== -1) {
                if (sp.deleted) all[idx].deleted = true;
                else all[idx] = { ...all[idx], ...sp, isOriginal: true };
            } else if (!sp.deleted) {
                all.push({ ...sp, isOriginal: false });
            }
        });
        return all.filter(p => !p.deleted).sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    // ─── Projects CRUD ───
    getProjects: function() {
        if (!this._initialized) return this._mergeLocalProjects();
        return this._projectsCache.filter(p => !p.deleted).sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    saveProject: async function(data) {
        // Ensure images array
        if (!data.images) data.images = [];

        // Update cache
        const idx = this._projectsCache.findIndex(p => p.id === data.id);
        if (idx !== -1) this._projectsCache[idx] = { ...this._projectsCache[idx], ...data };
        else this._projectsCache.push(data);

        // Save to localStorage (full data with images)
        const stored = JSON.parse(localStorage.getItem('portfolio_custom_projects')) || [];
        const si = stored.findIndex(p => p.id === data.id);
        if (si !== -1) stored[si] = data; else stored.push(data);
        localStorage.setItem('portfolio_custom_projects', JSON.stringify(stored));

        // Save to Firestore (split: project data + images separately)
        if (firebaseReady) {
            try {
                // Store project data WITHOUT doc images (keeps under 1MB limit)
                const projectData = { ...data };
                const docImages = projectData.images || [];
                delete projectData.images;
                await db.collection('projects').doc(data.id).set(projectData, { merge: true });

                // Store doc images in separate collection
                if (docImages.length > 0) {
                    await db.collection('project_images').doc(data.id).set({
                        images: docImages,
                        projectId: data.id
                    });
                } else {
                    // Delete images doc if no images
                    try { await db.collection('project_images').doc(data.id).delete(); } catch(e) {}
                }
            } catch (e) { 
                console.warn('Firestore save failed:', e); 
                alert("Peringatan: Gagal menyimpan ke server Firebase secara permanen (" + e.message + "). Data hanya tersimpan di memori browser Anda.");
            }
        }
    },

    deleteProject: async function(id) {
        const isOrig = PROJECTS_DATA.some(p => p.id === id);
        let stored = JSON.parse(localStorage.getItem('portfolio_custom_projects')) || [];

        if (isOrig) {
            const si = stored.findIndex(p => p.id === id);
            if (si !== -1) stored[si].deleted = true;
            else stored.push({ id, deleted: true });
            const ci = this._projectsCache.findIndex(p => p.id === id);
            if (ci !== -1) this._projectsCache[ci].deleted = true;
        } else {
            stored = stored.filter(p => p.id !== id);
            this._projectsCache = this._projectsCache.filter(p => p.id !== id);
        }

        localStorage.setItem('portfolio_custom_projects', JSON.stringify(stored));

        if (firebaseReady) {
            try { await db.collection('projects').doc(id).delete(); }
            catch (e) { console.warn('Firebase delete failed:', e); }
        }
    },

    // ─── Profile Image ───
    getProfileImage: function() {
        return this._settingsCache.profileImage || '';
    },

    saveProfileImage: async function(imageData) {
        this._settingsCache.profileImage = imageData;
        localStorage.setItem('portfolio_profile_image', imageData);

        if (firebaseReady) {
            try {
                await db.collection('settings').doc('profile').set(
                    { profileImage: imageData }, { merge: true }
                );
            } catch (e) { console.warn('Firebase profile save failed:', e); }
        }
    },

    deleteProfileImage: async function() {
        this._settingsCache.profileImage = '';
        localStorage.removeItem('portfolio_profile_image');

        if (firebaseReady) {
            try {
                await db.collection('settings').doc('profile').set(
                    { profileImage: '' }, { merge: true }
                );
            } catch (e) { console.warn('Firebase profile delete failed:', e); }
        }
    },

    // ─── CV Management (stored in Firestore chunks, NO Storage needed) ───
    getCV: function() {
        return this._settingsCache.cv || null;
    },

    saveCV: async function(file) {
        if (file.size > 3 * 1024 * 1024) {
            throw new Error('CV terlalu besar. Maksimal 3MB.');
        }

        const base64 = await fileToBase64(file);
        const cvInfo = {
            filename: file.name,
            size: file.size,
            uploadDate: new Date().toISOString(),
            data: base64
        };

        // Store in Firestore as chunks (1MB doc limit)
        if (firebaseReady) {
            try {
                // Save metadata to settings
                const meta = { filename: cvInfo.filename, size: cvInfo.size, uploadDate: cvInfo.uploadDate };
                await db.collection('settings').doc('profile').set({ cv: meta }, { merge: true });

                // Delete old chunks
                const oldChunks = await db.collection('cv_chunks').get();
                const deleteOps = oldChunks.docs.map(doc => doc.ref.delete());
                await Promise.all(deleteOps);

                // Write new chunks (~800KB each to stay under 1MB limit)
                const chunkSize = 800000;
                const totalChunks = Math.ceil(base64.length / chunkSize);
                for (let i = 0; i < totalChunks; i++) {
                    await db.collection('cv_chunks').doc('chunk_' + i).set({
                        data: base64.slice(i * chunkSize, (i + 1) * chunkSize),
                        index: i,
                        total: totalChunks
                    });
                }
                console.log('📄 CV saved to Firestore (' + totalChunks + ' chunks)');
            } catch (e) {
                console.warn('Firestore CV save failed, using localStorage:', e);
            }
        }

        this._settingsCache.cv = cvInfo;
        localStorage.setItem('portfolio_cv_info', JSON.stringify(cvInfo));
        return cvInfo;
    },

    deleteCV: async function() {
        this._settingsCache.cv = null;
        localStorage.removeItem('portfolio_cv_info');

        if (firebaseReady) {
            try {
                // Remove metadata
                await db.collection('settings').doc('profile').set({ cv: null }, { merge: true });
                // Remove all chunks
                const chunks = await db.collection('cv_chunks').get();
                const deleteOps = chunks.docs.map(doc => doc.ref.delete());
                await Promise.all(deleteOps);
            } catch (e) { console.warn('Firestore CV delete failed:', e); }
        }
    },

    // ─── Export / Import ───
    exportData: function() {
        const data = {
            projects: JSON.parse(localStorage.getItem('portfolio_custom_projects')) || [],
            profileImage: localStorage.getItem('portfolio_profile_image') || '',
            cv: this.getCV(),
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio_backup_' + Date.now() + '.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    importData: async function(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.projects) {
                localStorage.setItem('portfolio_custom_projects', JSON.stringify(data.projects));
            }
            if (data.profileImage) {
                localStorage.setItem('portfolio_profile_image', data.profileImage);
                this._settingsCache.profileImage = data.profileImage;
            }
            if (data.cv) {
                localStorage.setItem('portfolio_cv_info', JSON.stringify(data.cv));
                this._settingsCache.cv = data.cv;
            }
            // Reload projects cache
            this._projectsCache = this._mergeLocalProjects();

            // Sync to Firebase
            if (firebaseReady) {
                try {
                    for (const p of this.getProjects()) {
                        await db.collection('projects').doc(p.id).set(p, { merge: true });
                    }
                    await db.collection('settings').doc('profile').set(this._settingsCache, { merge: true });
                } catch (e) { console.warn('Firebase sync failed:', e); }
            }
            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    }
};
