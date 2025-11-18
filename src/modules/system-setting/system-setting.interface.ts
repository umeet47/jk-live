
export interface SystemSettingDto { id: string; withdrawFlag: boolean }
export interface SystemSettingResponse {
    success: boolean;
    message: string;
    data: SystemSettingDto
}

export interface UpdateSystemSetting {
    withdrawFlag?: boolean
}