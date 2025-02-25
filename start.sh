pkill -f redis-memory-server; kill -9 $(lsof -t -i:8888)

pm2 delete client
pm2 delete server
cd client && pm2 --name client start bunx -- serve dist -s -l 3001
cd server && pm2 --name server start bunx -- run dev