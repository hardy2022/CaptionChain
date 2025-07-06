const { PrismaClient } = require('./src/generated/prisma')

async function checkProject() {
  const prisma = new PrismaClient()
  
  try {
    const projectId = 'cmcrdagxw00010i6agsl9m115'
    
    console.log('Checking for project:', projectId)
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true }
    })
    
    if (project) {
      console.log('Project found:', {
        id: project.id,
        name: project.name,
        userId: project.userId,
        userEmail: project.user.email
      })
    } else {
      console.log('Project not found')
      
      // List all projects
      const allProjects = await prisma.project.findMany({
        include: { user: true }
      })
      console.log('All projects:', allProjects.map(p => ({ id: p.id, name: p.name, userEmail: p.user.email })))
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProject() 