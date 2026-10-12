
function ParentDashboard() {
  const user = JSON.parse(localStorage.getItem("authUser") || "null");

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    window.location.replace("/login");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Welcome, {user?.firstName || "Parent"}!</h1>
      <p>This is your test Parent Dashboard.</p>

      <div style={{ marginTop: "24px" }}>
        <h2>My Child Care</h2>
        <p>Here you will eventually see your children's information.</p>
        <p>Attendance, meal schedules, and dietary needs will be added here.</p>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default ParentDashboard;
