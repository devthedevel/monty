import { InteractionCallbackType, InteractionRequest, InteractionResponse } from "../discord/interactions";
import { HttpResponse, Response } from '../utils/http';

export const Ping = async (_request: InteractionRequest): Promise<HttpResponse> => {
    console.log('PONG!');
    return Response<InteractionResponse>(200, {type: InteractionCallbackType.PONG});
}