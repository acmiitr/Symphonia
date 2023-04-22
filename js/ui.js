import Stats from "stats.js";

function createStats() {
    var stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0";
    stats.domElement.style.top = "0";

    return stats;
}
