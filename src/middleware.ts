
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Exclude static assets, next internals, and login page
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/static') ||
        request.nextUrl.pathname.startsWith('/api') || // PB pass-through if any
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico)$/)
    ) {
        return NextResponse.next()
    }

    const session = request.cookies.get('session')

    if (!session || session.value !== 'authenticated') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/((?!favicon.ico).*)',
}
