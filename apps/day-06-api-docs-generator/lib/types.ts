export type Format = 'code' | 'openapi' | 'plaintext';

export interface GenerateRequest {
  input: string;
  format: Format;
}
