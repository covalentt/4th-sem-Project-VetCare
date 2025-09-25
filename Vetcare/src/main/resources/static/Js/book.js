document.addEventListener('DOMContentLoaded', function() {
    // ----------------------
    // Static Data
    // ----------------------
    const doctors = [
        { id: 1, name: 'Dr. Anil Sharma', specialty: 'General Vet' },
        { id: 2, name: 'Dr. Sita Koirala', specialty: 'Surgery' },
        { id: 3, name: 'Dr. Ramesh Thapa', specialty: 'Dentistry' }
    ];

    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

    let currentStep = 1;
    const totalSteps = 5;

    // ----------------------
    // Initialize form
    // ----------------------
    initializeForm();
    populateDoctors();
    populateTimeSlots();
    fetchServices();
    fetchPets();

    // ----------------------
    // Pet select change handler
    // ----------------------
    const petSelect = document.getElementById('petSelect');
    const newPetForm = document.getElementById('newPetForm');

    petSelect.addEventListener('change', function() {
        if (this.value === 'new') {
            newPetForm.style.display = 'block';
            newPetForm.querySelectorAll('[data-required="true"]').forEach(el => el.required = true);
        } else {
            newPetForm.style.display = 'none';
            newPetForm.querySelectorAll('[data-required="true"]').forEach(el => {
                el.required = false;
                el.value = '';
            });
        }
    });

    // ----------------------
    // Form submission handler
    // ----------------------
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        if (currentStep === totalSteps) {
            confirmBooking();
        }
    });

    // ----------------------
    // Populate Doctors
    // ----------------------
    function populateDoctors() {
        const doctorSelect = document.getElementById('doctorSelect');
        doctorSelect.innerHTML = '<option value="">Any Available Doctor</option>';
        doctors.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${doc.name} - ${doc.specialty}`;
            doctorSelect.appendChild(option);
        });
    }

    // ----------------------
    // Populate Time Slots
    // ----------------------
    function populateTimeSlots() {
        const container = document.getElementById('timeSlots');
        container.innerHTML = '';
        timeSlots.forEach(slot => {
            const div = document.createElement('div');
            div.className = 'time-slot';
            div.dataset.time = slot;
            div.textContent = formatTime(slot);
            container.appendChild(div);
        });

        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('selectedTime').value = this.dataset.time;
            });
        });
    }

    // ----------------------
    // Fetch Services
    // ----------------------
    async function fetchServices() {
        try {
            const services = [
                { id: 1, title: 'Routine Check-up', description: 'Comprehensive health examination for your pet', price: 1500, icon: 'fa-stethoscope' },
                { id: 2, title: 'Vaccination', description: 'Essential vaccines to protect your pet', price: 2000, icon: 'fa-syringe' },
                { id: 3, title: 'Dental Care', description: 'Professional cleaning and dental check', price: 2500, icon: 'fa-tooth' },
                { id: 4, title: 'Surgery Consultation', description: 'Expert advice for surgical procedures', price: 3000, icon: 'fa-user-doctor' },
                { id: 5, title: 'Grooming', description: 'Professional grooming services', price: 1000, icon: 'fa-paw' }
            ];

            const container = document.getElementById('serviceCards');
            container.innerHTML = '';
            services.forEach(service => {
                const label = document.createElement('label');
                label.className = 'service-option';
                label.innerHTML = `
                    <input type="radio" name="service" value="${service.id}" data-price="${service.price}">
                    <div class="service-icon"><i class="fas ${service.icon}"></i></div>
                    <div class="service-title">${service.title}</div>
                    <div class="service-description">${service.description}</div>
                    <div class="service-price">NPR ${service.price}</div>
                `;
                container.appendChild(label);

                label.querySelector('input').addEventListener('change', () => {
                    document.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
                    label.classList.add('selected');
                });
            });
        } catch (err) {
            console.error('Failed to fetch services:', err);
            document.getElementById('serviceError').style.display = 'block';
        }
    }

    // ----------------------
    // Fetch Pets
    // ----------------------
    async function fetchPets() {
        try {
            const pets = [
                { id: 1, name: 'Max', type: 'Dog' },
                { id: 2, name: 'Luna', type: 'Cat' }
            ];
            const petSelect = document.getElementById('petSelect');
            pets.forEach(pet => {
                const option = document.createElement('option');
                option.value = pet.id;
                option.textContent = `${pet.name} (${pet.type})`;
                petSelect.insertBefore(option, petSelect.querySelector('option[value="new"]'));
            });
        } catch (err) {
            console.error('Failed to fetch pets:', err);
            document.getElementById('petError').style.display = 'block';
        }
    }

    // ----------------------
    // Multi-step Navigation
    // ----------------------
    window.changeStep = function(direction) {
        if (direction === 1 && !validateCurrentStep()) return;

        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');

        currentStep += direction;

        document.getElementById(`step${currentStep}`).classList.add('active');
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

        if (direction === 1) {
            document.querySelector(`[data-step="${currentStep-1}"]`).classList.add('completed');
        }

        updateNavigationButtons();

        if (currentStep === totalSteps) updateSummary();

        document.querySelector('.booking-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        prevBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
        submitBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
    }

    // ----------------------
    // Validation & Summary
    // ----------------------
    function validateCurrentStep() {
        const stepEl = document.getElementById(`step${currentStep}`);
        let valid = true;

        if (currentStep === 1 && !document.querySelector('input[name="service"]:checked')) {
            alert('Please select a service.');
            return false;
        }

        if (currentStep === 2) {
            const petSelect = document.getElementById('petSelect');
            if (!petSelect.value) {
                petSelect.classList.add('is-invalid');
                alert('Please select a pet or add a new pet.');
                return false;
            }
            if (petSelect.value === 'new') {
                const requiredFields = document.querySelectorAll('#newPetForm [data-required="true"]');
                requiredFields.forEach(f => {
                    if (!f.value.trim()) {
                        f.classList.add('is-invalid');
                        valid = false;
                    } else {
                        f.classList.remove('is-invalid');
                    }
                });
                if (!valid) {
                    alert('Please fill in all required pet information fields.');
                    return false;
                }
            } else {
                petSelect.classList.remove('is-invalid');
            }
        }

        if (currentStep === 3 && !document.getElementById('selectedTime').value) {
            alert('Please select a time slot.');
            return false;
        }

        const requiredFields = stepEl.querySelectorAll('[required]');
        requiredFields.forEach(f => {
            if (!f.value.trim()) {
                f.classList.add('is-invalid');
                valid = false;
            } else {
                f.classList.remove('is-invalid');
            }
        });

        return valid;
    }

    function updateSummary() {
        const form = document.getElementById('bookingForm');
        const fd = new FormData(form);
        const selectedService = document.querySelector('input[name="service"]:checked');
        const serviceText = selectedService ? selectedService.closest('.service-option').querySelector('.service-title').textContent : '-';
        document.getElementById('summaryService').textContent = serviceText;

        const petSelect = document.getElementById('petSelect');
        const petName = petSelect.value === 'new' ? fd.get('petName') : petSelect.options[petSelect.selectedIndex].text.split(' (')[0];
        document.getElementById('summaryPetName').textContent = petName;

        const date = fd.get('appointmentDate');
        if (date) document.getElementById('summaryDate').textContent = new Date(date).toDateString();

        const time = fd.get('appointmentTime');
        if (time) document.getElementById('summaryTime').textContent = formatTime(time);

        const doctorSelect = document.getElementById('doctorSelect');
        document.getElementById('summaryDoctor').textContent = doctorSelect.options[doctorSelect.selectedIndex].text || 'Any Available Doctor';

        document.getElementById('summaryOwner').textContent = fd.get('ownerName') || '-';
        document.getElementById('summaryPhone').textContent = fd.get('phone') || '-';
        document.getElementById('summaryPrice').textContent = selectedService ? selectedService.dataset.price : '0';
    }

    // ----------------------
    // Confirm Booking & EmailJS
    // ----------------------
    async function sendBookingConfirmation(bookingData) {
        try {
            if (!bookingData.email) {
                alert("Please enter a valid email address.");
                return;
            }

            const templateParams = {
                to_name: bookingData.owner,
                to_email: bookingData.email,
                service: bookingData.service,
                pet: bookingData.petName,
                date: new Date(bookingData.date).toDateString(),
                time: formatTime(bookingData.time),
                doctor: bookingData.doctor || "Any Available Doctor",
                phone: bookingData.phone,
                total_price: bookingData.totalPrice,
                appointment_id: `VET${Date.now()}`
            };

            const response = await emailjs.send(
                'service_dwc58a3',
                'template_5gbee38',
                templateParams
            );

            console.log('SUCCESS!', response.status, response.text);

            document.getElementById('appointmentId').textContent = templateParams.appointment_id;
            document.getElementById('confirmationMessage').style.display = 'block';
            document.querySelector('.summary-card').style.display = 'none';
            document.querySelector('.navigation-buttons').style.display = 'none';

            alert(`Booking confirmed! A confirmation email has been sent to ${bookingData.email}`);
        } catch (error) {
            console.error('EmailJS Error:', error);
            alert(`Failed to send confirmation email. ${error.text || error.message}`);
        }
    }

    window.confirmBooking = async function() {
        if (!validateCurrentStep()) return;

        const form = document.getElementById('bookingForm');
        const fd = new FormData(form);
        const selectedService = document.querySelector('input[name="service"]:checked');
        const petSelect = document.getElementById('petSelect');
        const doctorSelect = document.getElementById('doctorSelect');

        const bookingData = {
            service: selectedService ? selectedService.closest('.service-option').querySelector('.service-title').textContent : '-',
            petName: petSelect.value === 'new' ? fd.get('petName') : petSelect.options[petSelect.selectedIndex].text.split(' (')[0],
            date: fd.get('appointmentDate'),
            time: fd.get('appointmentTime'),
            doctor: doctorSelect.options[doctorSelect.selectedIndex].text || 'Any Available Doctor',
            owner: fd.get('ownerName'),
            phone: fd.get('phone'),
            email: fd.get('email'),
            totalPrice: selectedService ? selectedService.dataset.price : '0'
        };

        await sendBookingConfirmation(bookingData);
    }

    // ----------------------
    // Utilities
    // ----------------------
    function formatTime(time) {
        const [h, m] = time.split(':');
        let hours = parseInt(h);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${m} ${suffix}`;
    }

    function initializeForm() {
        updateNavigationButtons();
    }
});
