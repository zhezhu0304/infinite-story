#!/bin/sh
# 运行数据库迁移
node ./node_modules/.bin/prisma migrate deploy
# 启动 Next.js
exec node server.js
