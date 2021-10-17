import { Lambda } from 'aws-sdk';
import { Action, ActionData } from '../types/actions';

const lambda = new Lambda();

const WORKER_LAMBDA_ARN = process.env.WORKER_LAMBDA_ARN as string;

if (!WORKER_LAMBDA_ARN) {
    throw new Error('No monty lambda arn found!');
}

/**
 * Invokes the worker lambda. Used only for deferred messages
 * @param event
 * @returns 
 */
 export async function invokeWorker<T = ActionData>(action: Action<T>): Promise<Lambda.InvokeAsyncResponse> {
    return lambda.invokeAsync({
        FunctionName: WORKER_LAMBDA_ARN,
        InvokeArgs: JSON.stringify(action)
    }).promise();
}