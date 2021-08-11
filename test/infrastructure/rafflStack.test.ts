import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as RaffL from '../../infrastructure/rafflStack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new RaffL.RaffLStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
