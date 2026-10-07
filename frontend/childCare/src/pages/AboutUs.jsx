function AboutUs(){
    const handleEdit = () => {
        alert("Edit functionality is not implemented yet.");
    }
    return(
        <>
        <div className="about-us-header">
            <h1>About Us</h1>
            <button className="edit-button"
            onClick={handleEdit}>Edit Info</button>
        </div>
        <p>Welcome to our Child Care Management System! We are dedicated to providing a safe and nurturing environment for children while supporting parents and caregivers in their journey. Our platform offers a comprehensive solution for managing child care operations, including tracking children's information, managing staff, organizing meals, and facilitating parent-child connections.</p>
        <p>Our team is passionate about early childhood development and strives to create a user-friendly experience for both parents and staff. We believe in fostering strong relationships between children, parents, and caregivers, and our system is designed to streamline communication and enhance the overall child care experience.</p>
        <div>
            <h2>Our Mission</h2>
            <p>Our mission is to provide a safe, nurturing, and educational environment for children while supporting parents and caregivers in their child care journey. We aim to streamline child care management processes, enhance communication between parents and staff, and promote the overall well-being of children.</p>
        </div>
        <div>
            <h2>Our Vision</h2>
            <p>Our vision is to be the leading child care management system, recognized for our commitment to excellence, innovation, and the well-being of children. We strive to create a positive impact on the lives of children, parents, and caregivers by providing a comprehensive and user-friendly platform that meets their needs.</p>
        </div>
        <div>
            <h2>Our Values</h2>
            <ul>
                <li>Child-Centered Approach: We prioritize the well-being and development of children in all aspects of our system.</li>
                <li>Collaboration: We believe in fostering strong relationships between parents, caregivers, and staff to create a supportive community.</li>
                <li>Innovation: We continuously seek innovative solutions to enhance the child care experience and streamline management processes.</li>
                <li>Integrity: We uphold the highest standards of integrity, transparency, and ethical practices in all our operations.</li>
            </ul>
        </div>
        <div>
            <h2>Our Team</h2>
            <ul>
                <li>John Doe - Founder & CEO</li>
                <li>Jane Smith - Director of Child Care Operations</li>
                <li>Emily Johnson - Lead Educator</li>
                <li>Michael Brown - Parent Relations Coordinator</li>
            </ul>
        </div>
        <div>
            <h2>Working Hours</h2>
            <p>Our child care center is open:
                <ul>
                    <li>Monday to Friday: 7:00 AM - 6:00 PM</li>
                    <li>Saturday: 9:00 AM - 4:00 PM</li>
                </ul>
            </p>
            <p>We are committed to providing flexible options for parents and caregivers, ensuring that children receive the care they need while accommodating the diverse schedules of families. Our dedicated staff is available to assist with any inquiries or support during our working hours.</p>    
        </div>
        <div>
            <h2>Contact Information</h2>
            <p>If you have any questions, feedback, or inquiries, please feel free to reach out to us:</p>
            <ul>
                <li>Email: <a href="mailto:info@childcare.com">info@childcare.com</a></li>
                <li>Phone: (123) 456-7890</li>
                <li>Address: 123 Child Care Street, City, State 12345</li>
            </ul>
        </div>
        <p>Thank you for choosing our Child Care Management System. We are committed to providing the best possible care for your children and supporting you in your parenting journey.</p>
        </>
    )
}
export default AboutUs