document.addEventListener("DOMContentLoaded", function () {
    const img = document.getElementById("lichaamAfbeelding");
    const hotspots = document.getElementById("hotspots");
    const tooltip = document.getElementById("tooltip");

    function schaalSVG() {
        hotspots.setAttribute("width", img.clientWidth);
        hotspots.setAttribute("height", img.clientHeight);
    }

    schaalSVG();
    window.addEventListener("resize", schaalSVG);

    document.querySelectorAll(".hotspot").forEach(hotspot => {
        hotspot.addEventListener("mouseover", function (event) {
            tooltip.innerText = this.dataset.label;
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";
        });

        hotspot.addEventListener("mousemove", function (event) {
            tooltip.style.left = event.pageX + 10 + "px";
            tooltip.style.top = event.pageY + 10 + "px";
        });

        hotspot.addEventListener("mouseout", function () {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
        });

        hotspot.addEventListener("click", function () {
            window.location.href = this.dataset.url;
        });
    });
});
