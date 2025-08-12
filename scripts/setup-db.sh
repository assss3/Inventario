#!/bin/bash

echo "🐳 Levantando PostgreSQL con Docker..."
docker-compose up -d

echo "⏳ Esperando que PostgreSQL esté listo..."
sleep 10

echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo "📊 Creando tablas en la base de datos..."
npx prisma db push

echo "🌱 Insertando datos iniciales..."
npm run db:seed

echo "✅ Base de datos configurada correctamente!"
echo ""
echo "Credenciales:"
echo "- Host: localhost"
echo "- Puerto: 5432"
echo "- Base de datos: inventario_zapatillas"
echo "- Usuario: inventario_user"
echo "- Contraseña: inventario_pass123"