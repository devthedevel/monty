import { DynamoDB } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

interface RaffleTableKey {
    GuildId: string;
    Id: string;
}

interface RaffleCreateItem {
    TicketPrice: number;
    Prize?: string;
}
type RaffleCreateParams = RaffleTableKey & RaffleCreateItem;


interface RaffleAddTicketsItem {
    UserId: string;
    Tickets: number;
}
type RaffleAddTicketsParams = RaffleTableKey & RaffleAddTicketsItem;

const db = new DynamoDB.DocumentClient();

export class Raffle {
    private static TableName = 'Raffles';

    static async create(raffle: RaffleCreateParams): Promise<void> {
        const params: DocumentClient.PutItemInput = {
            TableName: Raffle.TableName,
            Item: {
                ...raffle,
                Tickets: { }
            }
        };

        await db.put(params).promise();
    }

    static async delete(raffle: RaffleTableKey): Promise<void> {
        const params: DocumentClient.DeleteItemInput = {
            TableName: Raffle.TableName,
            Key: raffle
        }

        await db.delete(params).promise();
    }

    static async addTickets(params: RaffleAddTicketsParams): Promise<void> {
        const _params: DocumentClient.UpdateItemInput = {
            TableName: Raffle.TableName,
            Key: {
                GuildId: params.GuildId,
                Id: params.Id
            },
            UpdateExpression: 'set #t.#u = :v',
            ExpressionAttributeNames: {
                '#t': 'Tickets',
                '#u': params.UserId
            },
            ExpressionAttributeValues: {
                ':v': params.Tickets
            }
        }

        await db.update(_params).promise();
    }
}