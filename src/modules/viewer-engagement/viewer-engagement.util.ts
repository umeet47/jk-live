import { ViewerEngagement } from "@prisma/client";

export const filterStreamsData = async (streams: ViewerEngagement[]) => {
    // Filter out streams without valid startTime or endTime
    const filteredStreams = streams.filter(stream => stream.startTime && stream.endTime);

    // Group streams by day and calculate total duration per day
    const dailyDurations = filteredStreams.reduce((result, stream) => {
        const startDate = new Date(stream.startTime);
        const dayKey = startDate.toISOString().split("T")[0]; // Extract the date part (YYYY-MM-DD)

        const durationInSeconds = (new Date(stream.endTime!).getTime() - startDate.getTime()) / 1000;

        if (!result[dayKey]) {
            result[dayKey] = { date: dayKey, totalDuration: 0, userId: stream.userId };
        }

        result[dayKey].totalDuration += durationInSeconds;
        return result;
    }, {} as Record<string, { date: string; totalDuration: number, userId: string }>);

    // Convert the result object into an array and format totalDuration as "hh:mm:ss"
    return Object.values(dailyDurations).map(({ date, totalDuration, userId }) => {
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);
        const seconds = Math.floor(totalDuration % 60);

        const totalTimeDuration = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
        ].join(":");

        return { date, totalTimeDuration, userId };
    });
}