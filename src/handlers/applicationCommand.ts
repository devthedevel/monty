import { ApplicationCommandType, InteractionCallbackType, InteractionData, InteractionRequest, InteractionResponse } from "../discord/interactions";
import { HttpResponse, Response } from '../utils/http';

/**
 * Handles a chat input type interaction
 * @param data 
 * @returns 
 */
async function handleChatInput(data: InteractionData): Promise<HttpResponse> {
    console.log(`options `, JSON.stringify(data.options));
    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `Recieved command with name '${data.options?.[0].value}' and ticket price '${data.options?.[1].value}'`
        }
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
    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'Action not supported'
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
    return Response<InteractionResponse>(200, {
        type: InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: 'Action not supported'
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
    
    console.log(`Type: ${InteractionCallbackType[data.type]}`)
    switch(data.type) {
        case ApplicationCommandType.CHAT_INPUT: {
            return await handleChatInput(data);
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
                    content: 'Default action. You should never be able to get here'
                }
            });
        }
    }
}