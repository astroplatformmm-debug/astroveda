const { MongoMemoryServer } = require("mongodb-memory-server");
const { spawn } = require("child_process");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function start() {
  console.log("Starting MongoDB Memory Server...");
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  process.env.MONGODB_URI = uri;
  console.log(`MongoDB started in memory at ${uri}`);

  // Seed the admin user
  await mongoose.connect(uri, { dbName: "astrology-app" });
  const adminSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  );
  const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
  
  const passwordHash = await bcrypt.hash("admin123", 10);
  await Admin.create({ username: "admin", passwordHash });
  console.log("Admin seeded: username=admin password=admin123");

  // Seed Products and Services from mockData
  console.log("Seeding products and services...");
  const Service = mongoose.models.Service || mongoose.model("Service", new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    duration: String,
    image: String,
    isActive: { type: Boolean, default: true }
  }));
  const Product = mongoose.models.Product || mongoose.model("Product", new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    image: String,
    zodiac: String,
    certification: String,
    isActive: { type: Boolean, default: true }
  }));

  const services = [
    { id: '60d5ec49b392d7001f532001', title: 'Career Guidance', description: 'Get clarity on your professional path through detailed birth chart analysis.', price: 799, duration: '45 mins', image: 'https://picsum.photos/seed/career/600/400' },
    { id: '60d5ec49b392d7001f532002', title: 'Marriage Consultation', description: 'Kundali matching and relationship compatibility analysis.', price: 999, duration: '60 mins', image: 'https://picsum.photos/seed/marriage/600/400' },
    { id: '60d5ec49b392d7001f532003', title: 'Horoscope Reading', description: 'Detailed yearly horoscope with monthly breakdowns.', price: 599, duration: '30 mins', image: 'https://picsum.photos/seed/horoscope/600/400' },
    { id: '60d5ec49b392d7001f532004', title: 'Vastu Consultation', description: 'Home and office alignment for prosperity and peace.', price: 1499, duration: '90 mins', image: 'https://picsum.photos/seed/vastu/600/400' },
  ];
  
  const products = [
    { id: '60d5ec49b392d7001f532101', title: 'Ruby — Sun Stone', description: 'Enhances confidence, leadership, and vitality. Ideal for Leos and Aries.', price: 2999, zodiac: 'Leo', certification: 'Natural Ruby, Lab Certified', image: 'https://picsum.photos/seed/ruby/600/400' },
    { id: '60d5ec49b392d7001f532102', title: 'Emerald — Mercury Stone', description: 'Enhances intuition and spiritual power. Brings protection and emotional strength.', price: 3499, zodiac: 'Gemini', certification: 'Natural Emerald, Lab Certified', image: 'https://picsum.photos/seed/emerald/600/400' },
    { id: '60d5ec49b392d7001f532103', title: 'Yellow Sapphire — Jupiter Stone', description: 'Promotes wisdom, truth, and spiritual awareness. Brings protection during travels.', price: 4999, zodiac: 'Sagittarius', certification: 'Natural Yellow Sapphire, Lab Certified', image: 'https://picsum.photos/seed/sapphire/600/400' },
    { id: '60d5ec49b392d7001f532104', title: 'Blue Sapphire — Saturn Stone', description: 'Enhances discipline, ambition, and success. Brings stability and grounding energy.', price: 5999, zodiac: 'Capricorn', certification: 'Natural Blue Sapphire, Lab Certified', image: 'https://picsum.photos/seed/bluesapphire/600/400' },
  ];
  
  await Service.insertMany(services.map(s => ({ ...s, _id: s.id })));
  await Product.insertMany(products.map(p => ({ ...p, _id: p.id })));
  console.log("Seeded mock services and gemstones successfully.");

  await mongoose.disconnect();

  console.log("Starting Next.js development server...");
  
  // Set required env vars for the dev server if not already set
  const devEnv = {
    ...process.env,
    MONGODB_URI: uri,
    JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-in-production-" + Date.now(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "placeholder",
  };

  const nextDev = spawn("npm", ["run", "dev"], {
    stdio: "inherit",
    env: devEnv,
  });

  nextDev.on("close", (code) => {
    console.log(`Next.js process exited with code ${code}`);
    mongod.stop();
    process.exit(code);
  });
}

start().catch(console.error);
