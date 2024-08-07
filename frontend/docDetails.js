const getParams = () => {
    const params = new URLSearchParams(window.location.search).get('doctorId')
    return params
}

const loadDoctor = async () => {
    const res = await fetch(`https://test-thto.onrender.com/doctor/list/${getParams()}`)
    const data = await res.json()
    const parent = document.getElementById('doc-info')
    parent.innerHTML = `
        <div class="col-md-3">
          <img src="${data.image}" alt="">
        </div>

        <div class="col-md-7 doc-text">
          <h2>${data.full_name}</h2>
          <h5>${data.specialization.map(item => {
        return `<button type="button" class="sp-btn">${item}</button>`
    })}</h5>
          <h5>${data.designation.map(item => {
        return `${item}`
    })}</h5>
          <p>Lorem ipsum dolor sit amet consecte adipiscing elit amet hendrerit pretium nulla sed enim iaculis mi. </p>
          <h4>Fees: 2000 BDT</h4>
            <!-- Button trigger modal -->
            <button type="button" class="btn btn-primary appointment" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Take appointment
            </button>
        </div>
    
    `
}

const loadReviews = async () => {
    const res = await fetch(`https://testing-8az5.onrender.com/doctor/review/?doctor_id=${getParams()}`)
    const data = await res.json()
    const parent = document.getElementById('reviews-container')

    data.forEach(review => {
        let li = document.createElement('li')
        li.innerHTML = `
            <div class="card border-0 reviews-card">
                <div class="card-up" style="background-color: #9d789b;"></div>
                <div class="row p-2 align-items-center">
                  <div class="col">
                    <img src="img/reviewer.png" class="rounded-circle" />
                    <h4 class="mb-2">${review.reviewer}</h4>
                    <h6>${review.rating}</h6>
                  </div>

                </div>

                <div class="card-body">
                  <hr />
                  <h5 class="review-title">“An amazing service”</h5>
                  <p class="dark-grey-text mt-3 text-start">
                    <i class="fas fa-quote-left pe-2"></i>${review.body.slice(0, 105)}...
                  </p>
                </div>
              </div>
              `

        parent.appendChild(li)
    });
}


const loadTime = async () => {
    const res = await fetch(`https://testing-8az5.onrender.com/doctor/availabletime/?doctor_id=${getParams()}`)
    const data = await res.json()
    const parent = document.getElementById('select_time')

    data.forEach(time => {
        const option = document.createElement('option')
        option.value = time.id;
        option.innerText = time.name;
        parent.appendChild(option)
    });
}

const appointment = async () => {
    document.getElementById('submite-appointment').addEventListener('click', async (event) => {
        const status = document.getElementsByName("status");
        const selected = Array.from(status).find((button) => button.checked);
        const symptom = document.getElementById("symptom").value;
        const time = document.getElementById("select_time");
        const selectedTime = time.options[time.selectedIndex];
        const info = {
            appointment_type: selected.value,
            appointment_status: "Pending",
            time: selectedTime.value,
            symptom: symptom,
            cancel: false,
            patient: 2,
            doctor: getParams(),
        };

        const res = await fetch('https://testing-8az5.onrender.com/appointment/', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(info),
        })

        const data = await res.json()
        console.log(data);
    })
}

async function main() {
    await loadDoctor()
    await loadReviews()
    await loadTime()
    await appointment()
}

main()