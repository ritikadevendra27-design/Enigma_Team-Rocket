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
        app.innerHTML = `<div class="container text-center py-20"><h1 class="text-error mb-4">Oops! Something went wrong.</h1><button class="btn btn-primary" onclick="navigate('landing')">Go Home</button></div>`;
    }
}

// Handlers
async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const btn = e.target.querySelector('button[type="submit"]');
    
    btn.disabled = true;
    btn.innerHTML = 'Processing...';
    
    await API.login(email, 'password');
    Components.Toast('Successfully logged in!');
    navigate('dashboard');
}

function handleLogout() {
    API.logout();
    navigate('landing');
    Components.Toast('Logged out successfully');
}

async function handlePostMaterial(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = 'Finding Matches...';
    
    const data = {
        name: document.getElementById('pm-name').value,
        type: document.getElementById('pm-type').value,
        quantity: document.getElementById('pm-qty').value,
        unit: document.getElementById('pm-unit').value,
        condition: document.getElementById('pm-condition').value,
        location: document.getElementById('pm-loc').value,
        image: uploadedImageBase64 || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=400&q=80'
    };
    
    // Reset image state for next post
    uploadedImageBase64 = null;
    
    const res = await API.postMaterial(data);
    if(res.success) {
        Components.Toast('Material listed successfully!');
        navigate('material-details', res.id);
    }
}

let uploadedImageBase64 = null;

window.handleImageUpload = function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImageBase64 = e.target.result;
            document.getElementById('pm-image-preview').src = uploadedImageBase64;
            document.getElementById('pm-image-preview').style.display = 'block';
            document.getElementById('pm-image-placeholder').style.display = 'none';
            document.getElementById('pm-image-remove').style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

window.removeImage = function() {
    uploadedImageBase64 = null;
    document.getElementById('pm-image').value = '';
    document.getElementById('pm-image-preview').style.display = 'none';
    document.getElementById('pm-image-placeholder').style.display = 'block';
    document.getElementById('pm-image-remove').style.display = 'none';
}

async function handleRequestMaterial(id) {
    const res = await API.requestMaterial(id);
    if(res.success) {
        Components.Toast('Exchange requested! Waiting for owner approval.');
        navigate('exchanges');
    }
}

// Initial Load
window.addEventListener('load', () => {
    // Check hash for initial route
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const parts = hash.split('/');
        currentPage = parts[0];
        if (parts.length > 1) currentParam = parts[1];
    } else {
        currentPage = 'landing';
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
        navigate('landing');
    }
});
