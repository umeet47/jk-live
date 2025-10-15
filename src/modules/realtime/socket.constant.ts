import {
  RtpCodecCapability,
  WorkerLogLevel,
  WorkerLogTag,
  WorkerSettings,
} from "mediasoup/node/lib/types";

export const LISTEN = {
  LOGOUT: "logout",
  CLEANUP: "cleanup",
  MESSAGE: "message",
  DISCONNECT: "disconnect",

  CREATE_ROOM: "create-room",
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  KICKOUT_FROM_ROOM: "kickout-from-room",
  DELETE_ROOM: "delete-room",
  REQUEST_TO_PRODUCE: "request-to-produce",
  ACCEPT_REQUEST: "accept-request",
  DECLINE_REQUEST: "decline-request",
  KICKOUT_FROM_PRODUCING: "kickout-from-producing",
  SEND_INROOM_MESSAGE: "send-inroom-message",
  BLOCK_INROOM_MESSAGE: "block-inroom-message",
  HAS_PRODUCED: "has-produced",
  HAS_JOINED: "has-joined",
  ADD_OWN_TO_PRODUCE_LIST: "add-own-to-produce-list",

  CREATE_WEBRTC_TRANSPORT: "create-webrtc-transport", // for both producing and consuming transport
  PRODUCE: "produce",
  CONSUME: "consume",
  TRANSPORT_CONNECT: "transport-connect",
  CONSUME_RESUME: "consume-resume",
  PRODUCER_PAUSE: "producer-pause",
  PRODUCER_RESUME: "producer-resume",

  INFORM_ROOM_CREATED: "inform-room-created",
  GET_ROOM_STATUS: "get-room-status",
  GET_ALL_ROOMS: "get-all-rooms",

  GET_ROOM_INFO: "get-room-info",
  GET_ALL_ROOMS_INFO: "get-all-rooms-info",

  FOCUS_USER_ROOM: "focus-user-room",

  SEND_DIAMOND: "send-diamond",

  SEND_AGENT_LIST: "send-agent-list",

  CHECK_FOLLOW_STATUS: "check-follow-status",


  CREATE_ROOM_FOR_P2P_CALL: "create-room-for-p2p-call",
  JOIN_ROOM_FOR_P2P_CALL: "join-room-for-p2p-call",
  LEAVE_ROOM_FOR_P2P_CALL: "leave-room-for-p2p-call",
  MAKE_VIDEO_CALL: "make-video-call",
  RECEIVED_VIDEO_CALL: "received-video-call",
  ACCEPT_VIDEO_CALL: "accept-video-call",
  DECLINE_VIDEO_CALL: "decline-video-call",
  END_VIDEO_CALL: "end-video-call",

  REMOVE_DIAMOND: "remove-diamond",

  // room block related events
  BLOCK_USER_IN_ROOM: "block-user-in-room",
  UNBLOCK_USER_IN_ROOM: "unblock-user-in-room",
  LIST_BLOCKED_USERS: "list-blocked-users",
};

export const EMIT = {
  BLOCKED_FROM_ROOM: "blocked-from-room",

  VIDEO_CALL_MADE: "video-call-made",
  VIDEO_CALL_RECEIVED: "video-call-received",
  VIDEO_CALL_ACCEPTED: "video-call-accepted",
  VIDEO_CALL_DECLINED: "video-call-declined",
  VIDEO_CALL_ENDED: "video-call-ended",




  AGENT_LIST: "agent-list",

  INROOM_MESSAGE: "inroom-message",
  INFORM_INROOM_MESSAGE_BLOCK: "inform-inroom-message-block",
  ROOM_CREATED: "room-created",
  ROOM_JOINED: "room-joined",
  ROOM_DELETED: "room-deleted",
  ROOM_LEFT: "room-left",
  ROOM_UPDATED: "room-updated",
  PRODUCER_KICKOUT: "producer-kickout",
  KICKOUT_FROM_ROOM_RESPONSE: "kickout-from-room-response",


  REQUEST_BY_USER: "request-by-user",
  REQUEST_BY_USER_REMOVED: "request-by-user-removed",
  REQUEST_ACCEPTED: "request-accepted",
  REQUEST_REJECTED: "request-rejected",

  PRODUCER_RESUME_RESPONSE: "producer-resume-response",
  PRODUCER_CLOSE_RESPONSE: "producer-close-response",
  PRODUCER_PAUSE_RESPONSE: "producer-pause-response",

  ROOM_LIVE_STATUS: "room-live-status",

  PRODUCED: "produced",
  MEMBER_JOINED: "member-joined",
  FOCUS_USER_ROOM_RESPONSE: "focus-user-room-response",

  DIAMOND_UPDATE: "diamond-update",
  INFORM_DIAMOND_MESSAGE: "inform-diamond-message",
};

