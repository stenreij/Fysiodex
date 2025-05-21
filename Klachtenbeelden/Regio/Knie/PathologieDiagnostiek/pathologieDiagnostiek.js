document.addEventListener("DOMContentLoaded", function () {
    const testToggles = document.querySelectorAll(".test-toggle");

    testToggles.forEach((toggle) => {
        toggle.addEventListener("click", function () {
            const parent = this.closest(".test-item");
            parent.classList.toggle("active");
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const testToggles = document.querySelectorAll(".test-toggle-info");

    testToggles.forEach((toggle) => {
        toggle.addEventListener("click", function () {
            const parent = this.closest(".test-item-info");
            parent.classList.toggle("active");
        });
    });
});