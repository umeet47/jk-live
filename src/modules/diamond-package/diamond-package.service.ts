import { APIError } from "encore.dev/api";
import { getSocketInstance } from "../realtime/socket.service";
import { CreateDiamondPackageDto } from "./diamond-package.interface";
import DiamondPackageRepository from "./diamond-package.repository";
import { REAL_UPDATE } from "../../common/enum";

const DiamondPackageService = {
  createNewDiamondPackage: async (data: CreateDiamondPackageDto) => {
    const diamondPackage = await DiamondPackageRepository.createNew(data);
    const io = getSocketInstance();
    io.emit(REAL_UPDATE.DIAMOND_PACKAGE_ADDED, { diamondPackage });
    return diamondPackage;
  },
  removeDiamondPackage: async (id: string) => {
    const diamondPackage = await DiamondPackageRepository.findById(id);
    if (!diamondPackage) {
      throw APIError.notFound("Diamond Package not found");
    }
    await DiamondPackageRepository.remove(id);
    const io = getSocketInstance();
    io.emit(REAL_UPDATE.DIAMOND_PACKAGE_REMOVED, { diamondPackage });
    return;
  },
  findAllDiamondPackage: async () => {
    return await DiamondPackageRepository.findAll();
  },
};

export default DiamondPackageService;
