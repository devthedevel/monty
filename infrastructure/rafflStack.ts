import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamo from '@aws-cdk/aws-dynamodb';

export class RaffLStack extends cdk.Stack {
    private tableRaffles: dynamo.Table;
    private api: apigw.RestApi;
    private lambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.tableRaffles = new dynamo.Table(this, 'TableRaffles', {
            partitionKey: {
                name: 'GuildId',
                type: dynamo.AttributeType.STRING
            },
            sortKey: {
                name: 'Id',
                type: dynamo.AttributeType.STRING
            },
            tableName: 'Raffles'
        });

        this.api = new apigw.RestApi(this, 'raffl-api');
        this.lambda = new lambda.Function(this, 'lambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'app.handler',
            code: lambda.Code.fromAsset('build/deployment.zip'),
            environment: {
                APP_PUBLIC_KEY: process.env.RAFFL_PUBLIC_KEY as string
            },
            retryAttempts: 0,
            timeout: cdk.Duration.seconds(5),
            logRetention: 3,
            layers: [
                new lambda.LayerVersion(this, 'LayerNodeModules', {
                    code: lambda.Code.fromAsset('build/layer_node_modules.zip'),
                    compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
                    description: 'Layer that contains node_module dependencies'
                })
            ]
        });

        this.lambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'dynamodb:PutItem',
                'dynamodb:DeleteItem'
            ],
            resources: [
                this.tableRaffles.tableArn
            ]
        }));

        const lambdaIntegration = new apigw.LambdaIntegration(this.lambda);
        this.api.root.addMethod('POST', lambdaIntegration);
        this.api.root.addMethod('PATCH', lambdaIntegration);
    }
}
