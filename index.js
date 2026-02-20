/**
 * @format
 */

import 'react-native-get-random-values';
import { Amplify } from 'aws-amplify';
import { COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, AWS_REGION } from '@env';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: COGNITO_USER_POOL_ID,
      userPoolClientId: COGNITO_CLIENT_ID,
      signUpVerificationMethod: 'code',
    },
  },
});

AppRegistry.registerComponent(appName, () => App);
