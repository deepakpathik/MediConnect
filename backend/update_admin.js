const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'demo@mediconnect.com';
    try {
        const user = await prisma.user.update({
            where: { email: email },
            data: { role: 'ADMIN' },
        });
        console.log(`Successfully updated user ${email} to ADMIN.`);
    } catch (error) {
        console.error(`Error updating user: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
