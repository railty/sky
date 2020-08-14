stop-service -name sky
git pull origin master
npm run buildProd
start-service -name sky