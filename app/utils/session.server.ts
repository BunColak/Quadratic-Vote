import { createCookieSessionStorage, redirect } from "@remix-run/node";
import * as jwt from 'jsonwebtoken'
import { db } from "./prisma.server";

const SESSION_SECRET = process.env.SESSION_SECRET || 'super-secret'

const storage = createCookieSessionStorage({
    cookie: {
        name: "quad-session",
        // normally you want this to be `secure: true`
        // but that doesn't work on localhost for Safari
        // https://web.dev/when-to-use-local-https/
        secure: process.env.NODE_ENV === "production",
        secrets: [SESSION_SECRET],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;
    return userId;
}

export async function requireUserId(
    request: Request,
    redirectTo: string = new URL(request.url).pathname
) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") {
        throw redirect(`/`);
    }
    return userId;
}


export async function logout(request: Request) {
    const session = await getUserSession(request);
    return redirect("/", {
        headers: {
            "Set-Cookie": await storage.destroySession(session),
        },
    });
}

export async function createUserSession(
    userId: string,
    redirectTo: string
) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export const getOrCreateUser = async (token: string) => {
    const decodedToken = jwt.decode(token)
    if (!decodedToken || typeof decodedToken === 'string') {
        throw redirect('/')
    }
    const userId = decodedToken.sub as string
    let user = await db.user.findFirst({ where: { oauthId: userId } })

    if (!user) {
        user = await db.user.create({ data: { oauthId: userId, name: decodedToken.name as string } })
    }

    return user
}

export const getUserNameByOauthId = async (oauthId: string): Promise<string> => {
    const user = await db.user.findFirst({ where: { oauthId }, select: { name: true } })

    if (!user) {
        throw new Error("User not found")
    }

    return user.name
}