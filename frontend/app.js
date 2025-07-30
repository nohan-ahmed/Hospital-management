const loadServices = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/services/');
        if (!response.ok) throw new Error(`Failed to load services. Status: ${response.status}`);

        const data = await response.json();
        console.log("Services data:", data);

        const parent = document.getElementById('slider-container');

        data.forEach(element => {
            const li = document.createElement('li');
            li.classList.add('slide-visible');

            li.innerHTML = `
                <div class="card shadow p-3">
                    <div class="ratio ratio-16x9">
                      <img src="${element.image || 'img/default.png'}" class="card-img-top" loading="lazy" alt="${element.name}">
                    </div>
                    <div class="service-body py-4">
                      <h3 class="service-title h5">${element.name}</h3>
                      <p>${(element.description || '').slice(0, 100)}...</p>
                      <a href="#" onclick="event.preventDefault()">Learn more <i class="fa-solid fa-arrow-right ms-1"></i></a>
                    </div>
                </div>
            `;

            parent.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading services:", error);
    }
};

const loadDoctors = async (searchQuery = '') => {
    console.log("http://127.0.0.1:8000/doctors/?search=:", searchQuery);

    try {
        const url = `http://127.0.0.1:8000/doctors/?search=${searchQuery}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load doctors. Status: ${response.status}`);

        const data = await response.json();
        console.log("Doctors data:", data);

        const parent = document.getElementById('doctors-container');
        const no_data = document.getElementById('no-data');
        parent.innerHTML = '';

        if (data.results && data.results.length > 0) {
            no_data.style.display = 'none';

            data.results.forEach(doctor => {
                let div = document.createElement('div');
                div.classList.add("col-md-4", "mb-5", "mb-md-0", "d-flex", "align-items-stretch");

                // Fallbacks
                const image = doctor.profile || 'img/default.png';
                const name = doctor.user || 'Unknown Doctor';
                const designation = doctor.designation

                div.innerHTML = `
                    <a href="docDetails.html?doctorId=${doctor.id}">
                        <div class="card doctor-card">
                            <div class="card-up" style="background-color: #9d789b;"></div>
                            <div class="avatar mx-auto bg-white">
                                <img src="${image}" class="rounded-circle" alt="${name}">
                            </div>
                            <div class="card-body">
                                <h4 class="mb-2">${name}</h4>
                                <h6 class="mb-4">${designation}</h6>
                                <hr />
                                <p class="dark-grey-text mt-4">
                                    <i class="fas fa-quote-left pe-2"></i>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                </p>
                            </div>
                        </div>
                    </a>
                `;
                parent.appendChild(div);
            });

        } else {
            no_data.style.display = 'block';
        }

    } catch (error) {
        console.error("Error loading doctors:", error);
    }
};

const loadDesignation = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/designations/');
        const data = await response.json();

        const parent = document.getElementById('designation');
        data.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('dropdown-item');
            li.innerHTML = `<li onclick="loadDoctors('${item.name}')">${item.name}</li>`;
            parent.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading designations:", error);
    }
};

const loadSpecialization = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/specialisations/');
        const data = await response.json();

        const parent = document.getElementById('specialisation');
        data.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('dropdown-item');
            li.innerHTML = `<li onclick="loadDoctors('${item.name}')">${item.name}</li>`;
            parent.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading specialization:", error);
    }
};

const setupSearchDoctor = () => {
    document.getElementById('search-btn').addEventListener('click', async (event) => {
        const value = document.getElementById('serach-box').value.trim();
        await loadDoctors(value);
    });
};

const loadReviews = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/reviews/');
        const data = await response.json();

        console.log("Review API response:", data); // Optional debugging

        const parent = document.getElementById('reviews-container');
        parent.innerHTML = '';

        (data.results || []).forEach(review => {
            let li = document.createElement('li');
            li.innerHTML = `
                <div class="card border-0 reviews-card">
                    <div class="card-up" style="background-color: #9d789b;"></div>
                    <div class="row p-2 align-items-center">
                        <div class="col-md-4 avatar bg-white">
                            <img src="img/reviewer.png" class="rounded-circle" />
                        </div>
                        <div class="col-md-8">
                            <h4 class="mb-2">${review.reviewer}</h4>
                            <h6>${review.rating}</h6>
                        </div>
                    </div>
                    <div class="card-body">
                        <hr />
                        <h5 class="review-title">“${review.body}”</h5>
                        <p class="dark-grey-text mt-3">
                            <i class="fas fa-quote-left pe-2"></i>Lorem ipsum dolor sit amet consectetur adipiscing elit.
                        </p>
                    </div>
                </div>
            `;
            parent.appendChild(li);
        });

    } catch (error) {
        console.error("Error loading reviews:", error);
    }
};


async function main() {
    await loadServices();
    await loadDesignation();
    await loadSpecialization();
    await setupSearchDoctor();
    await loadDoctors(); // load initial doctors
    await loadReviews();
}

main();
