# Book Lending App
This repo is part of the tiny project/demo/portfolio for a **Super Simple Book Lending App**.

It is responsible for managing the creation of new users (register) and authentication of existing ones (login).

For the register part, it is as simple as AWS APIs in Lambda (using Serverless framework) with DynamoDb tables and a hash cryptography for saving secure passwords.

For the login part, it uses JWT (see https://jwt.io/) for the next APIs calls that will require any authorization, and it's also made in Serverless (AWS).

## How to install
Assuming you have an [AWS account](https://aws.amazon.com/) and have installed [Serverless](https://serverless.com/), the following steps will explain how to have this project on your machine and install it in the cloud.
1. Clone this repo
2. Open the `serverless.yml` file and create a **JWT_SECRET** (you can create one at https://www.grc.com/passwords.htm)
3. Still in the `serverless.yml` file, change the **profile** to yours, but if you don't have one you can probably delete this line to get the default settings
4. Run `serverless deploy` and wait to finish

## How to uninstall
1. Run `serverless remove`, this will delete all stack created in AWS by Serverless except the DynamoDB table **book-lending-app-user** (because it has the DetentionPolicy set at the yml file).
2. You can manually delete the DynamoDB table at your AWS account.
