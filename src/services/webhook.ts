import axios from 'axios';
import { InteractionCallbackData } from '../types/discord/interactions';

const API_VERSION = 'v9';

const instance = axios.create({
    baseURL: `https://discord.com/api/${API_VERSION}`
});

export async function editInitialResponse(applicationId: string, token: string, data: InteractionCallbackData): Promise<any> {
    return instance.patch(`/webhooks/${applicationId}/${token}/messages/@original`, data);
}

export async function createFollowupMessage(applicationId: string, token: string, data: InteractionCallbackData): Promise<any> {
    return instance.post(`/webhooks/${applicationId}/${token}`, data);
}