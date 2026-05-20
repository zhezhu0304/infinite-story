#!/bin/sh
mkdir -p /app/data
touch /app/data/prod.db
npx prisma migrate deploy
exec node server.js
