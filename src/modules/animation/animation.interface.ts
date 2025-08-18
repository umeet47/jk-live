export interface CreateAnimationDto {
  name: string
  /** Animation video */
  videoUrl: string;
  /**  Amount of the animation */
  amount: number;
  /**  Validity of the animation */
  validity: number;
}
export interface UpdateAnimationDto {
  /** Animation gif */
  gif?: string;
  /** Animation audio */
  audio?: string;
  /**  Amount of the animation */
  amount?: number;
  /**  Validity of the animation */
  validity?: number;
}

export interface Animation {
  id: string;
  name: string;
  videoUrl: string;
  amount: number;
  validity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnimationResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User data */
  result: Animation;
}
export interface AnimationListResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User data */
  result: Animation[];
}
