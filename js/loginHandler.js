document.getElementById("loginForm").addEventListener("submit", async (e) => {
    console.log("loginForm");
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    await login(username, password);
});
