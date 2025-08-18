export interface Participant {
  startTime: string;
  endTime: string;
}
export interface Producer {
  startTime: string;
  endTime: string;
  LiveStreamParticipant: Participant[];
}

export function getOverlapSeconds(aStart: string, aEnd: string, bStart: string, bEnd: string): number {
  const start = Math.max(new Date(aStart).getTime(), new Date(bStart).getTime());
  const end = Math.min(new Date(aEnd).getTime(), new Date(bEnd).getTime());
  return Math.max(0, (end - start) / 1000);
}

export function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map(n => n.toString().padStart(2, "0")).join(":");
}

export function calculateProducerOverlap(producer: Producer) {
  if (!producer.startTime || !producer.endTime) return { totalSeconds: 0, formatted: "00:00:00" };
  let total = 0;
  for (const p of producer.LiveStreamParticipant) {
    if (!p.startTime || !p.endTime) continue;
    total += getOverlapSeconds(producer.startTime, producer.endTime, p.startTime, p.endTime);
  }
  return {
    totalSeconds: total,
    formatted: formatSeconds(total),
  };
}