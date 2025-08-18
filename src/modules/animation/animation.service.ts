import { APIError } from "encore.dev/api";
import { CreateAnimationDto } from "./animation.interface";
import AnimationRepository from "./animation.repository";
import { getSocketInstance } from "../realtime/socket.service";
import UserService from "../users/user.service";
import { REAL_UPDATE } from "../../common/enum";

const AnimationService = {
  createAnimation: async (data: CreateAnimationDto) => {
    const animation = await AnimationRepository.createNew(data);

    const io = getSocketInstance();
    io.emit(REAL_UPDATE.ANIMATION_ADDED, { animation });

    return animation;
  },
  // updateAnimation: async (data: UpdateAnimationDto, id: string) => {
  //   const animation = await AnimationRepository.findById(id);
  //   if (!animation) {
  //     throw APIError.notFound("Animation not found");
  //   }
  //   const newAnimation = await AnimationRepository.update(data, id);
  //   const io = getSocketInstance();
  //   io.emit(REAL_UPDATE.ANIMATION_UPDATED, { animation: newAnimation });
  //   return newAnimation;
  // },
  removeAnimation: async (id: string) => {
    const animation = await AnimationRepository.findById(id);
    if (!animation) {
      throw APIError.notFound("Animation not found");
    }
    await AnimationRepository.remove(id);
    const io = getSocketInstance();
    io.emit(REAL_UPDATE.ANIMATION_REMOVED, { animation: id });

    return;
  },
  fetchAllAnimation: async () => {
    return await AnimationRepository.findAll();
  },
  buyAnimation: async (animationId: string, userId: string) => {
    const user = await UserService.findOne(userId)
    const animation = await AnimationRepository.findById(animationId)
    if (!animation) {
      throw APIError.notFound("Given Animation not found")
    }
    if (animation.amount > user.diamond) {
      throw APIError.aborted("Not enough diamond on user account to buy given animation")
    }
    return AnimationRepository.buyAnimation(user, animation)
  }
};
export default AnimationService;
