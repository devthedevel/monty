import * as nacl from 'tweetnacl';
import { APIGatewayEvent } from 'aws-lambda';
import { HttpResponse, Response } from '../utils/http';
import { InteractionCallbackType, InteractionRequest, InteractionRequestType, InteractionResponse } from '../types/discord/interactions';
import { ApplicationCommand, MessageComponent, Ping } from '../handlers/interactions';

/**
 * Verifies if the incoming request is valid from Discord
 * @param event - The incoming request
 * @returns true if the request is valid, false if not
 */
function verifyRequest(event: APIGatewayEvent): boolean {
    console.log('Verifying...');

    const APP_PUBLIC_KEY = process.env.APP_PUBLIC_KEY;

    if (!APP_PUBLIC_KEY) {
        throw new Error('No app public key found!');
    }

    const signature = event.headers['x-signature-ed25519'];
    const timestamp = event.headers['x-signature-timestamp'];
    const body = event.body;

    if (!signature) {
        throw new Error('No signature found!')
    }

    if (!timestamp) {
        throw new Error('No timestamp found!')

    }

    if (!body) {
        throw new Error('No body found!')
    }

    return nacl.sign.detached.verify(
        Buffer.from(`${timestamp}${body}`),
        Buffer.from(signature, 'hex'),
        Buffer.from(APP_PUBLIC_KEY as string, 'hex')
    );
}


/**
 * Handler for the Monty app
 * @param event 
 * @returns 
 */
export const handler = async (event: APIGatewayEvent): Promise<HttpResponse> => {
    console.log('Incoming request');

    // Request fails verification, return 401
    if (!verifyRequest(event)) {
        console.error('Could not verify request!');
        return Response(401);
    }

    console.log('Request verified!');

    const request: InteractionRequest = JSON.parse(event.body as string);
    console.log(`Request type: ${InteractionRequestType[request.type]}`);

    switch(request.type) {
        case InteractionRequestType.PING: {
            return Ping();
        }
        case InteractionRequestType.APPLICATION_COMMAND: {
            return ApplicationCommand(request);
        }
        case InteractionRequestType.MESSAGE_COMPONENT: {
            return MessageComponent(request);
        }
        default: {
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