const form = document.getElementById("addDataForm");
const deleteButtons = document.querySelectorAll(".btnDelete");
const logoutButton = document.getElementById("btnLogout");
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
  const searchValue = searchInput.value.toLowerCase();
  const tableRows = document.querySelectorAll("tbody tr");

  tableRows.forEach(function (row) {
    const umkmName = row
      .querySelector("td:first-child")
      .textContent.toLowerCase();
    if (umkmName.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const umkmName = document.getElementById("umkm_name").value;
  const umkmOwner = document.getElementById("umkm_owner").value;
  const instagramUrl = document.getElementById("instagram_url").value;
  const whatsappNumber = document.getElementById("whatsapp_number").value;
  const gmapsUrl = document.getElementById("gmaps_url").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);

  const umkmNameError = document.getElementById("umkmNameError");
  const umkmOwnerError = document.getElementById("umkmOwnerError");
  const instagramUrlError = document.getElementById("instagramUrlError");
  const whatsappNumberError = document.getElementById("whatsappNumberError");
  const gmapsUrlError = document.getElementById("gmapsUrlError");
  const latitudeError = document.getElementById("latitudeError");
  const longitudeError = document.getElementById("longitudeError");

  let isValid = true;

  umkmNameError.textContent = "";
  umkmOwnerError.textContent = "";
  instagramUrlError.textContent = "";
  whatsappNumberError.textContent = "";
  gmapsUrlError.textContent = "";
  latitudeError.textContent = "";
  longitudeError.textContent = "";

  if (umkmName.length < 2 || umkmName.length > 25) {
    umkmNameError.textContent = "Nama UMKM harus terdiri dari 2-25 karakter.";
    isValid = false;
  }

  if (umkmOwner.length < 2 || umkmOwner.length > 35) {
    umkmOwnerError.textContent =
      "Nama Pemilik harus terdiri dari 2-35 karakter.";
    isValid = false;
  }

  if (instagramUrl.length < 2 || instagramUrl.length > 50) {
    instagramUrlError.textContent =
      "Link Instagram harus terdiri dari 2-50 karakter.";
    isValid = false;
  }

  if (whatsappNumber.length !== 12) {
    whatsappNumberError.textContent =
      "Nomor WhatsApp harus terdiri dari 12 karakter.";
    isValid = false;
  }

  if (gmapsUrl.length < 25 || gmapsUrl.length > 255) {
    gmapsUrlError.textContent =
      "Link Google Maps harus terdiri dari 25-255 karakter.";
    isValid = false;
  }

  // if (isNaN(lat)) {
  //   latitudeError.textContent = "Longitude harus berupa angka";
  // } else if (isNaN(lng)) {
  //   longitudeError.textContent = "Latitude harus berupa angka";
  // }

  if (isValid) {
    try {
      await fetch("/api/addData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          umkmName,
          umkmOwner,
          instagramUrl,
          whatsappNumber,
          gmapsUrl,
          lat,
          lng,
        }),
      })
        .then((response) => response.json())
        .then((responseData) => {
          form.reset();
          window.location.replace(
            `${window.location.origin}/${responseData.path}`
          );
          window.location.reload();
        });
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

deleteButtons.forEach(function (button) {
  button.addEventListener("click", async function () {
    const el = this.closest("tr");
    Swal.fire({
      title: "Anda yakin?",
      text: "Data ini akan terhapus dari sistem!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus saja!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/deleteData/${el.id}`, {
          method: "DELETE",
        })
          .then(async (response) => {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              return response.json();
            } else {
              throw new Error("Response is not JSON");
            }
          })
          .then((data) => {
            if (data) {
              Swal.fire("Deleted!", "Data berhasil dihapus!", "success");
              el.remove();
            } else {
              Swal.fire("Error", "Gagal menghapus data!", "error");
            }
          });
      }
    });
  });
});

logoutButton.addEventListener("click", function () {
  fetch("/api/admin/logout").then(function () {
    window.location.reload();
  });
});
