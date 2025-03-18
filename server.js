const express = require("express");
const multer = require("multer");
const cv = require("opencv4nodejs");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Configurer Multer pour l'upload des images
const upload = multer({ dest: "uploads/" });

app.use(express.static("public")); // Servir les fichiers frontend (HTML, CSS, JS)

// Endpoint pour l'upload et le traitement d'image
app.post("/upload", upload.single("leafImage"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucune image fournie" });
        }

        const imagePath = req.file.path;
        const image = cv.imread(imagePath);

        // Convertir l'image en HSV
        const hsv = image.cvtColor(cv.COLOR_BGR2HSV);
        const saturation = hsv.splitChannels()[1];

        // Détection du masque de feuille
        const leafMask = saturation.threshold(25, 255, cv.THRESH_BINARY);
        
        // Détection des zones infectées (jaune-brun)
        const lower = new cv.Vec(15, 50, 50);
        const upper = new cv.Vec(30, 255, 255);
        const infectedMask = hsv.inRange(lower, upper).bitwiseAnd(leafMask);

        // Calcul de la sévérité
        const totalLeafPixels = leafMask.countNonZero();
        const infectedPixels = infectedMask.countNonZero();
        const severity = totalLeafPixels ? (infectedPixels / totalLeafPixels) * 100 : 0;

        // Supprimer le fichier temporaire
        fs.unlinkSync(imagePath);

        res.json({ severity: severity.toFixed(2) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
