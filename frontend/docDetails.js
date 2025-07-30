const getParams = () => {
    return new URLSearchParams(window.location.search).get('doctorId');
};

const loadDoctor = async () => {
    const res = await fetch(`http://127.0.0.1:8000/doctors/${getParams()}`);
    const data = await res.json();

    const parent = document.getElementById('doc-info');
    parent.innerHTML = `
        <div class="col-md-3">
            <img src="${data.profile || 'img/default-doctor.png'}" alt="Doctor Image" class="img-fluid rounded" />
        </div>
        <div class="col-md-7 doc-text">
            <h2>Dr. ${data.user}</h2>
            <div class="mb-2">
                ${(data.specialisation || []).map(item => `<button class="btn btn-sm btn-outline-primary me-1 sp-btn">${item}</button>`).join('')}
            </div>
            <h5>${(data.designation || []).join(', ')}</h5>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam imperdiet facilisis enim.</p>
            <h4>Fees: ${data.fee} BDT</h4>
            <button type="button" class="btn btn-primary appointment" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Take Appointment
            </button>
        </div>
    `;
};

const loadReviews = async () => {
    const res = await fetch(`http://127.0.0.1:8000/reviews/?doctor=${getParams()}`);
    const data = await res.json();
    const parent = document.getElementById('reviews-container');
    parent.innerHTML = '';

    (data.results || []).forEach(review => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="card border-0 reviews-card">
                <div class="card-up" style="background-color: #9d789b;"></div>
                <div class="row p-2 align-items-center">
                    <div class="col">
                        <img src="img/reviewer.png" class="rounded-circle" />
                        <h4 class="mb-2">${review.reviwer || "Anonymous"}</h4>
                        <h6>${review.rating}</h6>
                    </div>
                </div>
                <div class="card-body">
                    <hr />
                    <h5 class="review-title">“An amazing service”</h5>
                    <p class="dark-grey-text mt-3 text-start">
                        <i class="fas fa-quote-left pe-2"></i>${review.body?.slice(0, 105)}...
                    </p>
                </div>
            </div>
        `;
        parent.appendChild(li);
    });
};

const getTimes = async (id) => {
    const res = await fetch(`http://127.0.0.1:8000/available-time/?id=${id}`);
    const data = await res.json();
    return data[0]; // Assuming each request returns an array with one item
};

const loadTime = async () => {
    const res = await fetch(`http://127.0.0.1:8000/doctors/${getParams()}`);
    const data = await res.json();

    const parent = document.getElementById('select_time');
    parent.innerHTML = '<option disabled selected>Select Time</option>';

    const timeList = data.available_time || [];
    for (const timeId of timeList) {
        const timeObj = await getTimes(timeId);
        const option = document.createElement('option');
        option.value = timeId;
        console.log(timeId, "____");
        option.innerText = timeObj.time;
        parent.appendChild(option);
    }
};

const appointment = async () => {
    document.getElementById('submite-appointment').addEventListener('click', async () => {
        const status = document.getElementsByName("status");
        const selected = Array.from(status).find((btn) => btn.checked);
        const symptom = document.getElementById("symptom").value;
        const time = document.getElementById("select_time");
        const selectedTime = time.options[time.selectedIndex];

        const token = localStorage.getItem("access");

        if (!token) {
            alert("Please log in first.");
            return;
        }

        if (!selectedTime || !selectedTime.value) {
            alert("Please select a time slot.");
            return;
        }

        const info = {
            appointment_type: selected?.value || 'Physical',
            appointment_status: "Pending",
            time: selectedTime.value,
            symptoms: symptom,
            cancel: false,
            doctor: getParams(),
        };

        const res = await fetch('http://127.0.0.1:8000/appointments/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(info),
        });

        const data = await res.json();
        console.log("Appointment response:", data);

        if (res.ok) {
            alert("Appointment submitted successfully!");
            location.reload();
        } else {
            alert("Failed to submit appointment. Check form inputs.");
        }
    });
};

async function main() {
    await loadDoctor();
    await loadReviews();
    await loadTime();
    await appointment();
}

main();
