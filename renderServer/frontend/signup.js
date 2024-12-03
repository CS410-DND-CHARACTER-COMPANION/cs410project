// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        // Handle signup form submission
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent the form from refreshing the page

            // Collect form data
            const username = document.getElementById("user")
            const email = document.getElementById("email")
            const password = document.getElementById("password")

            // Validate form data
            if (!username || !email || !password) {
                alert("All fields are required.");
                return;
            }

            // Emit the user data to the server via socket.io
            socket.emit("submitUser", { username, email, password });

            // Show success message
            alert("Signup submitted");

            // Reset the signup form
            signupForm.reset();
        });
    }
});
