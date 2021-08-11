import * as nacl from 'tweetnacl';
import { APIGatewayEvent } from 'aws-lambda';
import { HttpResponse, Response } from './http';
import { InteractionCallbackType, InteractionRequest, InteractionRequestType } from './interactions';

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

export const handler = async (event: APIGatewayEvent): Promise<HttpResponse> => {
    console.log('Incoming request');

    // Request fails verification, return 401
    if (!verifyRequest(event)) {
        console.error('Could not verify request!');
        return Response(401);
    }

    console.log('Request verified!');

    const request: InteractionRequest = JSON.parse(event.body as string);

    console.log('body ', request);

    switch (request.type) {
        case InteractionRequestType.PING: {
            console.log('PING request received! Sending PONG')
            return Response(200, {type: InteractionCallbackType.PONG});
        }
        case InteractionRequestType.APPLICATION_COMMAND: {
            console.log('APPLICATION COMMAND request received!');
            return Response(200);
        }
        case InteractionRequestType.MESSAGE_COMPONENT: {
            console.log('MESSAGE COMPONENT request received!');
            return Response(200);
        }
        default: {
            console.log('Defaulting to 200 response');
            return Response(200);
        }
    }
}