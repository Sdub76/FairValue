'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export async function login(formData: FormData) {
    const password = formData.get('password') as string

    const { getConfig } = await import('@/lib/config')
    const config = getConfig()
    const configPassword = config.app?.password || 'changeme'

    if (password === configPassword) {
        const cookieStore = await cookies()
        cookieStore.set('session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        })
        redirect('/')
    } else {
        // For MVP just redirect back with no error param for now (or TODO add error handling)
        redirect('/login?error=true')
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}
