import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const project = await prisma.project.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            duration: true,
            size: true,
            format: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      script: project.script,
      medium: project.medium,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      videos: project.videos
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, description, script } = body

    // Allow updating script without requiring name
    if (script !== undefined) {
      const project = await prisma.project.updateMany({
        where: {
          id: id,
          userId: session.user.id
        },
        data: {
          script: script?.trim() || null,
          updatedAt: new Date()
        }
      })

      if (project.count === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true })
    }

    // Handle name/description updates
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = await prisma.project.updateMany({
      where: {
        id: id,
        userId: session.user.id
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        updatedAt: new Date()
      }
    })

    if (project.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const project = await prisma.project.deleteMany({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (project.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 