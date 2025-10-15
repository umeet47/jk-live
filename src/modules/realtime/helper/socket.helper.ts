import log from "encore.dev/log";
import { Socket } from "socket.io";

export type Callback<T> = (response: {
    success: boolean;
    error?: string;
    data?: T;
}) => void;

export const handleEvent = async <T, R>(
    socket: Socket,
    eventName: string,
    callback: Callback<R>,
    fn: (data: T) => Promise<R>
) => {
    const startTime = process.hrtime();
    const startDate = new Date();
    try {
        const result = await fn(socket.data);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationMs = seconds * 1000 + nanoseconds / 1000000;
        const endDate = new Date();
        log.info(`Event ${eventName} completed`, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            durationMs: Number(durationMs.toFixed(2)),
            userId: socket.data.id,
        });
        if (typeof callback === "function") {
            callback({ success: true, data: result });
        }

        callback({ success: true, data: result });
    } catch (error) {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationMs = seconds * 1000 + nanoseconds / 1000000;
        const endDate = new Date();
        const message = error instanceof Error ? error.message : String(error);

        log.error(`Event ${eventName} failed`, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            durationMs: Number(durationMs.toFixed(2)),
            userId: socket.data.id,
            error: message,
        });
        log.error(`Error: ${message}`, error);
        if (typeof callback === "function") {
            callback({ success: false, error: message });
        }
    }
};