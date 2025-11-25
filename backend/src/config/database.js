const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function connectDB(retries = 5) {
  while (retries > 0) {
    try {
      await prisma.$connect();
      // console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      console.error(`❌ Database connection error (retries left: ${retries - 1}):`, error.message);
      retries -= 1;
      if (retries === 0) {
        console.error('❌ Could not connect to database after multiple attempts.');
        // Do not exit process, let it try to reconnect on first request or fail gracefully then
      } else {
        await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds
      }
    }
  }
}

connectDB();

module.exports = prisma;
