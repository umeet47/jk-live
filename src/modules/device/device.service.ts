import DeviceRepository from "./device.repository";
import UserRepository from "../users/user.repository";
import { APIError } from "encore.dev/api";

const DeviceService = {
    findByDeviceId: async (deviceId: string) => {
        return DeviceRepository.findByDeviceId(deviceId);
    },
    // Handle device during login
    handleDeviceOnLogin: async (userId: string, deviceId: string) => {
        // Check if the device exists
        let device = await DeviceRepository.findByDeviceId(deviceId);

        if (!device) {
            // Create the device if it doesn't exist
            device = await DeviceRepository.createDevice(deviceId);
        }

        // Check if the device is blocked
        if (device.isBlocked) {
            throw APIError.permissionDenied("This device is blocked and cannot be used for login.");
        }

        // Update the user's deviceId
        await UserRepository.updateUserDevice(userId, deviceId);

        // return { success: true, message: "Device linked successfully." };
    },

    // Block a device
    blockDevice: async (deviceId: string) => {
        const device = await DeviceRepository.findByDeviceId(deviceId);

        if (!device) {
            throw APIError.notFound("Device not found.");
        }

        await DeviceRepository.blockDevice(deviceId);

        return { success: true, message: "Device blocked successfully." };
    },
    // Unblock a device by its deviceId
    unblockDevice: async (deviceId: string) => {
        const device = await DeviceRepository.findByDeviceId(deviceId);

        if (!device) {
            throw APIError.notFound("Device not found.");
        }

        if (!device.isBlocked) {
            throw APIError.alreadyExists("Device is already unblocked.");
        }

        await DeviceRepository.unblockDevice(deviceId);

        return { success: true, message: "Device unblocked successfully." };
    },
    getAllDevices: async () => {
        return  await DeviceRepository.getAllDevices();
    },
     getAllBlockedDevices: async () => {
        return await DeviceRepository.getAllBlockedDevices();
    },
};

export default DeviceService;