# instalar serverless framework
npm install --global serverless

# inicializar o serverless
serverless

# sempre realizar deploys em um curto espaço de tempo para
# verificar se tudo está funcionando
serverless deploy

# invocar na AWS
serverless invoke -f hello

# invocar local
serverless invoke local -f hello

# logs
serverless logs -f hello -t

# remover toda a stack da lambda
serverless remove