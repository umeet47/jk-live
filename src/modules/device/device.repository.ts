import { prisma } from "../../common/database";

const DeviceRepository = {
    // Find a device by its deviceId
    findByDeviceId: async (deviceId: string) => {
        return prisma.device.findUnique({
            where: { deviceId },
        });
    },
    getAllDevices: async () => {
        // Get all devices
        return prisma.device.findMany();
    },
    getAllBlockedDevices: async () => {
        // Get all active devices (not blocked)
        return prisma.device.findMany({
            where: { isBlocked: true },
        });
    },
    // Create a new device
    createDevice: async (deviceId: string) => {
        return prisma.device.create({
            data: { deviceId },
        });
    },

    // Block a device by its deviceId
    blockDevice: async (deviceId: string) => {
        return prisma.device.update({
            where: { deviceId },
            data: { isBlocked: true },
        });
    },
    // Unblock a device by its deviceId
    unblockDevice: async (deviceId: string) => {
        return prisma.device.update({
            where: { deviceId },
            data: { isBlocked: false },
        });
    },
};

export default DeviceRepository;