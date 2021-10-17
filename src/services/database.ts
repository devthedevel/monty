import { DynamoDB } from "aws-sdk";

interface RaffleCreateParams {
    GuildId: string;
    Id: string;
    TicketPrice: number;
    Prize?: string;
}

interface RaffleDeleteParams {
    GuildId: string;
    Id: string;
}

const db = new DynamoDB.DocumentClient();

export class Raffle {
    private static TableName = 'Raffles';

    static async create(raffle: RaffleCreateParams): Promise<void> {
        const params: DynamoDB.PutItemInput = {
            TableName: Raffle.TableName,
            // @ts-ignore
            Item: raffle
        };

        await db.put(params).promise();
    }

    static async delete(raffle: RaffleDeleteParams): Promise<void> {
        const params: DynamoDB.DeleteItemInput = {
            TableName: Raffle.TableName,
            // @ts-ignore
            Key: raffle
        }

        await db.delete(params).promise();
    }
}