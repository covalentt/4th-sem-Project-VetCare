// document.addEventListener('DOMContentLoaded', async () => {
//     const navButtons = document.querySelector('.nav-buttons');
//
//     if (!navButtons) {
//         console.error('Navbar container not found!');
//         return;
//     }
//     navButtons.innerHTML = `
//         <li class="nav-item"><a class="nav-link" href="/login">Login</a></li>
//         <li class="nav-item"><a class="nav-link" href="/book">Book Now</a></li>
//     `;
//         }
//
//         if (!token) {
//             console.log('[Navbar] No token found, showing logged-out navbar');
//             showLoggedOutNav();
//             return;
//         }
//
//         try {
//             let user = JSON.parse(localStorage.getItem('loggedInUser'));
//
//             if (!user) {
//                 const res = await fetch('http://localhost:8080/api/users/me', {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                         'Content-Type': 'application/json'
//                     }
//                 });
//
//                 if (res.status === 401 || res.status === 403) {
//                     console.warn(`[Navbar] Access denied (status: ${res.status}). Token might be invalid or expired.`);
//                     localStorage.removeItem('authToken');
//                     showLoggedOutNav();
//                     return;
//                 }
//
//                 if (!res.ok) {
//                     console.error(`[Navbar] Fetch /users/me failed: ${res.status} ${res.statusText}`);
//                     showLoggedOutNav();
//                     return;
//                 }
//
//                 const data = await res.json();
//                 user = data.user;
//                 if (!user) {
//                     console.warn('[Navbar] No user object returned from /users/me');
//                     showLoggedOutNav();
//                     return;
//                 }
//
//                 localStorage.setItem('loggedInUser', JSON.stringify(user));
//             }
//
//             const firstName = user.name ? user.name.split(' ')[0] : 'User';
//             const avatarUrl = user.avatar_url || '/image/avatar1.jpg'; // Adjusted default avatar path
//
//             navButtons.innerHTML = `
//                 <div class="navbar-user" style="position: relative; display: inline-block;">
//                    <img id="navProfileImage" src="${avatarUrl}" alt="Avatar" title="${firstName}"
//                         style="width: 50px !important;
//                                height: 50px !important;
//                                max-width: 50px !important;
//                                max-height: 50px !important;
//                                border-radius: 50% !important;
//                                object-fit: cover !important;
//                                border: 2px solid var(--primary) !important;
//                                cursor: pointer;
//                                transition: transform 0.2s ease;">
//                     <div class="navbar-user-dropdown" style="display: none;
//                                                             position: absolute;
//                                                             top: calc(100% + 5px);
//                                                             right: 0;
//                                                             background: white;
//                                                             box-shadow: 0 4px 20px rgba(0,0,0,0.15);
//                                                             border-radius: 8px;
//                                                             overflow: hidden;
//                                                             z-index: 1001;
//                                                             min-width: 150px;
//                                                             opacity: 0;
//                                                             transform: translateY(-10px);
//                                                             transition: all 0.3s ease;">
//                         <a href="/profile" style="display: block;
//                                                   padding: 12px 16px;
//                                                   color: #333;
//                                                   text-decoration: none;
//                                                   font-size: 14px;
//                                                   transition: background 0.2s;
//                                                   border: none;">Profile</a>
//                         <a href="#" id="logout" class="text-danger" style="display: block;
//                                                                           padding: 12px 16px;
//                                                                           color: #dc3545 !important;
//                                                                           text-decoration: none;
//                                                                           font-size: 14px;
//                                                                           transition: background 0.2s;
//                                                                           border: none;">Log Out</a>
//                     </div>
//                 </div>
//                 <a href="/book" class="btn btn-primary ms-2">Book Now</a>
//             `;
//
//             const navbarUser = document.querySelector('.navbar-user');
//             const avatar = navbarUser.querySelector('img');
//             const dropdown = navbarUser.querySelector('.navbar-user-dropdown');
//             const dropdownLinks = dropdown.querySelectorAll('a');
//
//             avatar.addEventListener('mouseenter', () => {
//                 avatar.style.transform = 'scale(1.1)';
//             });
//             avatar.addEventListener('mouseleave', () => {
//                 avatar.style.transform = 'scale(1)';
//             });
//
//             navbarUser.addEventListener('mouseenter', () => {
//                 dropdown.style.display = 'block';
//                 setTimeout(() => {
//                     dropdown.style.opacity = '1';
//                     dropdown.style.transform = 'translateY(0)';
//                 }, 10);
//             });
//
//             navbarUser.addEventListener('mouseleave', () => {
//                 dropdown.style.opacity = '0';
//                 dropdown.style.transform = 'translateY(-10px)';
//                 setTimeout(() => {
//                     dropdown.style.display = 'none';
//                 }, 300);
//             });
//
//             dropdownLinks.forEach(link => {
//                 link.addEventListener('mouseenter', () => {
//                     if (link.id === 'logout') {
//                         link.style.backgroundColor = '#ffe6e6';
//                         link.style.color = '#dc3545';
//                     } else {
//                         link.style.backgroundColor = '#f8f9fa';
//                     }
//                 });
//                 link.addEventListener('mouseleave', () => {
//                     link.style.backgroundColor = 'transparent';
//                     if (link.id === 'logout') {
//                         link.style.color = '#dc3545';
//                     }
//                 });
//             });
//
//             const logoutBtn = document.getElementById('logout');
//             if (logoutBtn) {
//                 logoutBtn.addEventListener('click', (e) => {
//                     e.preventDefault();
//                     localStorage.removeItem('authToken');
//                     localStorage.removeItem('loggedInUser');
//                     window.location.reload();
//                 });
//             }
//
//             window.addEventListener('storage', (event) => {
//                 if (event.key === 'loggedInUser') {
//                     const updatedUser = JSON.parse(event.newValue);
//                     if (updatedUser && updatedUser.avatar_url) {
//                         avatar.src = updatedUser.avatar_url;
//                     }
//                 }
//             });
//
//         } catch (err) {
//             console.error('[Navbar] Error fetching user:', err);
//             showLoggedOutNav();
//         }
//     }
//
//     await renderNavbar();
// });

