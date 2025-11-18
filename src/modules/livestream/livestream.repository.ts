import { prisma } from "../../common/database";
import { CreateLiveStreamPayload, ProducerActivityWithParticipantActivityDto } from "./livestream.interface";

const LiveStreamRepository = {
    resetLiveStreamData: async (endDate: Date) => {
        return prisma.liveStream.deleteMany({
            where: {
                updatedAt: { lte: endDate }
            }
        });
    },
    // Fetch producer activities for a live stream
    getProducerActivitiesForLiveStream: async (liveStreamId: string) => {
        return prisma.producerActivity.findMany({
            where: { liveStreamId },
            orderBy: { startTime: "asc" },
        })
    },

    // Fetch participant activities for a live stream
    getParticipantActivitiesForLiveStream: async (liveStreamId: string) => {
        return prisma.liveStreamParticipant.findMany({
            where: { liveStreamId },
            orderBy: { startTime: "asc" },
        });
    },

    // Fetch producer activities for a specific time duration
    getProducerActivitiesForDuration: async (startDate: Date, endDate: Date) => {
        return prisma.producerActivity.findMany({
            where: {
                startTime: { gte: startDate },
                endTime: { lte: endDate },
            },
            orderBy: { startTime: "asc" },
        });
    },

    // Fetch participant activities for a specific time duration
    getParticipantActivitiesForDuration: async (startDate: Date, endDate: Date) => {
        return prisma.liveStreamParticipant.findMany({
            where: {
                startTime: { gte: startDate },
                endTime: { lte: endDate },
            },
            orderBy: { startTime: "asc" },
        });
    },
    getAll: async () => {
        return prisma.liveStream.findMany({
            orderBy: { startTime: "desc" },
        });
    },
    // startStream: async (data: StartLiveStreamDto) => {
    //     return prisma.liveStream.create({
    //         data: {
    //             hostId: data.hostId,
    //             type: data.type,
    //             startTime: new Date(),
    //         },
    //     });
    // },

    // endStream: async (streamId: string) => {
    //     return prisma.liveStream.update({
    //         where: { id: streamId },
    //         data: { endTime: new Date() },
    //     });
    // },

    getDailyStreamDuration: async (hostId: string, date: Date) => {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const streams = await prisma.liveStream.findMany({
            where: {
                hostId,
                startTime: { gte: startOfDay, lte: endOfDay },
            },
        });

        return streams.reduce((total, stream) => {
            const duration = (new Date(stream.endTime || new Date()).getTime() - new Date(stream.startTime).getTime()) / 1000;
            return total + duration;
        }, 0);
    },

    getAllLiveStreamsDurationPerDay: async (hostId: string) => {
        const streams = await prisma.liveStream.findMany({
            where: { hostId },
            orderBy: { startTime: "asc" }, // Ensure streams are ordered by start time
        });

        // Filter out streams without valid startTime or endTime
        const filteredStreams = streams.filter(stream => stream.startTime && stream.endTime);

        // Group streams by day and calculate total duration per day
        const dailyDurations = filteredStreams.reduce((result, stream) => {
            const startDate = new Date(stream.startTime);
            const dayKey = startDate.toISOString().split("T")[0]; // Extract the date part (YYYY-MM-DD)

            const durationInSeconds = (new Date(stream.endTime!).getTime() - startDate.getTime()) / 1000;

            if (!result[dayKey]) {
                result[dayKey] = { date: dayKey, totalDuration: 0 };
            }

            result[dayKey].totalDuration += durationInSeconds;
            return result;
        }, {} as Record<string, { date: string; totalDuration: number }>);

        // Convert the result object into an array and format totalDuration as "hh:mm:ss"
        return Object.values(dailyDurations).map(({ date, totalDuration }) => {
            const hours = Math.floor(totalDuration / 3600);
            const minutes = Math.floor((totalDuration % 3600) / 60);
            const seconds = Math.floor(totalDuration % 60);

            const totalTimeDuration = [
                hours.toString().padStart(2, "0"),
                minutes.toString().padStart(2, "0"),
                seconds.toString().padStart(2, "0"),
            ].join(":");

            return { date, totalTimeDuration };
        });
    },

    getDailyStream: async (hostId: string, date: Date) => {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));

        const streams = await prisma.liveStream.findMany({
            where: {
                hostId,
                startTime: { gte: startOfDay, lte: endOfDay },
            },
        });

        return streams
    },

    getAllLiveStreams: async (hostId: string) => {
        return prisma.liveStream.findMany({
            where: { hostId },
            orderBy: { startTime: "desc" },
        });
    },
    createNewRecord: async (data: CreateLiveStreamPayload) => {
        return await prisma.liveStream.create({ data });
    },
    updateLiveStreamEndTime: async (id: string, endTime: Date) => {
        return prisma.liveStream.update({
            where: { id },
            data: { endTime },
        });
    },
    // Fetch the top five hosts with the total live stream duration
    getTopFiveHostLiveStreamer: async () => {
        return prisma.liveStream.findMany({ where: { isCreatorHost: true } })
    },

    getAllProducerActivity: async () => {
        return prisma.producerActivity.findMany({
            orderBy: { startTime: "asc" },
        });
    },
    getAllLiveStreamParticipants: async () => {
        return prisma.liveStreamParticipant.findMany({
            orderBy: { startTime: "asc" },
        });
    },
    getTotalDurationByUserId: async (userId: string) => {
        const liveStreamParticipants = await prisma.liveStreamParticipant.findMany({
            where: { userId },
        });
        const producerActivities = await prisma.producerActivity.findMany({
            where: { userId },
        });
        const liveStreamParticipantTime = liveStreamParticipants.reduce((total, stream) => {
            if (stream.endTime && stream.startTime) {
                const duration = (new Date(stream.endTime).getTime() - new Date(stream.startTime).getTime()) / 1000;
                return total + duration;
            }
            return total; // Always return the accumulator
        }, 0);
        const producerActivityTime = producerActivities.reduce((total, activity) => {
            if (activity.endTime && activity.startTime) {
                const duration = (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 1000;
                return total + duration;
            }
            return total; // Always return the accumulator
        }, 0);
        const totalSeconds = liveStreamParticipantTime + producerActivityTime;

        // Convert seconds to hh:mm:ss
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const formatted = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
        ].join(":");

        return {
            totalSeconds,
            formattedDuration: formatted,
        };
    },
    getTotalDuration: async () => {
        const liveStreamParticipants = await prisma.liveStreamParticipant.findMany();
        const producerActivities = await prisma.producerActivity.findMany();
        const liveStreamParticipantTime = liveStreamParticipants.reduce((total, stream) => {
            if (stream.endTime && stream.startTime) {
                const duration = (new Date(stream.endTime).getTime() - new Date(stream.startTime).getTime()) / 1000;
                return total + duration;
            }
            return total; // Always return the accumulator
        }, 0);
        const producerActivityTime = producerActivities.reduce((total, activity) => {
            if (activity.endTime && activity.startTime) {
                const duration = (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 1000;
                return total + duration;
            }
            return total; // Always return the accumulator
        }, 0);
        const totalSeconds = liveStreamParticipantTime + producerActivityTime;

        // Convert seconds to hh:mm:ss
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const formatted = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
        ].join(":");

        return {
            totalSeconds,
            formattedDuration: formatted,
            consumerTime: liveStreamParticipantTime,
            producerTime: producerActivityTime,
        };
    },
    getTotalProducerAndParticipantActivity: async () => {
        const data = await prisma.producerActivity.findMany({
            include: {
                liveStream: {
                    include: {
                        LiveStreamParticipant: true
                    }
                }
            }
        })
        const result = filterParticipantsWithValidEndTime(data)

        const res: {
            liveStreamId: string;
            totalDuration: number;
        }[] = []
        let totalTimeTaken = 0;

        result.forEach(producer => {
            if (!producer.startTime || !producer.endTime) {
                return; // Skip producers without valid start or end time
            }
            const producerStartTime = new Date(producer.startTime).getTime()
            const producerEndTime = new Date(producer.endTime).getTime()
            const producerDuration = (producerEndTime - producerStartTime) / 1000; // seconds
            let consumerOverlap = 0;
            producer.LiveStreamParticipant.map(participant => {
                if (!participant.startTime || !participant.endTime || !producer.startTime || !producer.endTime) {
                    return;
                }
                const participantStartTime = new Date(participant.startTime).getTime()
                const participantEndTime = new Date(participant.endTime).getTime()

                const overlapStart = Math.max(participantStartTime, producerStartTime);
                const overlapEnd = Math.min(participantEndTime, producerEndTime);
                const overlap = Math.max(0, (overlapEnd - overlapStart) / 1000); // seconds

                consumerOverlap += overlap;
            })
            totalTimeTaken += consumerOverlap + producerDuration;
            if (producer.liveStreamId === '7ab42e24-18e2-4d4b-a048-6ac50109ad20') {
                console.info(`Skipping producer  duration with liveStreamId: ${producer.liveStreamId}`, consumerOverlap, producerDuration, JSON.stringify(producer));
            }
            res.push({
                liveStreamId: producer.liveStreamId,
                totalDuration: consumerOverlap + producerDuration
            })
        })
        totalTimeTaken = totalTimeTaken; // Convert to seconds
        // Convert seconds to hh:mm:ss
        const hours = Math.floor(totalTimeTaken / 3600);
        const minutes = Math.floor((totalTimeTaken % 3600) / 60);
        const seconds = Math.floor(totalTimeTaken % 60);
        const formatted = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
        ].join(":");

        return { raw: res, totalDuration: totalTimeTaken, formattedDuration: formatted, result };

    },
    getTotalProducerAndParticipantActivityForRoomId: async (roomId: string) => {
        const data = await prisma.producerActivity.findMany({
            where: { roomId },
            include: {
                liveStream: {
                    include: {
                        LiveStreamParticipant: true
                    }
                }
            }
        })
        const result = filterParticipantsWithValidEndTime(data)

        const res: {
            liveStreamId: string;
            totalDuration: number;
        }[] = []
        let totalTimeTaken = 0;

        result.forEach(producer => {
            if (!producer.startTime || !producer.endTime) {
                return; // Skip producers without valid start or end time
            }
            const producerStartTime = new Date(producer.startTime).getTime()
            const producerEndTime = new Date(producer.endTime).getTime()
            let duration = Math.abs(producerEndTime - producerStartTime)
            producer.LiveStreamParticipant.map(participant => {
                if (!participant.startTime || !participant.endTime || !producer.startTime || !producer.endTime) {
                    return;
                }
                const participantStartTime = new Date(participant.startTime).getTime()
                const participantEndTime = new Date(participant.endTime).getTime()

                const newStartTime = participantStartTime > producerStartTime ? participantStartTime : producerStartTime
                const newEndTime = participantEndTime > producerEndTime ? producerEndTime : participantEndTime
                const totalDuration = Math.abs(newEndTime - newStartTime); // Convert to seconds
                duration += totalDuration;
            })
            totalTimeTaken += duration;

            res.push({
                liveStreamId: producer.liveStreamId,
                totalDuration: duration
            })
        })
        totalTimeTaken = totalTimeTaken / 1000; // Convert to seconds
        // Convert seconds to hh:mm:ss
        const hours = Math.floor(totalTimeTaken / 3600);
        const minutes = Math.floor((totalTimeTaken % 3600) / 60);
        const seconds = Math.floor(totalTimeTaken % 60);
        const formatted = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
        ].join(":");

        return { raw: res, totalDuration: totalTimeTaken, formattedDuration: formatted, result };

    },
    fetchTotalTimeUsed: async () => {
        const totalDuration = await prisma.producerActivity.findMany({
            include: {
                liveStream: {
                    include: {
                        LiveStreamParticipant: true
                    }
                }
            }
        })

        return totalDuration;
    },
    deleteAllLiveStreamProducerData: async () => {
        await prisma.producerActivity.deleteMany({});
        await prisma.liveStreamParticipant.deleteMany({});
        await prisma.viewerEngagement.deleteMany({});
        await prisma.userMetrics.deleteMany({});
        await prisma.liveStream.deleteMany({});
    },
    getTotalRoomIds: async () => {
        const roomIds = await prisma.liveStream.findMany({
            select: { roomId: true },
            distinct: ['roomId'],
        });
        const totalCount = await prisma.liveStream.count();
        return { data: roomIds.map(room => room.roomId), totalCount };
    },
    getTotalLiveStreams: async () => {
        const data = await prisma.liveStream.findMany();
        const totalCount = await prisma.liveStream.count();
        return {
            totalCount, data: data.map(d => {
                let totalTime = 0;
                if (d.startTime && d.endTime) {
                    totalTime = (new Date(d.endTime).getTime() - new Date(d.startTime).getTime()) / 1000; // Convert to seconds
                }
                return { id: d.id, startTime: d.startTime, endTime: d.endTime, totalTime }
            })
        };
    }
};

export default LiveStreamRepository;

function filterParticipantsWithValidEndTime(producerActivities: ProducerActivityWithParticipantActivityDto[]) {
    const filteredData: {
        liveStreamId: string;
        userId: string;
        roomId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startTime: Date;
        endTime: Date | null;
        LiveStreamParticipant: {
            liveStreamId: string;
            userId: string;
            roomId: string;
            id: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
            startTime: Date;
            endTime: Date | null;
        }[];
    }[] = []
    const filterProducerActivities = producerActivities.filter(producer => producer.startTime && producer.endTime)
    filterProducerActivities.map(({ liveStream, ...rest }) => {
        if (!rest.startTime || !rest.endTime) {
            return;
        }
        if (!liveStream?.LiveStreamParticipant) {
            filteredData.push({
                ...rest,
                LiveStreamParticipant: []
            });
            return;
        }

        const validParticipants = liveStream.LiveStreamParticipant.filter(participant => participant.endTime && participant.startTime);
        filteredData.push({
            ...rest,
            LiveStreamParticipant: validParticipants.length > 0 ? validParticipants : []
        });
    })
    return filteredData;
}