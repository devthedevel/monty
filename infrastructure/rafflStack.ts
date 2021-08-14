import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';

export class RaffLStack extends cdk.Stack {
    private api: apigw.RestApi;
    private lambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

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

        const lambdaIntegration = new apigw.LambdaIntegration(this.lambda);
        this.api.root.addMethod('POST', lambdaIntegration);
        this.api.root.addMethod('PATCH', lambdaIntegration);
    }
}
