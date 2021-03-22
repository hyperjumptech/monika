export interface CheckContactBody {
    blocking: string;
    constact: string[];
    forceCheck: boolean;
}

export interface SendMessageBody {
    to: string;
    type: string;
    recipientType: string;
    text: {
        body: string
    }
}

export interface User {
    token: string
    expires_after: string
}

export interface Meta {
    version: string
    api_status: string
}

export interface LoginUserSuccessResponse {
    users: User[]
    meta: Meta
}