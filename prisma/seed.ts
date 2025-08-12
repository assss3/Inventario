import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear depósito por defecto
  await prisma.deposito.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Principal'
    }
  })

  console.log('Depósito principal creado')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })