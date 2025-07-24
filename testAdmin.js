// testAdminSetup.js - Test script to verify admin setup
const bcrypt = require("bcrypt");
const pool = require("./Config/DBConfig");

async function testAdminSetup() {
  try {
    console.log("🔍 Testing admin setup...\n");

    // 1. Create the correct password hash
    const password = "admin@123";
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("1. Generated password hash:", hashedPassword);

    // 2. Create/update admin user
    const insertQuery = `
            INSERT INTO admin (username, password, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (username)
            DO UPDATE SET password = $2, updated = CURRENT_TIMESTAMP
            RETURNING *;
        `;

    const insertResult = await pool.query(insertQuery, [
      "admin",
      hashedPassword,
      "admin",
    ]);
    console.log("2. Admin user created/updated:", {
      id: insertResult.rows[0].id,
      username: insertResult.rows[0].username,
      role: insertResult.rows[0].role,
      is_active: insertResult.rows[0].is_active,
    });

    // 3. Test password verification
    const storedHash = insertResult.rows[0].password;
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log(
      "3. Password verification test:",
      isMatch ? "✅ PASSED" : "❌ FAILED"
    );

    // 4. Test admin model
    const AdminModel = require("./Models/adminModel");
    const verifiedAdmin = await AdminModel.verifyAdmin("admin", "admin@123");
    console.log(
      "4. Admin model verification:",
      verifiedAdmin ? "✅ PASSED" : "❌ FAILED"
    );

    if (verifiedAdmin) {
      console.log("   Admin details:", {
        id: verifiedAdmin.id,
        username: verifiedAdmin.username,
        role: verifiedAdmin.role,
      });
    }

    console.log("\n🎉 Admin setup test completed!");
    console.log("\nYou can now login with:");
    console.log("Username: admin");
    console.log("Password: admin@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error in admin setup test:", error);
    process.exit(1);
  }
}

testAdminSetup();
