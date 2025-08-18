import nacl from 'tweetnacl';
import base64url from 'base64url';

export function generateKeypair() {
  const keyPair = nacl.sign.keyPair();
  const publicKeyB64 = base64url.encode(Buffer.from(keyPair.publicKey));
  const privateKeyB64 = base64url.encode(Buffer.from(keyPair.secretKey));
  return { publicKeyB64, privateKeyB64 };
}

export function sign(payload: string, privateKeyB64url: string): string {
  const secretKey = new Uint8Array(base64url.toBuffer(privateKeyB64url));
  const message = new TextEncoder().encode(payload);
  const signature = nacl.sign.detached(message, secretKey);
  return base64url.encode(Buffer.from(signature));
}

export function verify(payload: string, sigB64url: string, pubKeyB64url: string): boolean {
  const publicKey = new Uint8Array(base64url.toBuffer(pubKeyB64url));
  const signature = new Uint8Array(base64url.toBuffer(sigB64url));
  const message = new TextEncoder().encode(payload);
  return nacl.sign.detached.verify(message, signature, publicKey);
}

