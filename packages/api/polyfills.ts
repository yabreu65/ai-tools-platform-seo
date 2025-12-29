// Polyfills for web APIs expected by libraries in Node 18
// Ensure global File is available (Node < 20)
import { File as UndiciFile } from 'undici';

if (!(globalThis as any).File) {
  (globalThis as any).File = UndiciFile;
}