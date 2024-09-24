const form = document.getElementById("editDataForm");
const umkmNameField = document.getElementById("umkm_name");
const umkmOwnerField = document.getElementById("umkm_owner");
const instagramField = document.getElementById("instagram_url");
const whatsappField = document.getElementById("whatsapp_number");
const gmapsUrlField = document.getElementById("gmaps_url");
const latField = document.getElementById("latitude");
const lngField = document.getElementById("longitude");
const el = document.querySelector(".form-container");

window.addEventListener("load", function () {
  getData(el.id);
});

function addSpinnerToButton() {
  var spinnerIcon = document.createElement("i");
  spinnerIcon.className = "fa fa-spinner fa-spin";

  var buttonElement = document.getElementById("btnSubmit");

  buttonElement.appendChild(spinnerIcon);
}

function removeWaMe(url) {
  if (url.startsWith("https://wa.me/")) {
    const phoneNumber = url.replace("https://wa.me/", "");
    const cleanedPhoneNumber = phoneNumber.replace(/[-\s]/g, "");
    return cleanedPhoneNumber;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  addSpinnerToButton();

  try {
    fetch(`/api/editData/${el.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        umkmName: umkmNameField.value,
        umkmOwner: umkmOwnerField.value,
        instagram: instagramField.value,
        whatsapp: whatsappField.value,
        gmapsUrl: gmapsUrlField.value,
        lat: latField.value,
        lng: lngField.value,
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        window.location.replace(
          `${window.location.origin}/${responseData.path}`
        );
      });
  } catch (error) {
    console.error("Error:", error);
  }
});

function getData(id) {
  fetch(`/api/getDataById/${id}`)
    .then((res) => res.json())
    .then((data) => {
      umkmNameField.value = data[0].umkm_name;
      umkmOwnerField.value = data[0].umkm_owner;
      instagramField.value = data[0].instagram;
      whatsappField.value = removeWaMe(data[0].whatsapp);
      gmapsUrlField.value = data[0].gmaps_url;
      latField.value = data[0].lat;
      lngField.value = data[0].lng;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
