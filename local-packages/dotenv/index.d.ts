export interface DotenvParseOutput {
  [name: string]: string;
}

export interface DotenvConfigOptions {
  path?: string;
  encoding?: string;
}

export interface DotenvConfigOutput {
  parsed?: DotenvParseOutput;
  error?: Error;
}

export function config(options?: DotenvConfigOptions): DotenvConfigOutput;
export function parse(src: string | Buffer): DotenvParseOutput;
