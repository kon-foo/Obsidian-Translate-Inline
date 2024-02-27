export { DeepLProvider } from '../providers/DeepL/provider';
export { ReverseProvider } from '../providers/Reverse/provider';
export { GoogleProvider } from './Google/provider';

export const availableProviders: string[] = ['DeepL', 'Google', 'Reverse'];
export * from './interface';
export * from './types';
export * from './factory';
