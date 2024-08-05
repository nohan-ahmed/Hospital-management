const loadServices = async () => {
    try {

        const response = await fetch('https://testing-8az5.onrender.com/services/')
        const data = await response.json()
        const parent = document.getElementById('slider-container')

        data.forEach(element => {
            const li = document.createElement('li')
            li.classList.add('slide-visible')
            li.innerHTML = `
                <div class="card shadow p-3">
                    <div class="ratio ratio-16x9">
                      <img src="${element.image}" class="card-img-top" loading="lazy" alt="...">
                    </div>
                    <div class="service-body py-4">
                      <h3 class="service-title h5">${element.name}</h3>
                      <p>${element.description.slice(0, 100)}...</p>
                      <a href="#" class="">Learn more <i class="fa-solid fa-arrow-right ms-1"></i></a>
                    </div>
                </div>
            `

            parent.appendChild(li)

        });
    } catch (error) {
        console.log(error)
    }


}

const loadDoctors = async (search) => {
    try {
        const response = await fetch(`https://test-thto.onrender.com/doctor/list/?search=${search?search:""}`)
        const data = await response.json()
        const parent = document.getElementById('doctors-container')
        parent.innerHTML = ''
        data.results.forEach(doctor => {
            let div = document.createElement('div')
            div.classList.add("col-md-4", "mb-5", "mb-md-0", "d-flex", "align-items-stretch")
            div.innerHTML = `
            <div class="card doctor-card">
                <div class="card-up" style="background-color: #9d789b;"></div>
                <div class="avatar mx-auto bg-white">
                  <img src="${doctor.image}" class="rounded-circle" />
                </div>
                <div class="card-body ">
                  <h4 class="mb-2">${doctor.full_name}</h4>
                  <h6 class="mb-4">${doctor.designation[0]}</h6>
                  <hr />
                  <p class="dark-grey-text mt-4">
                    <i class="fas fa-quote-left pe-2"></i>Lorem ipsum dolor sit amet eos adipisci,
                    consectetur adipisicing elit.
                  </p>
                </div>
            </div>
            
            `
            parent.appendChild(div)
        })

    } catch (error) {
        console.log(error);
    }
}

const loadDesignation = async () => {
    const response = await fetch('https://testing-8az5.onrender.com/doctor/designation/')
    const data = await response.json()

    const parent = document.getElementById('designation')
    data.forEach(item => {
        const li = document.createElement('li')
        li.classList.add('dropdown-item')
        li.innerText = item.name

        parent.appendChild(li)
    });
}

const loadSpecialization = async () => {
    const response = await fetch('https://testing-8az5.onrender.com/doctor/specialization/')
    const data = await response.json()

    const parent = document.getElementById('specialisation')
    data.forEach(item => {
        const li = document.createElement('li')
        li.classList.add('dropdown-item')
        li.innerText = item.name

        parent.appendChild(li)
    });
}

const serachDoctor = async () => {
    document.getElementById('search-btn').addEventListener('click', async (event) => {
        const value = document.getElementById('serach-box').value
        await loadDoctors(value)
    })
}

async function main() {
    await loadServices()
    await loadDesignation()
    await loadSpecialization()
    await serachDoctor()
    await loadDoctors()
}

main()