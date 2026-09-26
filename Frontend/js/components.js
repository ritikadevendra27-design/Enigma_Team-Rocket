const Components = {
    Navbar: (isLoggedIn = false) => `
        <nav class="navbar">
            <div class="container">
                <div class="brand cursor-pointer" onclick="navigate('${isLoggedIn ? 'dashboard' : 'landing'}')">
                    <div class="brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                    </div>
                    Circulo
                </div>
                ${!isLoggedIn ? `
                <div class="nav-links">
                    <a href="javascript:void(0)" class="nav-link">How it Works</a>
                    <a href="javascript:void(0)" class="nav-link">Impact</a>
                    <button class="btn btn-outline" onclick="navigate('login')">Sign In</button>
                    <button class="btn btn-primary" onclick="navigate('signup')">Get Started</button>
                </div>
                ` : `
                <div class="nav-links">
                    <button class="btn btn-primary" onclick="navigate('post-material')">+ Post Material</button>
                    <div class="cursor-pointer" onclick="navigate('profile')" style="width:36px;height:36px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:bold;">
                        ${STORE.user ? STORE.user.name.charAt(0) : 'U'}
                    </div>
                </div>
                `}
            </div>
        </nav>
    `,

    Sidebar: (active = 'dashboard') => `
        <aside class="sidebar">
            <nav class="sidebar-nav">
                <a href="javascript:void(0)" class="sidebar-link ${active === 'dashboard' ? 'active' : ''}" onclick="navigate('dashboard')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                    Dashboard
                </a>
                <a href="javascript:void(0)" class="sidebar-link ${active === 'marketplace' ? 'active' : ''}" onclick="navigate('marketplace')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    Marketplace
                </a>
                <a href="javascript:void(0)" class="sidebar-link ${active === 'matches' ? 'active' : ''}" onclick="navigate('matches')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    Smart Matches
                </a>
                <a href="javascript:void(0)" class="sidebar-link ${active === 'exchanges' ? 'active' : ''}" onclick="navigate('exchanges')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5"></path><path d="M4 21v-5h5"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                    My Exchanges
                </a>
                <a href="javascript:void(0)" class="sidebar-link ${active === 'impact' ? 'active' : ''}" onclick="navigate('impact')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20v-6M6 20V10M18 20V4"></path></svg>
                    Impact
                </a>
                <a href="javascript:void(0)" class="sidebar-link ${active === 'profile' ? 'active' : ''}" onclick="navigate('profile')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Profile
                </a>
            </nav>
        </aside>
    `,

    AppLayout: (content, activeMenu) => `
        ${Components.Navbar(true)}
        <div class="app-layout">
            ${Components.Sidebar(activeMenu)}
            <main class="main-content fade-in">
                ${content}
            </main>
        </div>
    `,

    MetricCard: (title, value, subtitle) => `
        <div class="card">
            <h3 class="text-sm text-muted mb-2 font-sans font-semibold">${title}</h3>
            <div class="text-3xl font-bold text-primary mb-1">${value}</div>
            ${subtitle ? `<div class="text-sm text-muted">${subtitle}</div>` : ''}
        </div>
    `,

    MaterialCard: (m) => `
        <div class="card p-0 overflow-hidden cursor-pointer" style="padding:0; display:flex; flex-direction:column;" onclick="navigate('material-details', '${m.id}')">
            <img src="${m.image}" alt="${m.name}" class="material-img" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80';" style="border-bottom-left-radius:0; border-bottom-right-radius:0;">
            <div style="padding: 1.5rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;" class="mb-2">
                    <h3 class="text-xl font-bold">${m.name}</h3>
                    ${m.match ? `<span class="badge badge-success">${m.match}% Match</span>` : ''}
                </div>
                <div class="text-muted mb-4 text-sm">
                    <div>${m.quantity} ${m.unit} • ${m.condition}</div>
                    <div style="display:flex; align-items:center; gap:0.25rem; margin-top:0.25rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${m.location} (${m.distance})
                    </div>
                </div>
                <button class="btn btn-outline btn-block text-sm" onclick="event.stopPropagation(); navigate('material-details', '${m.id}')">View Details</button>
            </div>
        </div>
    `,

    Toast: (msg) => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${msg}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
