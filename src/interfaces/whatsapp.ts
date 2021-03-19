import { AxiosBasicCredentials } from "axios";

export interface LoginBody extends AxiosBasicCredentials {
    authType: string
}

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