import { ApplicationCommandType } from "../../types/discord/applicationCommand";
import { InteractionCallbackType, InteractionData, InteractionRequest, InteractionResponse } from "../../types/discord/interactions";
import { HttpResponse, Response } from '../../utils/http';
import DEBUG from '../../utils/debug';
import * as lambda from '../../services/lambda';
import { Action, ActionData, ActionType } from "../../types/actions";
import { EmbedField } from "../../types/discord";

/**
 * Handles a chat input type interaction
 * @param request 
 * @returns 
 */
async function handleChatInput(request: InteractionRequest): Promise<HttpResponse> {
    if (DEBUG) {
        console.log(`Chat request data: ${request.data}`);
    }

    const command = request.data?.options?.[0].name;
    const args: ActionData = { };
    request.data?.options?.[0].options?.forEach(option => {
        args[option.name] = option.value;
    });

    const argString = Object.keys(args).map(argKey => `${argKey}=${args[argKey]}`).join(' ');

    console.log(`Slash command: /${command} ${argString}`)

    const commandActionType = {
        'create': ActionType.COMMAND_CREATE,
        'delete': ActionType.COMMAND_DELETE
    }

    const action: Action = {
        id: request.id,
        type: commandActionType[command as string] ?? ActionType.NULL,
        context: {
            applicationId: request.application_id,
            token: request.token,
            guildId: request.guild_id!
        },
        data: args
    }

    console.log(`Invoking worker lambda with id: ${request.id}`)

    await lambda.invokeWorker(action);
    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
    });
}

/**
 * Handles an user type interaction
 * 
 * Currently not supported
 * @param data 
 * @returns 
 */
async function handleUser(data: InteractionData): Promise<HttpResponse> {
    console.log('data ', JSON.stringify(data));

    const options = new Array(25).fill(null).map((option, index) => {
        return {
            label: index,
            value: index,
            description: `The number ${index}`
        }
    });

    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'This will eventually verify a user ',
            flags: 1 << 6,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: 'raffle_verification_message',
                            placeholder: 'Choose which raffles to verify this user for',
                            min_values: 1,
                            max_values: 25,
                            options: options
                        }
                    ]
                }
            ]
        }
    });
}

/**
 * Handles a message type interaction
 * 
 * Currently not supported
 * @param data 
 * @returns 
 */
async function handleMessage(data: InteractionData): Promise<HttpResponse> {
    if (DEBUG) {
        console.log('data ', JSON.stringify(data));
    }

    const messageId = Object.keys(data.resolved?.messages!)[0];
    const fields = data.resolved?.messages![messageId].embeds[0].fields as EmbedField[];
    const ticketPrice = parseFloat(fields.find(field => field.name === 'Ticket Price')?.value ?? '-1');
    const raffleId = fields.find(field => field.name === 'ID')?.value;

    const options = new Array(25).fill(null).map((_, index) => {
        return {
            label: index + 1,
            value: index + 1,
            description: ticketPrice === -1 ? `Total gold owed: ${(index + 1) * ticketPrice}` : undefined
        }
    });

    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `How many tickets do you want to buy?`,
            flags: 1 << 6,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 3,
                            custom_id: `raffle_buy_tickets_message|${raffleId}`,
                            placeholder: 'Choose how many tickets you want to buy',
                            options: options
                        }
                    ]
                }
            ]
        }
    });
}

/**
 * Handler for an Application Command type interaction.
 * Only a chat input type interaction is currently supported
 * @param request 
 * @returns 
 */
export const ApplicationCommand = async (request: InteractionRequest): Promise<HttpResponse> => {
    const data = request.data as InteractionData;
    
    console.log(`Application Command Type: ${ApplicationCommandType[data.type]}`);
    switch(data.type) {
        case ApplicationCommandType.CHAT_INPUT: {
            return await handleChatInput(request);
        }
        case ApplicationCommandType.USER: {
            return await handleUser(data);
        }
        case ApplicationCommandType.MESSAGE: {
            return await handleMessage(data);
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