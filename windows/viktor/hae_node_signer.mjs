import fs from "node:fs";
import crypto from "node:crypto";
const keyPath=process.env.HERMES_HAE_WINDOWS_NODE_PRIVATE_KEY||"C:\\Hermes\\Secrets\\viktor_hae_ed25519_private.pem";
let input="";
for await (const chunk of process.stdin) input+=chunk;
if(!input) throw new Error("signing_message_required");
const privateKey=fs.readFileSync(keyPath,"utf8");
const signature=crypto.sign(null,Buffer.from(input,"utf8"),privateKey);
process.stdout.write(signature.toString("base64url"));
