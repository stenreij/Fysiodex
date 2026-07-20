const currentPath = window.location.pathname;
const jsonPathNavbar = "/json/navbar-data.json";

fetch(jsonPathNavbar)
    .then((response) => response.json())
    .then((data) => {
        const navContainer = document.querySelector(".nav-container");
        navContainer.innerHTML = "";

        // LOGO 
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

        // HAMBURGER BUTTON
        let hamburger = document.getElementById("hamburger");
        if (!hamburger) {
            hamburger = document.createElement("button");
            hamburger.id = "hamburger";
            hamburger.className = "hamburger";
            hamburger.setAttribute("aria-label", "Menu openen");
            hamburger.setAttribute("aria-expanded", "false");
            hamburger.innerHTML = `
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            `;
            navContainer.appendChild(hamburger);
        }

        // NAV LINKS
        const navLinks = document.createElement("ul");
        navLinks.className = "nav-links";
        navLinks.id = "navMenu";

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
            } else if (link.type === "toggle") {
                const li = document.createElement("li");
                li.className = "lang-toggle-item";

                const toggleWrapper = document.createElement("div");
                toggleWrapper.className = "lang-toggle-wrapper";
                toggleWrapper.innerHTML = `
                    <div class="slider-bg"></div>
                    <div class="lang-icon nl-icon active" data-lang="nl">
                        <i class="fas ${link.nlIcon}"></i>
                    </div>
                    <div class="lang-icon la-icon" data-lang="la">
                        <i class="fas ${link.laIcon}"></i>
                    </div>
                `;

                li.appendChild(toggleWrapper);
                navLinks.appendChild(li);
            } else {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = link.url;
                a.textContent = link.text;

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

        const menu = document.getElementById("navMenu");
        const hamburgerBtn = document.getElementById("hamburger");

        // Hamburger menu toggle
        function toggleMenu() {
            const isOpen = menu.classList.toggle("open");
            hamburgerBtn.classList.toggle("active");
            hamburgerBtn.setAttribute("aria-expanded", isOpen);
            document.body.style.overflow = isOpen ? "hidden" : "";
        }

        hamburgerBtn.addEventListener("click", toggleMenu);

        // Submenu toggle for mobile
        const submenuTriggers = document.querySelectorAll(".has-submenu > a");

        submenuTriggers.forEach((trigger) => {
            trigger.addEventListener("click", function (e) {
                if (window.innerWidth <= 991) {
                    e.preventDefault();
                    const parent = this.parentElement;
                    parent.classList.toggle("open");
                }
            });
        });

        // Close menu when clicking on a link (only for mobile)
        const allLinks = document.querySelectorAll(".nav-links a:not(.submenu-trigger)");
        allLinks.forEach((link) => {
            link.addEventListener("click", function () {
                if (window.innerWidth <= 991 && menu.classList.contains("open")) {
                    menu.classList.remove("open");
                    hamburgerBtn.classList.remove("active");
                    hamburgerBtn.setAttribute("aria-expanded", "false");
                    document.body.style.overflow = "";
                }
            });
        });

        // Close menu when pressing Escape key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && menu.classList.contains("open")) {
                menu.classList.remove("open");
                hamburgerBtn.classList.remove("active");
                hamburgerBtn.setAttribute("aria-expanded", "false");
                document.body.style.overflow = "";
            }
        });

        // Close menu when clicking outside of it
        document.addEventListener("click", function (e) {
            if (window.innerWidth <= 991) {
                const isClickInside = navContainer.contains(e.target);
                if (!isClickInside && menu.classList.contains("open")) {
                    menu.classList.remove("open");
                    hamburgerBtn.classList.remove("active");
                    hamburgerBtn.setAttribute("aria-expanded", "false");
                    document.body.style.overflow = "";
                }
            }
        });

        // Close menu when resizing to desktop view
        window.addEventListener("resize", function () {
            if (window.innerWidth > 991) {
                if (menu.classList.contains("open")) {
                    menu.classList.remove("open");
                    hamburgerBtn.classList.remove("active");
                    hamburgerBtn.setAttribute("aria-expanded", "false");
                    document.body.style.overflow = "";
                }
                document.querySelectorAll(".has-submenu.open").forEach((el) => {
                    el.classList.remove("open");
                });
            }
        });

        // INIT: Call the initLanguageToggle function if it exists
        if (typeof initLanguageToggle === 'function') {
            // Wait a bit to ensure the DOM is fully loaded and elements are available
            setTimeout(() => {
                initLanguageToggle();
            }, 50);
        }

    })
    .catch((error) => console.error("Error loading navbar:", error));