import { InteractionRequest, InteractionResponse, InteractionCallbackType } from "../../types/discord/interactions";
import { MessageComponentData } from "../../types/discord/messageComponent";
import { HttpResponse, Response } from "../../utils/http";

async function handleRaffleVerificationMessage(request: InteractionRequest) {
    const data = request.data as MessageComponentData;

    const valuesString = data.values?.map(value => `'${value}'`).join(' ');

    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `Yay you verified <@${request.member?.user?.id}> for the following raffles: ${valuesString}!`,
            flags: 1 << 6
        }
    });
}

export const MessageComponent = async (request: InteractionRequest): Promise<HttpResponse> => {
    const data = request.data as MessageComponentData;

    console.log(`Message Component Id: ${data?.custom_id}`);

    switch (data?.custom_id) {
        case 'raffle_verification_message': {
            return await handleRaffleVerificationMessage(request);
        }
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