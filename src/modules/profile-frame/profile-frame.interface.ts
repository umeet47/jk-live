export interface CreateProfileFrameDto {
  name: string
  /** Animation video */
  imageUrl: string;
  /**  Amount of the animation */
  amount: number;
  /**  Validity of the animation */
  validity: number;
}

export interface ProfileFrame {
  id: string;
  name: string;
  imageUrl: string;
  amount: number;
  validity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFrameResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User data */
  data: ProfileFrame;
}
export interface ProfileFrameListResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User data */
  data: ProfileFrame[];
}
