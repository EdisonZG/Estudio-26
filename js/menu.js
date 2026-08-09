document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.querySelector(".navbar");

    if (!menuToggle || !navbar) return;

    menuToggle.addEventListener("click", () => {
        navbar.classList.toggle("active");
        menuToggle.classList.toggle("active");
    });

    const links = navbar.querySelectorAll("a");

    links.forEach(link => {
        link.addEventListener("click", () => {
            navbar.classList.remove("active");
            menuToggle.classList.remove("active");
        });
    });
});
