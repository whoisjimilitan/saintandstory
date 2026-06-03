import { config } from "dotenv";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_URL = "https://api.clerk.com/v1";

if (!CLERK_API_KEY) {
  console.log("\n⚠️  CLERK_SECRET_KEY not found in .env.local");
  console.log("\nManual Setup Instructions:");
  console.log("=".repeat(90));
  console.log("\n1. Go to: https://dashboard.clerk.com");
  console.log("\n2. Click 'Users' → 'Create user'");
  console.log("\n3. Create these 3 test users:\n");
  
  const users = [
    { email: "testdriver1@example.com", name: "Alex Johnson", pwd: "TestDriver123!" },
    { email: "testdriver2@example.com", name: "Sarah Smith", pwd: "TestDriver123!" },
    { email: "testdriver3@example.com", name: "Mike Williams", pwd: "TestDriver123!" },
  ];
  
  users.forEach((u, i) => {
    console.log(`   Driver ${i + 1}:`);
    console.log(`   • Email: ${u.email}`);
    console.log(`   • Name: ${u.name}`);
    console.log(`   • Password: ${u.pwd}`);
    console.log();
  });
  
  console.log("4. After creating each user, copy the User ID (starts with 'user_')");
  console.log("5. Update database:");
  console.log("   UPDATE drivers SET clerk_user_id = 'user_xxx' WHERE email = 'testdriverX@example.com'");
  console.log("\n" + "=".repeat(90));
  console.log("\nThen you can log in at: https://saintandstoryltd.co.uk/dashboard/driver\n");
  process.exit(0);
}

async function createClerkUser(email: string, name: string) {
  const response = await fetch(`${CLERK_API_URL}/users`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CLERK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      first_name: name.split(" ")[0],
      last_name: name.split(" ")[1] || "",
      password: "TestDriver123!",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
}

async function main() {
  console.log("\n" + "=".repeat(90));
  console.log("CREATING CLERK TEST USERS");
  console.log("=".repeat(90) + "\n");

  const users = [
    { email: "testdriver1@example.com", name: "Alex Johnson" },
    { email: "testdriver2@example.com", name: "Sarah Smith" },
    { email: "testdriver3@example.com", name: "Mike Williams" },
  ];

  const createdUsers: { email: string; id: string }[] = [];

  for (const user of users) {
    try {
      const result = await createClerkUser(user.email, user.name);
      createdUsers.push({ email: user.email, id: result.id });
      console.log(`✓ ${user.name} (${user.email})`);
      console.log(`  Clerk ID: ${result.id}`);
      console.log(`  Password: TestDriver123!\n`);
    } catch (error) {
      console.log(`❌ Failed to create ${user.email}:`, error);
    }
  }

  console.log("=".repeat(90));
  console.log("✅ CLERK USERS CREATED\n");
  console.log("LOGIN CREDENTIALS:");
  console.log("=".repeat(90));
  createdUsers.forEach((u, i) => {
    console.log(`\nDriver ${i + 1}: ${u.email}`);
    console.log(`Password: TestDriver123!`);
    console.log(`URL: https://saintandstoryltd.co.uk/dashboard/driver`);
  });
  console.log("\n" + "=".repeat(90) + "\n");
}

main().catch(console.error);
