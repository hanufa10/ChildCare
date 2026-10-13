
export function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");

  // Notify App.jsx that authentication has changed.
  window.dispatchEvent(new Event("authChanged"));
}
