import { InteractionRequest, InteractionResponse, InteractionCallbackType } from "../../types/discord/interactions";
import { MessageComponentData } from "../../types/discord/messageComponent";
import DEBUG from "../../utils/debug";
import { HttpResponse, Response } from "../../utils/http";

export const MessageComponent = async (request: InteractionRequest): Promise<HttpResponse> => {
    if (DEBUG) {
        console.log('request', JSON.stringify(request));
    }

    const data = request.data as MessageComponentData;
    console.log(`Message Component Id: ${data?.custom_id}`);

    const [id] = data?.custom_id!.split('|');

    switch (id) {
        default: {
            console.log('Defaulting');
            return Response<InteractionResponse>(200, {
                type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'Default action. You should never be able to get here',
                    flags: 1 << 6
                }
            });
        }
    }
}
