import UserService from "../users/user.service";
import { CreateLiveStreamPayload } from "./livestream.interface";
import LiveStreamRepository from "./livestream.repository";

const LiveStreamService = {
    resetLiveStreamData: async ( endDate?: string)=> {
        let computedEndDate: Date;
         if(!endDate){
        // Default to last day of previous month (UTC)
            const now = new Date();
            const year = now.getUTCFullYear();
            const month = now.getUTCMonth();
              // Set to last day of previous month at 23:59:59.999 UTC
            computedEndDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        } else {
            computedEndDate = new Date(endDate)
        }
        return LiveStreamRepository.resetLiveStreamData(computedEndDate)
    },
    getAll: async () => {
        return LiveStreamRepository.getAll();
    },
    getDailyStreamDuration: async (hostId: string, date: Date) => {
        return LiveStreamRepository.getDailyStreamDuration(hostId, date);
    },
    getDailyStream: async (hostId: string, date: Date) => {
        return LiveStreamRepository.getDailyStream(hostId, date);
    },
    getAllLiveStreamsDurationPerDay: async (hostId: string) => {
        return LiveStreamRepository.getAllLiveStreamsDurationPerDay(hostId);
    },
    getAllLiveStreams: async (hostId: string) => {
        return LiveStreamRepository.getAllLiveStreams(hostId);
    },
    createNewRecord: async (data: CreateLiveStreamPayload) => {
        return LiveStreamRepository.createNewRecord(data)
    },
    updateLiveStreamEndTime: async (id: string, endTIme: Date) => {
        return LiveStreamRepository.updateLiveStreamEndTime(id, endTIme);
    },
    getTopFiveHostLiveStreamer: async () => {
        // Fetch the top five hosts with their total live stream duration
        const liveStreams = await LiveStreamRepository.getTopFiveHostLiveStreamer();
        // Calculate total duration for each host
        const hostDurations = liveStreams.reduce((result, stream) => {
            if (!stream.startTime || !stream.endTime) return result;

            const durationInSeconds = (new Date(stream.endTime).getTime() - new Date(stream.startTime).getTime()) / 1000;

            if (!result[stream.hostId]) {
                result[stream.hostId] = { hostId: stream.hostId, totalDuration: 0 };
            }

            result[stream.hostId].totalDuration += durationInSeconds;
            return result;
        }, {} as Record<string, { hostId: string; totalDuration: number }>);

        // Convert the result object into an array and sort by total duration in descending order
        const sortedHosts = Object.values(hostDurations).sort((a, b) => b.totalDuration - a.totalDuration);

        // Limit to the top five hosts
        const topFiveHosts = sortedHosts.slice(0, 20);

        // Fetch user details for each host
        const hostDetails = await Promise.all(
            topFiveHosts.map(async (host) => {
                const user = await UserService.findOne(host.hostId);
                return {
                    ...user,
                    totalDuration: host.totalDuration // Format duration as "hh:mm:ss"
                };
            })
        );

        return hostDetails;
    },
    // Calculate total producer time for a live stream
    calculateTotalProducerTime: async (liveStreamId: string) => {
        const producerActivities = await LiveStreamRepository.getProducerActivitiesForLiveStream(liveStreamId);

        let totalProducerTime = 0;
        producerActivities.forEach((activity) => {
            if (activity.startTime && activity.endTime) {
                totalProducerTime += (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 1000; // Convert to seconds
            }
        });

        return totalProducerTime; // Return total time in seconds
    },

    // Calculate total producer time for a specific duration
    calculateTotalProducerTimeForDuration: async (startDate: Date, endDate: Date) => {
        const producerActivities = await LiveStreamRepository.getProducerActivitiesForDuration(startDate, endDate);

        let totalProducerTime = 0;
        producerActivities.forEach((activity) => {
            if (activity.startTime && activity.endTime) {
                totalProducerTime += (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 1000; // Convert to seconds
            }
        });

        return totalProducerTime; // Return total time in seconds
    },

    // Calculate total consuming time for a participant
    calculateTotalConsumingTime: async (liveStreamId: string, userId: string) => {
        const participantActivities = await LiveStreamRepository.getParticipantActivitiesForLiveStream(liveStreamId);
        const producerActivities = await LiveStreamRepository.getProducerActivitiesForLiveStream(liveStreamId);

        let totalConsumingTime = 0;

        participantActivities.forEach((participant) => {
            if (participant.userId === userId && participant.startTime && participant.endTime) {
                const participantStart = new Date(participant.startTime).getTime();
                const participantEnd = new Date(participant.endTime).getTime();

                let overlappingTime = 0;

                producerActivities.forEach((producer) => {
                    if (producer.userId !== userId && producer.startTime && producer.endTime) {
                        const producerStart = new Date(producer.startTime).getTime();
                        const producerEnd = new Date(producer.endTime).getTime();

                        const overlapStart = Math.max(participantStart, producerStart);
                        const overlapEnd = Math.min(participantEnd, producerEnd);

                        if (overlapStart < overlapEnd) {
                            overlappingTime += (overlapEnd - overlapStart) / 1000; // Convert to seconds
                        }
                    }
                });

                totalConsumingTime += overlappingTime;
            }
        });

        return totalConsumingTime; // Return total time in seconds
    },

    getAllProducerActivity: async () => {
        return LiveStreamRepository.getAllProducerActivity();
    },
    getAllLiveStreamParticipants: async () => {
        return LiveStreamRepository.getAllLiveStreamParticipants();
    },
    getTotalDurationByUserId: async (hostId: string) => {
        return LiveStreamRepository.getTotalDurationByUserId(hostId);
    },
    getTotalDuration: async () => {
        return LiveStreamRepository.getTotalDuration();
    },
    getTotalProducerAndParticipantActivity: async () => {
        return LiveStreamRepository.getTotalProducerAndParticipantActivity();
    },
    getTotalProducerAndParticipantActivityForRoomId: async (hostId: string) => {
        return LiveStreamRepository.getTotalProducerAndParticipantActivityForRoomId(hostId);
    },
    fetchTotalTimeUsed: async ()=> {
        return LiveStreamRepository.fetchTotalTimeUsed();
    },
    deleteAllLiveStreamProducerData : async () => {
        return LiveStreamRepository.deleteAllLiveStreamProducerData();
    },
    getTotalRoomIds: async () => {
        return LiveStreamRepository.getTotalRoomIds();
    },
    getTotalLiveStreams : async () => {
        return LiveStreamRepository.getTotalLiveStreams();
    }
};

export default LiveStreamService;
