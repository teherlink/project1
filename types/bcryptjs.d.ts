declare module 'bcryptjs' {
  import { BinaryLike } from 'crypto';

  export function hashSync(s: string | Buffer, salt: number | string): string;
  export function compareSync(s: string | Buffer, hash: string): boolean;
  export function hash(s: string | Buffer, salt: number | string, callback: (err: Error | null, hash: string) => void): void;
  export function compare(s: string | Buffer, hash: string, callback: (err: Error | null, res: boolean) => void): void;
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds: number, callback: (err: Error | null, salt: string) => void): void;
  export function genSalt(rounds: number, minor: string, callback: (err: Error | null, salt: string) => void): void;
  export function getRounds(salt: string): number;
  export function getSalt(hash: string): string;
  export const version: string;
}
