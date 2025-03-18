document.getElementById("analyzeButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    const resultDiv = document.getElementById("result");
    const previewImage = document.getElementById("preview");

    if (!fileInput.files.length) {
        alert("Veuillez s�lectionner une image.");
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("leafImage", file);

    // Afficher l'aper�u de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
    };
    reader.readAsDataURL(file);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            resultDiv.innerHTML = `<p>?? S�v�rit� de l'infection : <strong>${data.severity}%</strong></p>`;
        } else {
            resultDiv.innerHTML = `<p style="color:red;">Erreur : ${data.error}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color:red;">Probl�me de connexion avec le serveur.</p>`;
    }
});
