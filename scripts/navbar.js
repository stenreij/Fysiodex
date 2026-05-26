const currentPath = window.location.pathname;
const jsonPathNavbar = "/json/navbar-data.json";

fetch(jsonPathNavbar)
  .then((response) => response.json())
  .then((data) => {
    const navContainer = document.querySelector(".nav-container");
    navContainer.innerHTML = "";

    // Logo
    const navLogo = document.createElement("a");
    navLogo.href = data.logo.url;
    navLogo.className = "nav-logo";
    if (currentPath === "/" || currentPath === "/index.html") {
      navLogo.classList.add("active");
    }

    const logoImg = document.createElement("img");
    logoImg.src = data.logo.image;
    logoImg.alt = data.logo.text;
    logoImg.className = "hero-logo";
    navLogo.appendChild(logoImg);
    navLogo.appendChild(document.createTextNode(" " + data.logo.text));
    navContainer.appendChild(navLogo);

    // Links
    const navLinks = document.createElement("ul");
    navLinks.className = "nav-links";

    data.navLinks.forEach((link) => {
      if (link.type === "submenu") {
        const li = document.createElement("li");
        li.className = "has-submenu";

        const a = document.createElement("a");
        a.href = link.url;
        a.className = "submenu-trigger";
        a.innerHTML = `${link.text}<i class="fas fa-chevron-down"></i>`;

        const ul = document.createElement("ul");
        ul.className = "submenu";

        link.submenu.forEach((sub) => {
          const subLi = document.createElement("li");
          const subA = document.createElement("a");
          subA.href = sub.url;
          subA.textContent = sub.text;
          subLi.appendChild(subA);
          ul.appendChild(subLi);
        });

        li.appendChild(a);
        li.appendChild(ul);
        navLinks.appendChild(li);
      } else {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.url;
        a.textContent = link.text;

        // Check if the current path matches the link URL or its directory
        if (link.url !== "#") {
          const cleanLinkUrl = link.url.replace(/^\//, "");
          const linkDir = cleanLinkUrl.split("/")[0];

          if (
            currentPath.includes("/" + linkDir + "/") ||
            currentPath === "/" + cleanLinkUrl
          ) {
            a.classList.add("active");
          }
        }

        li.appendChild(a);
        navLinks.appendChild(li);
      }
    });

    navContainer.appendChild(navLinks);
  })
  .catch((error) => console.error("Error loading navbar:", error));