export const LISTEN_P2P = {
  SEND_P2P_MESSAGE: "send-p2p-message",
  MARK_MESSAGES_AS_SEEN: "mark-messages-as-seen",
  FETCH_P2P_MESSAGE_HISTORY: 'fetch-p2p-message-history',
  GET_CONVERSATION_USERS: 'get-conversation-users',

  MAKE_CALL: "make-call",
  CALLING_RECEIVED: "calling-received",
  RECEIVED: 'received',
  END_CALL: "end-call",
  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice-candidate",
  P2P_PAUSE: "p2p-pause",
  P2P_RESUME: "p2p-resume",
  P2P_MUTE: "p2p-mute",
  P2P_UNMUTE: "p2p-unmute"
}
export const EMIT_P2P = {
  RECEIVED_P2P_MESSAGE: "received-p2p-message",
  MESSAGES_MARKED_AS_SEEN: "messages-marked-as-seen",

  CALLING: "calling",
  STOP_CALLING_EVENT: "stop-calling-event",
  CALL_RECEIVED: "call-received",
  CALL_END: "call-end",
  OFFER_RECEIVED: "offer-received",
  ANSWER_RECEIVED: "answer-received",
  ICE_CANDIDATE_RECEIVED: "ice-candidate-received",
  P2P_PAUSE_RECEIVED: "p2p-pause-received",
  P2P_RESUME_RECEIVED: "p2p-resume-received",
  P2P_MUTE_RECEIVED: "p2p-mute-received",
  P2P_UNMUTE_RECEIVED: "p2p-unmute-received"
}



export const mediasoupOptions: {
  mediaCodecs: RtpCodecCapability[];
  webRtcTransport_options: any;
  webRtcTransport: any;
  workerSettings: WorkerSettings;
} = {
  mediaCodecs: [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {},
    },
    {
      kind: "video",
      mimeType: "video/H264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "profile-level-id": "4d0032",
        "level-asymmetry-allowed": 1,
      },
    },
    {
      kind: "video",
      mimeType: "video/H264",
      clockRate: 90000,
      parameters: {
        "packetization-mode": 1,
        "profile-level-id": "42e01f",
        "level-asymmetry-allowed": 1,
      },
    },
  ],
  webRtcTransport_options: {
    listenIps: [
      {
        ip: process.env.IP as string, // replace with relevant IP address
        announcedIp: process.env.ANNOUNCED_IP,
        // announcedIp: ANNOUNCED_IP,
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    enableSctp: true,
    initialAvailableOutgoingBitrate: 100000,
  },
  webRtcTransport: {
    minimumAvailableOutgoingBitrate: 15000,
    maximumAvailableOutgoingBitrate: 200000,
    factorIncomingBitrate: 0.75,
  },
  workerSettings: {
    rtcMinPort: 2000,
    rtcMaxPort: 25000,
    logLevel: "warn" as WorkerLogLevel,
    logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"] as WorkerLogTag[],
  },
};

export const listenIps = [{ ip: process.env.IP, announcedIp: process.env.ANNOUNCED_IP }];

export enum MessageType {
  TEXT = "text",
  VOICE = "voice",
  // IMAGE = "image",
  // VIDEO = "video",
  // AUDIO = "audio",
}