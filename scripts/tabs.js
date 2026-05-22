const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

tabLinks.forEach(link => {
  link.addEventListener("click", () => {
    const tabId = link.getAttribute("data-tab");

    // Change active tab
    tabLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // Change active content
    tabContents.forEach(content => {
      content.classList.remove("active");
      if (content.id === tabId) {
        content.classList.add("active");
      }
    });
  });
});
