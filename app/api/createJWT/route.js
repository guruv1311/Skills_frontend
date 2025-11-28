// // app/api/createJWT/route.js
// import fs from "fs";
// import path from "path";
// import crypto from "crypto";
// import jwt from "jsonwebtoken";
// import { v4 as uuid } from "uuid";
// import { NextResponse } from "next/server";

// const TIME_45_DAYS_SEC = 60 * 60 * 24 * 45;

// // NOTE: Place your keys in a secure directory, e.g. <project-root>/keys/
// // NEVER commit the private key to source control.
// const KEYS_DIR = path.join(process.cwd(), "keys");
// const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "client_private_key.pem");
// const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "client_public_key.pem");

// function readKeySync(p) {
//     try {
//         return fs.readFileSync(p);
//     } catch (e) {
//         console.error("Failed to read key:", p, e);
//         throw e;
//     }
// }

// function createJWTString(anonymousUserID, sessionInfo, context, PRIVATE_KEY, PUBLIC_KEY) {
//     const jwtContent = {
//         sub: anonymousUserID,
//         user_payload: {
//             custom_message: "Encrypted message",
//             name: "Anonymous",
//         },
//         context: context || {},
//     };

//     if (sessionInfo) {
//         jwtContent.user_payload.name = sessionInfo.userName;
//         jwtContent.user_payload.custom_user_id = sessionInfo.customUserID;
//     }

//     const dataString = JSON.stringify(jwtContent.user_payload);

//     const encryptedBuffer = crypto.publicEncrypt(
//         {
//             key: PUBLIC_KEY,
//             padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//             oaepHash: "sha256",
//         },
//         Buffer.from(dataString, "utf-8")
//     );

//     jwtContent.user_payload = encryptedBuffer.toString("base64");

//     // Sign the JWT - long expiry (kept from your example). Adjust as desired.
//     const jwtString = jwt.sign(jwtContent, PRIVATE_KEY, {
//         algorithm: "RS256",
//         expiresIn: "10000000s",
//     });

//     return jwtString;
// }

// export async function GET(req) {
//     try {
//         const PRIVATE_KEY = readKeySync(PRIVATE_KEY_PATH);
//         const PUBLIC_KEY = readKeySync(PUBLIC_KEY_PATH);

//         const url = new URL(req.url);
//         const userId = url.searchParams.get("user_id") || "anonymous";
//         // You could also look at cookies in req.headers.cookie to obtain session info.
//         const anonymousID = `anon-${uuid().slice(0, 5)}`;

//         // build context (the client expects `wxo_user_name` for example)
//         const context = {
//             user_id: userId,
//         };

//         const token = createJWTString(anonymousID, null, context, PRIVATE_KEY, PUBLIC_KEY);

//         // return token and set ANONYMOUS-USER-ID cookie (45 days)
//         const res = NextResponse.json({ token });
//         // cookie using NextResponse API:
//         res.cookies.set({
//             name: "ANONYMOUS-USER-ID",
//             value: anonymousID,
//             httpOnly: true,
//             maxAge: TIME_45_DAYS_SEC,
//             path: "/",
//             sameSite: "lax",
//         });

//         return res;
//     } catch (err) {
//         console.error("createJWT error:", err);
//         return new Response("Unable to create JWT", { status: 500 });
//     }
// }


// app/api/createJWT/route.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { NextResponse } from "next/server";

const TIME_45_DAYS_SEC = 60 * 60 * 24 * 45;
const KEYS_DIR = path.join(process.cwd(), "keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "client_private_key.pem");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "client_public_key.pem");

function readKeySync(p) {
    try {
        return fs.readFileSync(p);
    } catch (e) {
        console.error("Failed to read key:", p, e);
        throw e;
    }
}

// function createJWTString(anonymousUserID, sessionInfo, context, PRIVATE_KEY, PUBLIC_KEY) {
//     const jwtContent = {
//         sub: anonymousUserID,
//         user_payload: {
//             custom_message: "Encrypted message",
//             name: "Anonymous",
//         },
//         context: context || {},
//     };

//     if (sessionInfo) {
//         jwtContent.user_payload.name = sessionInfo.userName;
//         jwtContent.user_payload.custom_user_id = sessionInfo.customUserID;
//     }

//     const dataString = JSON.stringify(jwtContent.user_payload);

//     const encryptedBuffer = crypto.publicEncrypt(
//         {
//             key: PUBLIC_KEY,
//             padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//             oaepHash: "sha256",
//         },
//         Buffer.from(dataString, "utf-8")
//     );

//     jwtContent.user_payload = encryptedBuffer.toString("base64");

//     const jwtString = jwt.sign(jwtContent, PRIVATE_KEY, {
//         algorithm: "RS256",
//         expiresIn: "10000000s",
//     });

//     return jwtString;
// }
function createJWTString(anonymousUserID, sessionInfo, context, PRIVATE_KEY, PUBLIC_KEY) {
    const jwtContent = {
        sub: anonymousUserID,
        user_payload: {
            custom_message: "Encrypted message",
            name: "Anonymous",
            // <-- you can add more defaults here
        },
        context: context || {},
    };

    // If sessionInfo exists keep original behavior
    if (sessionInfo) {
        jwtContent.user_payload.name = sessionInfo.userName;
        jwtContent.user_payload.custom_user_id = sessionInfo.customUserID;
    }

    // If the incoming context contains user_role (or other fields) and you want them encrypted:
    if (context && context.user_role) {
        // copy role into encrypted user_payload
        jwtContent.user_payload.user_role = context.user_role;
        // optional: remove it from context if you don't want duplicate
        // delete jwtContent.context.user_role;
    }

    const dataString = JSON.stringify(jwtContent.user_payload);

    const encryptedBuffer = crypto.publicEncrypt(
        {
            key: PUBLIC_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(dataString, "utf-8")
    );

    jwtContent.user_payload = encryptedBuffer.toString("base64");

    const jwtString = jwt.sign(jwtContent, PRIVATE_KEY, {
        algorithm: "RS256",
        expiresIn: "10000000s",
    });

    return jwtString;
}


export async function GET(req) {
    try {
        const PRIVATE_KEY = readKeySync(PRIVATE_KEY_PATH);
        const PUBLIC_KEY = readKeySync(PUBLIC_KEY_PATH);

        const url = new URL(req.url);
        const userId = url.searchParams.get("user_id") || "anonymous";
        const role = url.searchParams.get("role") || "anonymous";
        const anonymousID = `anon-${uuid().slice(0, 5)}`;

        // Put user name & role into context so the runtime can read them
        const context = {
            user_id: userId,
            user_type: role,
        };

        const token = createJWTString(anonymousID, null, context, PRIVATE_KEY, PUBLIC_KEY);

        const res = NextResponse.json({ token });
        res.cookies.set({
            name: "ANONYMOUS-USER-ID",
            value: anonymousID,
            httpOnly: true,
            maxAge: TIME_45_DAYS_SEC,
            path: "/",
            sameSite: "lax",
        });

        return res;
    } catch (err) {
        console.error("createJWT error:", err);
        return new Response("Unable to create JWT", { status: 500 });
    }
}