document.addEventListener('DOMContentLoaded', async () => {
    const navButtons = document.querySelector('.nav-buttons');
    if (!navButtons) {
        console.error('Navbar container not found!');
        return;
    }

    // Function to show logged out navigation
    function showLoggedOutNav() {
        navButtons.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="/login">Login</a></li>
            <li class="nav-item"><a class="nav-link" href="/book">Book Now</a></li>
        `;
    }

    // Function to render navbar based on authentication status
    async function renderNavbar() {
        const token = localStorage.getItem('authToken');

        if (!token) {
            console.log('[Navbar] No token found, showing logged-out navbar');
            showLoggedOutNav();
            return;
        }

        try {
            let user = JSON.parse(localStorage.getItem('loggedInUser'));

            if (!user) {
                const res = await fetch('http://localhost:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.status === 401 || res.status === 403) {
                    console.warn(`[Navbar] Access denied (status: ${res.status}). Token might be invalid or expired.`);
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('loggedInUser');
                    showLoggedOutNav();
                    return;
                }

                if (!res.ok) {
                    console.error(`[Navbar] Fetch /users/me failed: ${res.status} ${res.statusText}`);
                    showLoggedOutNav();
                    return;
                }

                const data = await res.json();
                user = data.user;

                if (!user) {
                    console.warn('[Navbar] No user object returned from /users/me');
                    showLoggedOutNav();
                    return;
                }

                localStorage.setItem('loggedInUser', JSON.stringify(user));
            }

            const firstName = user.name ? user.name.split(' ')[0] : 'User';
            const avatarUrl = user.avatar_url || '/image/avatar1.jpg';

            navButtons.innerHTML = `
                <div class="navbar-user" style="position: relative; display: inline-block;">
                    <img id="navProfileImage" src="${avatarUrl}" alt="Avatar" title="${firstName}" 
                         style="width: 50px !important; height: 50px !important; max-width: 50px !important; 
                                max-height: 50px !important; border-radius: 50% !important; object-fit: cover !important; 
                                border: 2px solid var(--primary) !important; cursor: pointer; transition: transform 0.2s ease;">
                    <div class="navbar-user-dropdown" style="display: none; position: absolute; top: calc(100% + 5px); 
                                                              right: 0; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
                                                              border-radius: 8px; overflow: hidden; z-index: 1001; min-width: 150px; 
                                                              opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;">
                        <a href="/profile" style="display: block; padding: 12px 16px; color: #333; text-decoration: none; 
                                                  font-size: 14px; transition: background 0.2s; border: none;">Profile</a>
                        <a href="#" id="logout" class="text-danger" style="display: block; padding: 12px 16px; 
                                                                           color: #dc3545 !important; text-decoration: none; 
                                                                           font-size: 14px; transition: background 0.2s; 
                                                                           border: none;">Log Out</a>
                    </div>
                </div>
                <a href="/book" class="btn btn-primary ms-2">Book Now</a>
            `;

            // Add event listeners for dropdown functionality
            const navbarUser = document.querySelector('.navbar-user');
            const avatar = navbarUser.querySelector('img');
            const dropdown = navbarUser.querySelector('.navbar-user-dropdown');
            const dropdownLinks = dropdown.querySelectorAll('a');

            // Avatar hover effects
            avatar.addEventListener('mouseenter', () => {
                avatar.style.transform = 'scale(1.1)';
            });

            avatar.addEventListener('mouseleave', () => {
                avatar.style.transform = 'scale(1)';
            });

            // Dropdown show/hide functionality
            navbarUser.addEventListener('mouseenter', () => {
                dropdown.style.display = 'block';
                setTimeout(() => {
                    dropdown.style.opacity = '1';
                    dropdown.style.transform = 'translateY(0)';
                }, 10);
            });

            navbarUser.addEventListener('mouseleave', () => {
                dropdown.style.opacity = '0';
                dropdown.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    dropdown.style.display = 'none';
                }, 300);
            });

            // Dropdown link hover effects
            dropdownLinks.forEach(link => {
                link.addEventListener('mouseenter', () => {
                    if (link.id === 'logout') {
                        link.style.backgroundColor = '#ffe6e6';
                        link.style.color = '#dc3545';
                    } else {
                        link.style.backgroundColor = '#f8f9fa';
                    }
                });

                link.addEventListener('mouseleave', () => {
                    link.style.backgroundColor = 'transparent';
                    if (link.id === 'logout') {
                        link.style.color = '#dc3545';
                    }
                });
            });

            // Logout functionality
            const logoutBtn = document.getElementById('logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('loggedInUser');
                    window.location.reload();
                });
            }

            // Listen for storage changes to update avatar
            window.addEventListener('storage', (event) => {
                if (event.key === 'loggedInUser' && event.newValue) {
                    const updatedUser = JSON.parse(event.newValue);
                    if (updatedUser && updatedUser.avatar_url) {
                        const currentAvatar = document.getElementById('navProfileImage');
                        if (currentAvatar) {
                            currentAvatar.src = updatedUser.avatar_url;
                        }
                    }
                }
            });

        } catch (err) {
            console.error('[Navbar] Error fetching user:', err);
            showLoggedOutNav();
        }
    }

    // Initialize navbar
    await renderNavbar();
});