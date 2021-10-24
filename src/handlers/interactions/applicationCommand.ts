import { ApplicationCommandType } from "../../types/discord/applicationCommand";
import { InteractionCallbackType, InteractionData, InteractionRequest, InteractionResponse } from "../../types/discord/interactions";
import { HttpResponse, Response } from '../../utils/http';
import DEBUG from '../../utils/debug';
import * as lambda from '../../services/lambda';
import { Action, ActionData, ActionType } from "../../types/actions";

/**
 * Handles a chat input type interaction
 * @param request 
 * @returns 
 */
async function handleChatInput(request: InteractionRequest): Promise<HttpResponse> {
    if (DEBUG) {
        console.log(`Chat request data: ${JSON.stringify(request.data)}`);
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
        'delete': ActionType.COMMAND_DELETE,
        'add_tickets': ActionType.COMMAND_ADD_TICKETS,
        'start': ActionType.COMMAND_START
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
async function handleUser(_request: InteractionRequest): Promise<HttpResponse> {
    console.log('Unsupported interaction');
    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'This is currently unsupported',
            flags: 1 << 6
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
async function handleMessage(_request: InteractionRequest): Promise<HttpResponse> {
    console.log('Unsupported interaction');
    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'This is currently unsupported',
            flags: 1 << 6
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
            return await handleUser(request);
        }
        case ApplicationCommandType.MESSAGE: {
            return await handleMessage(request);
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