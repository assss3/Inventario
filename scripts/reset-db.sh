#!/bin/bash

echo "🗑️ Eliminando base de datos existente..."
docker-compose down -v

echo "🐳 Levantando PostgreSQL con Docker..."
docker-compose up -d

echo "⏳ Esperando que PostgreSQL esté listo..."
sleep 10

echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo "📊 Creando tablas en la base de datos..."
npx prisma db push --force-reset

echo "🌱 Insertando datos iniciales..."
npm run db:seed

echo "✅ Base de datos reiniciada correctamente!"