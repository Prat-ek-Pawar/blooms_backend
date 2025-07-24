// createAdminHash.js - Run this file to generate the correct password hash
const bcrypt = require("bcrypt");
const pool = require("./config/dbConfig");

async function createAdminUser() {
  try {
    // Hash the password 'admin@123'
    const password = "admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Generated hash for password "admin@123":', hashedPassword);

    // Insert or update admin user
    const query = `
            INSERT INTO admin (username, password, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (username)
            DO UPDATE SET password = $2, updated = CURRENT_TIMESTAMP
            RETURNING *;
        `;

    const result = await pool.query(query, ["admin", hashedPassword, "admin"]);
    console.log("Admin user created/updated:", result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
