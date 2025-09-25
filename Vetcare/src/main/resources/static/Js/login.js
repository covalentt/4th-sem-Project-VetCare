// login.js
document.addEventListener('DOMContentLoaded', () => {

    // ----------------- Toast -----------------
    function showToast(msg, type = "error"){
        const toast = document.getElementById("toast");
        if(!toast) return;
        toast.textContent = msg;
        toast.style.backgroundColor = type === "error" ? "#dc3545" : "#28a745";
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3000);
    }

    // ----------------- Password Toggle -----------------
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.parentElement.querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            toggle.querySelector('i').classList.toggle('fa-eye');
            toggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // ----------------- Login -----------------
    const loginSubmit = document.querySelector('.login-submit');
    if(loginSubmit){
        loginSubmit.setAttribute('type','button');
        loginSubmit.addEventListener('click', async (e)=>{
            e.preventDefault();

            // Ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = e.target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size/2}px`;
            ripple.style.top = `${e.clientY - rect.top - size/2}px`;
            e.target.appendChild(ripple);
            setTimeout(()=>ripple.remove(),600);

            const email = document.getElementById('email-input').value.trim();
            const password = document.getElementById('password-input').value.trim();
            if(!email || !password){ showToast("Enter email & password"); return; }

            try {
                const res = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if(data.success){
                    localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                    localStorage.setItem('authToken', data.token);
                    showToast(`Welcome ${data.user.name}!`, "success");

                    // Role-based redirect
                    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'profile.html';

                } else {
                    showToast(data.message || "Login failed");
                }
            } catch(err){
                console.error(err);
                showToast("Server error. Try again.");
            }
        });
    }

    // ----------------- Navbar Login Check -----------------
    const navButtons = document.querySelector('.nav-buttons');
    if(navButtons){
        const loggedUser = localStorage.getItem('loggedInUser');
        if(loggedUser){
            const user = JSON.parse(loggedUser);
            navButtons.innerHTML = `
            <a href="${user.role==='admin'?'admin.html':'profile.html'}" class="btn btn-outline-primary rounded-circle p-2" title="${user.name}">
                <img src="${user.avatarUrl || '/image/default-avatar.png'}" alt="Avatar" style="width:35px;height:35px;border-radius:50%;">
            </a>
            `;
        } else {
            navButtons.innerHTML = `
                <a href="login.html" class="btn btn-outline-primary me-2">Log In</a>
                <a href="book.html" class="btn btn-primary">Book Now</a>
            `;
        }
    }

    // ----------------- Particle Animation -----------------
    const canvas = document.getElementById('particle-canvas');
    if(canvas){
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = window.innerWidth < 768 ? 0 : 15;

        class Particle{
            constructor(){
                this.x = Math.random()*canvas.width;
                this.y = Math.random()*canvas.height;
                this.size = Math.random()*10+5;
                this.speedX = Math.random()*0.5-0.25;
                this.speedY = Math.random()*0.5-0.25;
            }
            update(mx,my){
                this.x += this.speedX;
                this.y += this.speedY;
                if(mx && my){
                    const dx = mx-this.x;
                    const dy = my-this.y;
                    const d = Math.sqrt(dx*dx + dy*dy);
                    if(d<100){ this.x -= dx*0.02; this.y -= dy*0.02; }
                }
                if(this.x<0 || this.x>canvas.width) this.speedX*=-1;
                if(this.y<0 || this.y>canvas.height) this.speedY*=-1;
            }
            draw(){
                ctx.fillStyle='rgba(96,165,250,0.5)';
                ctx.beginPath();
                ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
                ctx.fill();
            }
        }

        for(let i=0;i<particleCount;i++) particles.push(new Particle());

        let mouseX=null, mouseY=null;
        canvas.addEventListener('mousemove',(e)=>{ mouseX=e.clientX; mouseY=e.clientY; });

        function animateParticles(){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            particles.forEach(p => { p.update(mouseX,mouseY); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        if(particleCount>0) animateParticles();

        window.addEventListener('resize',()=>{ canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
    }

});
