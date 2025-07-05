import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, script, medium } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        script: script?.trim() || null,
        medium: medium || null,
        userId: session.user.id
      },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      videos: project.videos
    })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 