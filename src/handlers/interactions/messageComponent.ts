import { InteractionRequest, InteractionResponse, InteractionCallbackType } from "../../types/discord/interactions";
import { MessageComponentData } from "../../types/discord/messageComponent";
import DEBUG from "../../utils/debug";
import { HttpResponse, Response } from "../../utils/http";
import * as lambda from '../../services/lambda';
import { BuyTicketsActionData } from "../actions";
import { ActionType } from "../../types/actions";

export const MessageComponent = async (request: InteractionRequest): Promise<HttpResponse> => {
    if (DEBUG) {
        console.log('request', JSON.stringify(request));
    }

    const data = request.data as MessageComponentData;
    console.log(`Message Component Id: ${data?.custom_id}`);

    const [id, arg] = data?.custom_id!.split('|');

    switch (id) {
        case 'raffle_verification_message': {
            return await handleRaffleVerificationMessage(request);
        }
        case 'raffle_buy_tickets_message': {
            return await handleRaffleBuyTicketsMessage(request, arg);
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

async function handleRaffleBuyTicketsMessage(request: InteractionRequest, raffleId: string) {
    const data = request.data as MessageComponentData;

    await lambda.invokeWorker<BuyTicketsActionData>({
        id: request.id,
        context: {
            applicationId: request.application_id,
            guildId: request.guild_id as string,
            token: request.token
        },
        type: ActionType.MESSAGE_BUY_TICKETS,
        data: {
            raffleId: raffleId,
            userId: request.member!.user!.id,
            //@ts-ignore
            tickets: parseInt(data.values?.[0] ?? '0', 10)
        }
    })

    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    });
}