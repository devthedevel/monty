import { InteractionCallbackType, InteractionResponse } from "../../types/discord/interactions";
import { HttpResponse, Response } from '../../utils/http';

export const Ping = async (): Promise<HttpResponse> => {
    console.log('PONG!');
    return Response<InteractionResponse>(200, {type: InteractionCallbackType.PONG});
}