import * as aws from '@pulumi/aws'

export const localProvider = new aws.Provider('local-provider', {
  skipCredentialsValidation: true,
  skipRequestingAccountId: true,
  endpoints: [
    {
      dynamodb: 'http://localhost:4566',
    },
    {
      iam: 'http://localhost:4566',
    },
  ],
})
