// Router & State Management
let currentPage = 'landing';
let currentParam = null;

async function navigate(page, param = null) {
    currentPage = page;
    currentParam = param;
    window.location.hash = param ? `${page}/${param}` : page;
    await render();
}

async function render() {
    const app = document.getElementById('app');
    
    // Auth Guard
    const protectedPages = ['dashboard', 'marketplace', 'post-material', 'material-details', 'matches', 'exchanges', 'impact', 'profile'];
    if (protectedPages.includes(currentPage) && !STORE.user) {
        return navigate('login');
    }
    
    // Route matching
    try {
        switch(currentPage) {
            case 'landing':
                app.innerHTML = Pages.Landing();
                break;
            case 'login':
                app.innerHTML = Pages.Login();
                break;
            case 'signup':
                app.innerHTML = Pages.Signup();
                break;
            case 'dashboard':
                app.innerHTML = await Pages.Dashboard();
                break;
            case 'marketplace':
                app.innerHTML = await Pages.Marketplace();
                break;
            case 'post-material':
                app.innerHTML = Pages.PostMaterial();
                break;
            case 'material-details':
                app.innerHTML = await Pages.MaterialDetails(currentParam);
                break;
            case 'matches':
                app.innerHTML = await Pages.SmartMatches();
                break;
            case 'exchanges':
                app.innerHTML = await Pages.MyExchanges();
                break;
            case 'impact':
                app.innerHTML = await Pages.Impact();
                break;
            case 'profile':
                app.innerHTML = Pages.Profile();
                break;
            default:
                app.innerHTML = Pages.Landing();
        }
        window.scrollTo(0, 0);
    } catch (e) {
        console.error("Render error:", e);
        app.innerHTML = `<div class="container text-center" style="padding: 5rem 0;"><h1 class="mb-4" style="color:var(--error);">Oops! Something went wrong.</h1><button class="btn btn-primary" onclick="navigate('landing')">Go Home</button></div>`;
    }
}

// Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value || e.target.querySelector('input[type="email"]')?.value || 'ecopack.generator@circulareconomy.org';
    const password = document.getElementById('login-password')?.value || 'Password123!';
    const btn = e.target.querySelector('button[type="submit"]');
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Connecting to backend...';
    }
    
    const res = await API.login(email, password);
    if (res.success) {
        Components.Toast(`Signed in as ${STORE.user.name}`);
        navigate('dashboard');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('su-name')?.value;
    const email = document.getElementById('su-email')?.value;
    const password = document.getElementById('su-password')?.value || 'Password123!';
    const role = document.getElementById('su-role')?.value || 'generator';
    const location = document.getElementById('su-location')?.value || 'Mumbai';

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Creating account...';
    }

    const res = await API.signup({ name, email, password, role, location });
    if (res.success) {
        Components.Toast(`Account created for ${STORE.user.name}!`);
        navigate('dashboard');
    }
}

function handleLogout() {
    API.logout();
    navigate('landing');
    Components.Toast('Logged out successfully');
}

async function handlePostMaterial(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Submitting to ledger...';
    }
    
    const data = {
        name: document.getElementById('pm-name').value,
        type: document.getElementById('pm-type').value,
        quantity: document.getElementById('pm-qty').value,
        unit: document.getElementById('pm-unit').value,
        condition: document.getElementById('pm-condition').value,
        location: document.getElementById('pm-loc').value,
        description: document.getElementById('pm-desc')?.value || '',
        image: uploadedImageBase64 || null
    };
    
    // Reset image state for next post
    uploadedImageBase64 = null;
    
    const res = await API.postMaterial(data);
    if(res.success) {
        Components.Toast('Material listed & synced with backend!');
        navigate('material-details', res.id);
    }
}

let uploadedImageBase64 = null;

window.handleImageUpload = function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            uploadedImageBase64 = evt.target.result;
            const preview = document.getElementById('pm-image-preview');
            const placeholder = document.getElementById('pm-image-placeholder');
            const removeBtn = document.getElementById('pm-image-remove');
            if (preview) {
                preview.src = uploadedImageBase64;
                preview.style.display = 'block';
            }
            if (placeholder) placeholder.style.display = 'none';
            if (removeBtn) removeBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
};

window.removeImage = function() {
    uploadedImageBase64 = null;
    const input = document.getElementById('pm-image');
    if (input) input.value = '';
    const preview = document.getElementById('pm-image-preview');
    const placeholder = document.getElementById('pm-image-placeholder');
    const removeBtn = document.getElementById('pm-image-remove');
    if (preview) preview.style.display = 'none';
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
};

async function handleRequestMaterial(id) {
    const res = await API.requestMaterial(id);
    if(res.success) {
        Components.Toast('Exchange requested on ledger! Awaiting verification.');
        navigate('exchanges');
    }
}

async function handleExchangeAction(exchangeId, newStatus) {
    const res = await API.updateExchangeStatus(exchangeId, newStatus);
    if (res.success) {
        Components.Toast(`Exchange status updated to ${newStatus}!`);
        navigate('exchanges');
    }
}

async function handleMarketFilter() {
    const searchVal = (document.getElementById('market-search')?.value || '').toLowerCase();
    const catVal = document.getElementById('market-category')?.value || 'ALL';
    const sortVal = document.getElementById('market-sort')?.value || 'match';

    const allMaterials = await API.getMaterials();
    let filtered = allMaterials.filter(m => {
        const matchesSearch = !searchVal || 
            (m.name || '').toLowerCase().includes(searchVal) ||
            (m.type || '').toLowerCase().includes(searchVal) ||
            (m.location || '').toLowerCase().includes(searchVal) ||
            (m.condition || '').toLowerCase().includes(searchVal);

        const matchesCat = catVal === 'ALL' || (m.type || '').toLowerCase().includes(catVal.toLowerCase());
        return matchesSearch && matchesCat;
    });

    if (sortVal === 'match') {
        filtered.sort((a, b) => (b.match || 0) - (a.match || 0));
    }

    const grid = document.getElementById('market-grid');
    if (grid) {
        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:3rem;" class="card"><p class="text-muted">No materials found matching your criteria.</p></div>`;
        } else {
            grid.innerHTML = filtered.map(m => Components.MaterialCard(m)).join('');
        }
    }
}

// Initial Load
window.addEventListener('load', async () => {
    // Attempt backend session sync
    await API.init();

    // Check hash for initial route
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const parts = hash.split('/');
        currentPage = parts[0];
        if (parts.length > 1) currentParam = parts[1];
    } else {
        currentPage = 'dashboard';
    }
    render();
});

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const parts = hash.split('/');
        if (currentPage !== parts[0] || currentParam !== parts[1]) {
            navigate(parts[0], parts[1]);
        }
    } else {
        navigate('dashboard');
    }
});
