import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as dynamo from '@aws-cdk/aws-dynamodb';

export class MontyStack extends cdk.Stack {
    private tableRaffles: dynamo.Table;
    private api: apigw.RestApi;
    private nodeModulesLayers: lambda.LayerVersion;
    private proxyLambda: lambda.Function;
    private workerLambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Dynamo tables
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

        // API GW
        this.api = new apigw.RestApi(this, 'monty-api');

        // Lambda layers
        this.nodeModulesLayers = new lambda.LayerVersion(this, 'LayerNodeModules', {
            code: lambda.Code.fromAsset('build/layer_node_modules.zip'),
            compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
            description: 'Layer that contains node_module dependencies'
        });

        // Lambdas
        this.workerLambda = new lambda.Function(this, 'workerLambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambdas/worker.handler',
            code: lambda.Code.fromAsset('build/deployment.zip'),
            retryAttempts: 0,
            timeout: cdk.Duration.seconds(5),
            logRetention: 3,
            layers: [this.nodeModulesLayers]
        });

        this.proxyLambda = new lambda.Function(this, 'proxyLambda', {
            runtime: lambda.Runtime.NODEJS_14_X,
            handler: 'lambdas/proxy.handler',
            code: lambda.Code.fromAsset('build/deployment.zip'),
            environment: {
                APP_PUBLIC_KEY: process.env.MONTY_PUBLIC_KEY as string,
                WORKER_LAMBDA_ARN: this.workerLambda.functionArn as string
            },
            retryAttempts: 0,
            timeout: cdk.Duration.seconds(5),
            logRetention: 3,
            layers: [this.nodeModulesLayers]
        });

        // Policies
        this.workerLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'dynamodb:PutItem',
                'dynamodb:DeleteItem'
            ],
            resources: [
                this.tableRaffles.tableArn
            ]
        }));

        this.proxyLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: [
                'lambda:InvokeFunction'
            ],
            resources: ['*']
        }))

        // API GW integrations
        const lambdaIntegration = new apigw.LambdaIntegration(this.proxyLambda);
        this.api.root.addMethod('POST', lambdaIntegration);
        this.api.root.addMethod('PATCH', lambdaIntegration);
    }
}
