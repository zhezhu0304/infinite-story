#!/bin/sh
# Debug: list prisma directory
ls -la prisma/
ls -la prisma/schema.prisma
# 运行数据库迁移
npx prisma migrate deploy
# 启动 Next.js
exec node server.js
