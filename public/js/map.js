createLoaderElement();

fetch("/api/location")
  .then((response) => response.json())
  .then(function (data) {
    render(data);
  });

function render(data) {
  removeLoaderElement();

  var mapElement = document.createElement("div");
  mapElement.id = "map";
  document.body.appendChild(mapElement);

  const map = L.map("map", {
    center: [-7.9292214, 112.6200943],
    zoom: 15,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  var myIcon = L.icon({
    iconUrl: "assets/image/marker.svg",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });

  for (let i = 0; i < data.length; i++) {
    L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)], {
      icon: myIcon,
    })
      .addTo(map)
      .bindPopup(
        `
          <div class="containers bg-white">
          <p id="data" class="fs-5 fw-bold mb-2">${data[i].umkm_name}</p>
          <p id="data" class="fs-6 text-secondary fw-bolder mb-2">${data[i].umkm_owner}</p>
          <div class="d-flex flex-column">
          <a href="${data[i].instagram}" target="_blank" id="data" class="btn btn-instagram text-white fs-6 fw-bold mb-2 text-decoration-none">Instagram</a>
          <a href="${data[i].whatsapp}" target="_blank" id="data" class="btn btn-success text-white fs-6 fw-bold mb-2 text-decoration-none">Whatsapp</a>
          </div>
          <br>
          <a
            href="${data[i].gmaps_url}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary text-light"
            >Lihat di Google Maps</a
          >
        </div>
        `
      );
  }
}

function createLoaderElement() {
  var loaderContainer = document.createElement("div");
  loaderContainer.id = "loader";
  loaderContainer.className =
    "d-flex flex-column align-items-center justify-content-center loader-container";

  var titleElement = document.createElement("h1");
  titleElement.className = "web-title fw-bold mb-0";
  titleElement.textContent = "TUMBAS NANG NDI";

  var descriptionElement = document.createElement("p");
  descriptionElement.textContent = "Web Peta UMKM Kelurahan Tunjungsekar";

  var loaderElement = document.createElement("div");
  loaderElement.className = "loader";

  loaderContainer.appendChild(titleElement);
  loaderContainer.appendChild(descriptionElement);
  loaderContainer.appendChild(loaderElement);

  document.body.appendChild(loaderContainer);
}

// Function to remove the specified HTML element
function removeLoaderElement() {
  var loaderElement = document.getElementById("loader");
  if (loaderElement) {
    loaderElement.parentNode.removeChild(loaderElement);
  }
}
