import { APIError } from "encore.dev/api";
import ProfileFrameRepository from "./profile-frame.repository";
import { getSocketInstance } from "../realtime/socket.service";
import { REAL_UPDATE } from "../../common/enum";
import { CreateProfileFrameDto } from "./profile-frame.interface";
import UserService from "../users/user.service";

const ProfileFrameService = {
  createProfileFrame: async (data: CreateProfileFrameDto) => {
    const profileFrame = await ProfileFrameRepository.createNew(data);

    const io = getSocketInstance();
    io.emit(REAL_UPDATE.PROFILE_FRAME_ADDED, { profileFrame });

    return profileFrame;
  },
  removeProfileFrame: async (id: string) => {
    const profileFrame = await ProfileFrameRepository.findById(id);
    if (!profileFrame) {
      throw APIError.notFound("Profile Frame not found");
    }
    await ProfileFrameRepository.remove(id);
    const io = getSocketInstance();
    io.emit(REAL_UPDATE.PROFILE_FRAME_REMOVED, { profileFrame: id });

    return;
  },
  fetchAllProfileFrame: async () => {
    return await ProfileFrameRepository.findAll();
  },
  buyProfileFrame: async (profileFrameId: string, userId: string) => {
    const user = await UserService.findOne(userId)
    const profileFrame = await ProfileFrameRepository.findById(profileFrameId)
    if (!profileFrame) {
      throw APIError.notFound("Given Profile Frame not found")
    }
    if (profileFrame.amount > user.diamond) {
      throw APIError.aborted("Not enough diamonds on user account to buy given profile frame")
    }
    return ProfileFrameRepository.buyProfileFrame(user, profileFrame)
  }
};
export default ProfileFrameService;
