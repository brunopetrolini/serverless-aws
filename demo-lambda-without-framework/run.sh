# 1 - Create security policies file
# 2 - Create security role in AWS

aws iam create-role \
  --role-name demo-without-framework \
  --assume-role-policy-document file://policies.json \
  | tee logs/role.log

# 3 - Create file with content and zip
zip function.zip index.js

# 4 - create and deploy lambda in AWS
aws lambda create-function \
  --function-name hello-cli \
  --zip-file fileb://function.zip \
  --handler index.handler \
  --runtime nodejs14.x \
  --role arn:aws:iam::070825231996:role/demo-without-framework \
  | tee logs/lambda-create.log

# 5 - Lambda invoke
aws lambda invoke \
  --function-name hello-cli \
  --log-type Tail \
  logs/lambda-exec.log

# 6 - re-zip and update
zip function.zip index.js

aws lambda update-function-code \
  --zip-file fileb://function.zip \
  --function-name hello-cli \
  --publish \
  | tee logs/lambda-update.log

# 7 - delete the function
aws lambda delete-function \
  --function-name hello-cli

# 8 - delete the role
aws iam delete-role \
  --role-name demo-without-framework