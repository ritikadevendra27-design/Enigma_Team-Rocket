const Pages = {
    Landing: () => `
        ${Components.Navbar(false)}
        <div class="container fade-in">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; text-align: center; max-width: 900px; margin: 0 auto; padding: 4rem 0;">
                <div class="badge badge-success mb-6" style="padding: 0.5rem 1rem; font-size: 0.875rem;">🌱 Join 10,000+ sustainability champions</div>
                <h1 class="text-4xl mb-6" style="font-size: 4.5rem; line-height: 1.1; font-weight: 700;">Turn waste into the next <span class="text-primary" style="background: linear-gradient(135deg, var(--primary), var(--success)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">useful resource.</span></h1>
                <p class="text-xl text-muted mb-8" style="max-width: 600px; line-height: 1.6;">Circulo connects reusable materials with organizations and recyclers that give them a second life. Powered by real-time rule-based matching and Supabase circular ledger.</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button class="btn btn-primary" style="font-size: 1.125rem; padding: 1rem 2.5rem; border-radius: var(--radius-full); box-shadow: var(--shadow-md);" onclick="navigate('signup')">Get Started</button>
                    <button class="btn btn-outline" style="font-size: 1.125rem; padding: 1rem 2.5rem; border-radius: var(--radius-full);" onclick="navigate('marketplace')">Explore Marketplace</button>
                </div>
            </div>
            
            <div style="text-align: center; margin-bottom: 6rem; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; max-width: 800px; margin: 0 auto; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); border: 1px solid var(--border);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                        </div>
                        <div class="font-bold">Material</div>
                    </div>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: #DBEAFE; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #1E40AF;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        </div>
                        <div class="font-bold">Match</div>
                    </div>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: #FEF3C7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #92400E;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                        </div>
                        <div class="font-bold">Exchange</div>
                    </div>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
                        <div style="width: 80px; height: 80px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--success);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                        <div class="font-bold">Reuse</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 6rem; text-align: center;">
                <div class="grid grid-cols-3" style="gap: 2rem;">
                    <div><h3 class="text-4xl font-bold text-primary mb-2">12,500 kg</h3><p class="text-muted">Material Circulated</p></div>
                    <div><h3 class="text-4xl font-bold text-primary mb-2">12.5 tons</h3><p class="text-muted">Landfill Diversion</p></div>
                    <div><h3 class="text-4xl font-bold text-primary mb-2">128</h3><p class="text-muted">Active Participants</p></div>
                </div>
            </div>
            
            <div style="background: var(--bg-card); border-radius: var(--radius-xl); padding: 4rem 2rem; margin-bottom: 6rem; text-align: center; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <h2 class="text-3xl mb-8">How it works</h2>
                <div class="grid grid-cols-4" style="gap: 2rem;">
                    <div style="transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                        <div style="width:64px;height:64px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--primary);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                        </div>
                        <h3 class="font-bold mb-2">1. List Material</h3>
                        <p class="text-sm text-muted">Post your reusable or recyclable materials directly to the ledger.</p>
                    </div>
                    <div style="transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                        <div style="width:64px;height:64px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--primary);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        </div>
                        <h3 class="font-bold mb-2">2. Smart Match</h3>
                        <p class="text-sm text-muted">Rule-based engine scores compatibility with active buyer demands.</p>
                    </div>
                    <div style="transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                        <div style="width:64px;height:64px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--primary);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                        </div>
                        <h3 class="font-bold mb-2">3. Exchange</h3>
                        <p class="text-sm text-muted">Request materials and track multi-party verification status.</p>
                    </div>
                    <div style="transition: transform 0.3s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='none'">
                        <div style="width:64px;height:64px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--primary);">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                        <h3 class="font-bold mb-2">4. Verified Impact</h3>
                        <p class="text-sm text-muted">Earn carbon points and track verified landfill diversion.</p>
                    </div>
                </div>
            </div>
        </div>
    `,

    Login: () => `
        <div class="container fade-in" style="height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div class="card" style="width: 100%; max-width: 420px; padding: 2.5rem;">
                <div class="text-center mb-8">
                    <div class="brand-icon" style="margin: 0 auto 1rem; width: 48px; height: 48px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    </div>
                    <h1 class="text-2xl font-bold">Welcome back</h1>
                    <p class="text-muted">Sign in to your Circulo account</p>
                </div>
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="login-email" required placeholder="name@example.com" value="ecopack.generator@circulareconomy.org">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" id="login-password" required placeholder="••••••••" value="Password123!">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block mb-4">Sign In</button>
                    <div class="text-center text-sm">
                        <span class="text-muted">Need an account?</span> <a href="javascript:void(0)" onclick="navigate('signup')">Create Account</a>
                    </div>
                </form>
            </div>
        </div>
    `,

    Signup: () => `
        <div class="container fade-in" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem 0;">
            <div class="card" style="width: 100%; max-width: 500px; padding: 2.5rem;">
                <div class="text-center mb-6">
                    <h1 class="text-2xl font-bold mb-1">Create Account</h1>
                    <p class="text-muted">Join the circular economy platform</p>
                </div>
                <form onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label class="form-label">Full Name / Organization</label>
                        <input type="text" id="su-name" class="form-control" required placeholder="EcoPack Manufacturing">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" id="su-email" class="form-control" required placeholder="name@example.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="su-password" class="form-control" required placeholder="••••••••" value="Password123!">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Primary Role</label>
                        <select id="su-role" class="form-control" required>
                            <option value="generator">Waste Generator (I have materials)</option>
                            <option value="buyer">Buyer / Recycler (I need materials)</option>
                            <option value="admin">Platform Admin</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location / City</label>
                        <input type="text" id="su-location" class="form-control" required placeholder="Mumbai, Maharashtra">
                    </div>
                    <button type="submit" class="btn btn-primary btn-block mb-4">Create Account</button>
                    <div class="text-center text-sm">
                        <span class="text-muted">Already have an account?</span> <a href="javascript:void(0)" onclick="navigate('login')">Sign In</a>
                    </div>
                </form>
            </div>
        </div>
    `,

    Dashboard: async () => {
        const stats = await API.getStats();
        const matches = await API.getSmartMatches();
        const materials = await API.getMaterials();
        
        return Components.AppLayout(`
            <h1 class="text-2xl mb-6">Good morning, ${STORE.user?.name || 'EcoPack Manufacturing'}</h1>
            
            <div class="grid grid-cols-4 mb-8">
                ${Components.MetricCard('Active Listings', stats.activeListings)}
                ${Components.MetricCard('Pending Requests', stats.pendingRequests)}
                ${Components.MetricCard('Completed Exchanges', stats.completedExchanges)}
                ${Components.MetricCard('Carbon Points', stats.carbonPoints)}
            </div>

            <div class="mb-8">
                <div style="display:flex; justify-content:space-between; align-items:center;" class="mb-4">
                    <h2 class="text-xl font-bold">Your Active Listings</h2>
                    <button class="btn btn-outline btn-sm" onclick="navigate('post-material')">+ Post Material</button>
                </div>
                <div class="grid grid-cols-4">
                    ${materials.slice(0,4).map(m => Components.MaterialCard(m)).join('')}
                </div>
            </div>

            <div>
                <h2 class="text-xl font-bold mb-4">Recommended Matches (Smart Engine)</h2>
                <div class="grid grid-cols-4">
                    ${matches.slice(0,4).map(m => Components.MaterialCard(m)).join('')}
                </div>
            </div>
        `, 'dashboard');
    },

    Marketplace: async () => {
        const materials = await API.getMaterials();
        return Components.AppLayout(`
            <div style="display:flex; justify-content:space-between; align-items:center;" class="mb-6">
                <h1 class="text-2xl font-bold">Find materials near you</h1>
                <button class="btn btn-primary" onclick="navigate('post-material')">+ Post Material</button>
            </div>
            
            <div class="card mb-6" style="display:flex; gap:1rem; align-items:center;">
                <div class="form-group mb-0" style="flex:1; margin-bottom:0;">
                    <input type="text" id="market-search" class="form-control" placeholder="Search materials (e.g. PET bottles, Aluminium, Cardboard)..." oninput="handleMarketFilter()">
                </div>
                <div class="form-group mb-0" style="width:200px; margin-bottom:0;">
                    <select id="market-category" class="form-control" onchange="handleMarketFilter()">
                        <option value="ALL">All Categories</option>
                        <option value="Plastic">Plastic / PET</option>
                        <option value="Paper">Paper / Cardboard</option>
                        <option value="Metal">Metal / Aluminium</option>
                        <option value="Glass">Glass</option>
                        <option value="Textile">Textile / Cotton</option>
                        <option value="Organic">Organic Waste</option>
                        <option value="Electronic">E-Waste</option>
                    </select>
                </div>
                <div class="form-group mb-0" style="width:200px; margin-bottom:0;">
                    <select id="market-sort" class="form-control" onchange="handleMarketFilter()">
                        <option value="match">Sort: Best Match</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
            </div>

            <div id="market-grid" class="grid grid-cols-4">
                ${materials.map(m => Components.MaterialCard(m)).join('')}
            </div>
        `, 'marketplace');
    },

    PostMaterial: () => Components.AppLayout(`
        <div style="max-width: 800px; margin: 0 auto;">
            <div class="mb-6">
                <h1 class="text-2xl mb-2 font-bold">Give your material a second life.</h1>
                <p class="text-muted">Fill out the details below so our smart matching engine connects your waste stream to verified buyers.</p>
            </div>
            
            <div class="card">
                <form onsubmit="handlePostMaterial(event)">
                    <div class="grid grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">Material Name</label>
                            <input type="text" id="pm-name" class="form-control" required placeholder="e.g. PET Bottles, Aluminium Cans, OCC 11 Cardboard">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Material Type</label>
                            <select id="pm-type" class="form-control" required>
                                <option value="">Select Type</option>
                                <option value="Plastic/PET">Plastic / PET</option>
                                <option value="Paper/Cardboard">Paper / Cardboard</option>
                                <option value="Metal">Metal / Aluminium</option>
                                <option value="Glass">Glass</option>
                                <option value="Textile/Cotton">Textile / Cotton</option>
                                <option value="Organic/Food Waste">Organic / Food Waste</option>
                                <option value="Electronic Waste">Electronic Waste</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2">
                        <div class="form-group">
                            <label class="form-label">Quantity</label>
                            <div style="display:flex; gap:0.5rem;">
                                <input type="number" id="pm-qty" class="form-control" required style="flex:2;" min="1" placeholder="500">
                                <select id="pm-unit" class="form-control" style="flex:1;">
                                    <option value="kg">kg</option>
                                    <option value="tons">tons</option>
                                    <option value="units">units</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Condition</label>
                            <select id="pm-condition" class="form-control" required>
                                <option value="Excellent">Excellent</option>
                                <option value="Good" selected>Good / Sorted</option>
                                <option value="Fair">Fair / Usable</option>
                                <option value="Poor">Poor / Scrap</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" id="pm-loc" class="form-control" required placeholder="e.g. Industrial Zone A, Mumbai" value="${STORE.user?.location || 'Industrial Zone A, Mumbai'}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Description (Optional)</label>
                        <textarea id="pm-desc" class="form-control" rows="3" placeholder="Add specific details: baling status, contamination level, pickup notes..."></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Image Upload (Auto-mapped if omitted)</label>
                        <div id="pm-image-container" onclick="document.getElementById('pm-image').click()" style="border: 2px dashed var(--border); padding: 2rem; text-align: center; border-radius: var(--radius-md); background: var(--bg-main); cursor: pointer; position: relative;">
                            <div id="pm-image-placeholder">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="margin: 0 auto 0.5rem;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                <p class="text-sm text-muted">Click to upload custom photo or let Circulo auto-assign verified material asset</p>
                            </div>
                            <img id="pm-image-preview" src="" style="display:none; max-width: 100%; max-height: 200px; margin: 0 auto; border-radius: var(--radius-md);" onerror="this.style.display='none'">
                            <button type="button" id="pm-image-remove" class="btn btn-sm btn-outline text-error" style="display:none; position:absolute; top:1rem; right:1rem; background:white; border-color:var(--error); padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="event.stopPropagation(); removeImage()">Remove</button>
                            <input type="file" id="pm-image" accept="image/png, image/jpeg, image/jpg, image/webp" style="display: none;" onchange="handleImageUpload(event)">
                        </div>
                    </div>
                    
                    <hr style="border:none; border-top:1px solid var(--border); margin: 2rem 0;">
                    
                    <div style="display:flex; justify-content:flex-end; gap:1rem;">
                        <button type="button" class="btn btn-outline" onclick="navigate('dashboard')">Cancel</button>
                        <button type="submit" class="btn btn-primary">Find Matches & Post</button>
                    </div>
                </form>
            </div>
        </div>
    `, 'post-material'),

    MaterialDetails: async (id) => {
        const material = await API.getMaterial(id);
        if(!material) return Components.AppLayout(`<h1>Material Not Found</h1>`);
        
        return Components.AppLayout(`
            <div style="max-width: 1000px; margin: 0 auto;">
                <button class="btn btn-outline mb-6" style="padding: 0.5rem 1rem;" onclick="navigate('marketplace')">← Back to Marketplace</button>
                
                <div class="grid" style="grid-template-columns: 1.5fr 1fr; gap: 2rem;">
                    <div>
                        <img src="${material.image}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80';" style="width:100%; height:400px; object-fit:cover; border-radius:var(--radius-lg); margin-bottom:1.5rem;">
                        <h1 class="text-3xl mb-2 font-bold">${material.name}</h1>
                        <p class="text-xl text-primary font-bold mb-6">${material.quantity} ${material.unit}</p>
                        
                        <h3 class="font-bold mb-2">Description</h3>
                        <p class="text-muted mb-6">${material.description || `This ${material.name} batch is in ${material.condition} condition, located at ${material.location}, and prepared for verified circular recovery.`}</p>
                        
                        <h3 class="font-bold mb-2">Owner Information</h3>
                        <div style="display:flex; align-items:center; gap:1rem; padding:1rem; border:1px solid var(--border); border-radius:var(--radius-md);">
                            <div style="width:48px;height:48px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:var(--primary);">${(material.owner || 'E').charAt(0)}</div>
                            <div>
                                <div class="font-bold">${material.owner || 'EcoPack Manufacturing Ltd'}</div>
                                <div class="text-sm text-muted">Waste Generator • ${material.location}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="card mb-6" style="background:var(--accent); border-color:var(--accent-dark);">
                            <div style="display:flex; justify-content:space-between; align-items:center;" class="mb-4">
                                <h3 class="font-bold text-primary">Smart Match Compatibility</h3>
                                <div class="match-score" style="background:white;">${material.match || 92}%</div>
                            </div>
                            <div class="text-sm text-primary mb-6">
                                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Material specification verified</div>
                                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Volume aligns with buyer capacity</div>
                                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Regional cluster proximity (${material.distance})</div>
                                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Condition & grade verified</div>
                            </div>
                            <button class="btn btn-primary btn-block mb-3" onclick="handleRequestMaterial('${material.id}')">Request Exchange</button>
                            <button class="btn btn-outline btn-block" style="background:white;" onclick="navigate('matches')">View Smart Matches</button>
                        </div>
                        
                        <div class="card">
                            <h3 class="font-bold mb-4">Material Details</h3>
                            <div class="grid" style="gap:1rem; grid-template-columns:1fr 1fr;">
                                <div><div class="text-xs text-muted">Type</div><div class="font-semibold">${material.type}</div></div>
                                <div><div class="text-xs text-muted">Condition</div><div class="font-semibold">${material.condition}</div></div>
                                <div><div class="text-xs text-muted">Location</div><div class="font-semibold">${material.location}</div></div>
                                <div><div class="text-xs text-muted">Status</div><div class="font-semibold"><span class="badge badge-success">${material.status}</span></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `, 'marketplace');
    },

    SmartMatches: async () => {
        const matches = await API.getSmartMatches();
        return Components.AppLayout(`
            <div class="mb-6">
                <h1 class="text-2xl mb-2 font-bold">Smart Matches</h1>
                <p class="text-muted">100% rule-based weighted algorithm evaluating material type (40%), quantity (20%), location (20%), condition (10%), and availability (10%).</p>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:1.5rem;">
                ${matches.map(m => `
                    <div class="card" style="display:flex; gap:1.5rem; align-items:center;">
                        <div class="match-score" style="width:64px;height:64px;font-size:1.5rem;">${m.match}%</div>
                        <img src="${m.image}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80';" style="width:120px; height:120px; object-fit:cover; border-radius:var(--radius-md);">
                        <div style="flex:1;">
                            <h3 class="text-xl font-bold mb-1">${m.name}</h3>
                            <div class="text-muted text-sm mb-2">${m.quantity} ${m.unit} • ${m.condition}</div>
                            <div class="text-sm">📍 ${m.location} (${m.distance})</div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.5rem; min-width:150px;">
                            <button class="btn btn-primary btn-block" onclick="navigate('material-details', '${m.id}')">Request</button>
                            <button class="btn btn-outline btn-block" onclick="navigate('material-details', '${m.id}')">View Details</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `, 'matches');
    },

    MyExchanges: async () => {
        const exchanges = await API.getExchanges();
        const getStatusBadge = (status) => {
            if(status === 'COMPLETED') return '<span class="badge badge-success">COMPLETED</span>';
            if(status === 'ACCEPTED') return '<span class="badge badge-info">ACCEPTED</span>';
            return '<span class="badge badge-warning">REQUESTED</span>';
        };
        
        return Components.AppLayout(`
            <h1 class="text-2xl mb-6 font-bold">My Exchanges</h1>
            
            <div class="card p-0 mb-6" style="padding:0;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead style="background:var(--bg-main); border-bottom:1px solid var(--border);">
                        <tr>
                            <th style="padding:1rem 1.5rem; font-weight:500; color:var(--text-muted);">Material</th>
                            <th style="padding:1rem 1.5rem; font-weight:500; color:var(--text-muted);">Participant</th>
                            <th style="padding:1rem 1.5rem; font-weight:500; color:var(--text-muted);">Date</th>
                            <th style="padding:1rem 1.5rem; font-weight:500; color:var(--text-muted);">Status</th>
                            <th style="padding:1rem 1.5rem; font-weight:500; color:var(--text-muted); text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${exchanges.map(ex => `
                            <tr style="border-bottom:1px solid var(--border);">
                                <td style="padding:1rem 1.5rem;">
                                    <div class="font-bold">${ex.material}</div>
                                    <div class="text-sm text-muted">${ex.quantity}</div>
                                </td>
                                <td style="padding:1rem 1.5rem;">${ex.other}</td>
                                <td style="padding:1rem 1.5rem;">${ex.date}</td>
                                <td style="padding:1rem 1.5rem;">
                                    ${getStatusBadge(ex.status)}
                                </td>
                                <td style="padding:1rem 1.5rem; text-align:right;">
                                    ${ex.status === 'REQUESTED' ? `
                                        <button class="btn btn-primary btn-sm" onclick="handleExchangeAction('${ex.id}', 'ACCEPTED')">Accept</button>
                                    ` : ex.status === 'ACCEPTED' ? `
                                        <button class="btn btn-primary btn-sm" onclick="handleExchangeAction('${ex.id}', 'COMPLETED')">Complete</button>
                                    ` : `
                                        <span class="text-xs text-muted">Verified</span>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="card bg-accent" style="border:1px solid var(--primary-light); background:var(--accent);">
                <h3 class="font-bold mb-4">Exchange Lifecycle & Verification Workflow</h3>
                <div style="display:flex; justify-content:space-between; align-items:center; position:relative;">
                    <div style="position:absolute; top:50%; left:0; right:0; height:2px; background:var(--primary-light); z-index:1; transform:translateY(-50%); opacity:0.3;"></div>
                    <div style="position:relative; z-index:2; text-align:center; background:var(--accent); padding:0 0.5rem;">
                        <div style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.5rem;font-size:12px;">1</div>
                        <div class="text-xs font-bold">OPEN</div>
                    </div>
                    <div style="position:relative; z-index:2; text-align:center; background:var(--accent); padding:0 0.5rem;">
                        <div style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.5rem;font-size:12px;">2</div>
                        <div class="text-xs font-bold">REQUESTED</div>
                    </div>
                    <div style="position:relative; z-index:2; text-align:center; background:var(--accent); padding:0 0.5rem;">
                        <div style="width:24px;height:24px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;margin:0 auto 0.5rem;font-size:12px;">3</div>
                        <div class="text-xs font-bold">ACCEPTED</div>
                    </div>
                    <div style="position:relative; z-index:2; text-align:center; background:var(--accent); padding:0 0.5rem;">
                        <div style="width:24px;height:24px;border-radius:50%;background:white;border:2px solid var(--primary);color:var(--primary);display:flex;align-items:center;justify-content:center;margin:0 auto 0.5rem;font-size:12px;">4</div>
                        <div class="text-xs font-bold">COMPLETED</div>
                    </div>
                </div>
            </div>
        `, 'exchanges');
    },

    Impact: async () => {
        const stats = await API.getStats();
        return Components.AppLayout(`
            <div style="text-align:center; max-width:600px; margin:0 auto 3rem;">
                <h1 class="text-3xl mb-4 font-bold">Your Circular Impact</h1>
                <p class="text-xl text-primary font-bold">Every completed exchange keeps useful material in circulation.</p>
            </div>
            
            <div class="grid grid-cols-2 mb-8">
                <div class="card" style="text-align:center; padding:3rem 2rem;">
                    <div style="width:80px;height:80px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;color:var(--primary);">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <h3 class="text-lg text-muted mb-2">Material Circulated</h3>
                    <div class="text-5xl font-bold text-primary">${stats.materialCirculated}</div>
                </div>
                <div class="card" style="text-align:center; padding:3rem 2rem;">
                    <div style="width:80px;height:80px;background:#DBEAFE;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.5rem;color:#1E40AF;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                    </div>
                    <h3 class="text-lg text-muted mb-2">Estimated Landfill Diversion</h3>
                    <div class="text-5xl font-bold text-primary">${stats.landfillDiversion}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-3">
                ${Components.MetricCard('Carbon Points', stats.carbonPoints)}
                ${Components.MetricCard('Completed Exchanges', stats.completedExchanges)}
                ${Components.MetricCard('Community Participants', stats.communityParticipants)}
            </div>
        `, 'impact');
    },

    Profile: () => Components.AppLayout(`
        <h1 class="text-2xl mb-6 font-bold">Profile Settings</h1>
        
        <div class="grid" style="grid-template-columns: 1fr 2fr; gap:2rem;">
            <div class="card" style="text-align:center;">
                <div style="width:120px;height:120px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:3rem;font-weight:bold;color:var(--primary);margin:0 auto 1.5rem;">
                    ${(STORE.user?.name || 'E').charAt(0)}
                </div>
                <h2 class="text-xl font-bold mb-1">${STORE.user?.name || 'EcoPack Manufacturing Ltd'}</h2>
                <p class="text-muted mb-4">${STORE.user?.role || 'Waste Generator'}</p>
                <button class="btn btn-outline btn-block text-error" style="border-color:var(--error); color:var(--error);" onclick="handleLogout()">Logout</button>
            </div>
            
            <div>
                <div class="card mb-6">
                    <h3 class="font-bold mb-4">Account Information</h3>
                    <div class="form-group">
                        <label class="form-label text-sm text-muted">Email Address</label>
                        <div class="font-medium">${STORE.user?.email || 'ecopack.generator@circulareconomy.org'}</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label text-sm text-muted">Location</label>
                        <div class="font-medium">${STORE.user?.location || 'Industrial Zone A, Mumbai'}</div>
                    </div>
                    <div class="form-group mb-0">
                        <label class="form-label text-sm text-muted">Platform Connection</label>
                        <div class="font-medium text-success" style="color:var(--success);">● Connected to Supabase Backend</div>
                    </div>
                </div>
            </div>
        </div>
    `, 'profile')
};
