// Frontend vanilla JS
document.getElementById("createUser").addEventListener("click", async () => {
    await fetch("http://localhost:3000/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Juan",
        email: "juan@email.com",
        role: "admin",
        active: true
      })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error al crear usuario", error));
});