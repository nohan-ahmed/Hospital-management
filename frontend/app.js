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
    console.log(search);

    try {
        const response = await fetch(`https://test-thto.onrender.com/doctor/list/?search=${search ? search : ""}`)
        const data = await response.json()
        const parent = document.getElementById('doctors-container')
        parent.innerHTML = ''
        const no_data = document.getElementById('no-data')

        if (data.results.length > 0) {
            no_data.style.display = 'none'
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

        } else {
            no_data.style.display = 'block'
        }

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
        li.innerHTML = `<li onclick="loadDoctors('${item.name}')">${item.name}</li>`

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
        li.innerHTML = `<li onclick="loadDoctors('${item.name}')">${item.name}</li>`

        parent.appendChild(li)
    });
}

const serachDoctor = async () => {
    document.getElementById('search-btn').addEventListener('click', async (event) => {
        const value = document.getElementById('serach-box').value
        await loadDoctors(value)
    })
}

const loadReviews = async()=>{

    const response = await fetch('https://testing-8az5.onrender.com/doctor/review/')
    const data = await response.json()
    const parent  = document.getElementById('reviews-container')

    data.forEach(review => {
        let li = document.createElement('li')
        li.innerHTML = `
            <div class="card border-0 reviews-card">
                <div class="card-up" style="background-color: #9d789b;"></div>
                <div class="row p-2 align-items-center">
                  <div class="col-md-4 avatar bg-white">
                    <img src="img/reviewer.png" class="rounded-circle" />
                  </div>

                  <div class="col-md-8 ">
                    <h4 class="mb-2">${review.reviewer}</h4>
                    <h6>${review.rating}</h6>
                  </div>

                </div>

                <div class="card-body">
                  <hr />
                  <h5 class="review-title">“An amazing service”</h5>
                  <p class="dark-grey-text mt-3">
                    <i class="fas fa-quote-left pe-2"></i>Lorem ipsum dolor sit ametolil col consectetur adipiscing
                    lectus a nunc mauris scelerisque sed egestas.
                  </p>
                </div>
              </div>
              `

              parent.appendChild(li)
    });
}

async function main() {
    await loadServices()
    await loadDesignation()
    await loadSpecialization()
    await serachDoctor()
    await loadDoctors()
    await loadReviews()
}

main()