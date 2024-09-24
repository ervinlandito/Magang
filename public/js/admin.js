const form = document.getElementById("addDataForm");
const deleteButtons = document.querySelectorAll(".btnDelete");
const logoutButton = document.getElementById("btnLogout");

form.addEventListener("submit", async () => {
  const umkmName = document.getElementById("umkm_name").value;
  const umkmOwner = document.getElementById("umkm_owner").value;
  const instagramUrl = document.getElementById("instagram_url").value;
  const whatsappNumber = document.getElementById("whatsapp_number").value;
  const gmapsUrl = document.getElementById("gmaps_url").value;
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);

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
      });
  } catch (error) {
    console.error("Error:", error);
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
