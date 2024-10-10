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

form.addEventListener("submit", async () => {
  const umkmName = document.getElementById("umkm_name").value;
  const umkmOwner = document.getElementById("umkm_owner").value;
  const instagramUrl = document.getElementById("instagram_url").value;
  const whatsappNumber = document.getElementById("whatsapp_number").value;
  const gmapsUrl = document.getElementById("gmaps_url").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);

  let latitudeError = document.getElementById("latitudeError");
  let longitudeError = document.getElementById("longitudeError");

  let isValid = true;

  latitudeError.textContent = "";
  longitudeError.textContent = "";

  if (isNaN(lat)) {
    latitudeError.textContent = "Longitude harus berupa angka";
    isValid = false;
  } else if (isNaN(lng)) {
    longitudeError.textContent = "Latitude harus berupa angka";
    isValid = false;
  }

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

    alert("apakah anda yakin mau menghapus data?");

    await fetch(`/api/deleteData/${el.id}`, {
      method: "DELETE",
    }).then(function () {
      window.location.reload();
    });
  });
});

logoutButton.addEventListener("click", function () {
  fetch("/api/admin/logout").then(function () {
    window.location.reload();
  });
});
