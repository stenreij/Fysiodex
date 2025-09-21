const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

tabLinks.forEach(link => {
  link.addEventListener("click", () => {
    const tabId = link.getAttribute("data-tab");

    // Active link wisselen
    tabLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // Content wisselen
    tabContents.forEach(content => {
      content.classList.remove("active");
      if (content.id === tabId) {
        content.classList.add("active");
      }
    });
  });
});
