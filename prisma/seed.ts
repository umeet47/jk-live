import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { DiamonExchangeEnum } from "../src/modules/diamond-exchange/diamond-exchange.enum";

const prisma = new PrismaClient();

export const seedAdminUser = async () => {
    const email = "umeet.shrestha@gmail.com";
    const password = "Password@123";

    try {
        // Hash the password using bcrypt and convert it to hex text
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Check if a user with the given email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Update the existing user with admin details
            await prisma.user.update({
                where: { email },
                data: {
                    fullname: "Admin User",
                    password: hashedPassword,
                    regNumber: 1, // Set regNumber to 1
                    role: "ADMIN",
                },
            });
            console.log("Admin user updated successfully.");
        } else {
            // Create the admin user with regNumber 30
            await prisma.user.create({
                data: {
                    fullname: "Admin User",
                    email,
                    password: hashedPassword,
                    regNumber: 30, // Temporarily set regNumber to 30
                    role: "ADMIN",
                },
            });

            // Update the admin user's regNumber to 1
            await prisma.user.update({
                where: { email },
                data: {
                    regNumber: 1,
                },
            });

            console.log("Admin user created successfully.");
        }

        // Ensure the next regNumber starts from 31
        // await prisma.$executeRaw`ALTER SEQUENCE "User_regNumber_seq" RESTART WITH 31;`;
        console.log("RegNumber sequence updated to start from 31.");
    } catch (error) {
        console.error("Error seeding admin user:", error);
    } finally {
        await prisma.$disconnect();
    }
};


// Run the seed function
// seedAdminUser();

export const seedDiamondSendPercentage = async () => {
    try {
        // Check if a record already exists
        const existingRecord = await prisma.diamondSendPercentage.findFirst();

        if (existingRecord) {
            console.log("Diamond send percentage record already exists. Skipping seed.");
            return;
        }

        // Create the initial record with 10% send percentage
        const diamondSendPercentage = await prisma.diamondSendPercentage.create({
            data: {
                percentage: 2,
                subtractFrom: "sender"
            },
        });

        console.log("Diamond send percentage seeded successfully.", diamondSendPercentage);
    } catch (error) {
        console.error("Error seeding diamond send percentage:", error);
    } finally {
        await prisma.$disconnect();
    }
};
// Run the seed function
seedDiamondSendPercentage();

export const seedDiamondExchange = async () => {
    const data = [
        {
            type: DiamonExchangeEnum.REGULAR,
            diamond: 100000,
            amount: 900
        },
        {
            type: DiamonExchangeEnum.AGENT,
            diamond: 100000,
            amount: 1000
        },
        {
            type: DiamonExchangeEnum.VIDEO_HOST,
            diamond: 100000,
            amount: 1000
        }, {
            type: DiamonExchangeEnum.AUDIO_HOST,
            diamond: 100000,
            amount: 900
        }
    ]

    for (const d of data) {
        const diamondExchange = await prisma.diamondExchange.findFirst({ where: { type: d.type } })
        if (!diamondExchange) {
            await prisma.diamondExchange.create({ data: d })
        }
    }
    console.info("Diamond Exchange seeded")
}

seedDiamondExchange()

export const seedSystemSetting = async () => {
    const systemSetting = await prisma.systemSetting.findFirst()
    if (!systemSetting) {
        await prisma.systemSetting.create({ data: { withdrawFlag: true } })
        console.info("System Setting created")
    }
    console.info("System Setting seeded")
}
seedSystemSetting()