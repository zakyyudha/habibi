# Habibi

Habibi is a TypeScript library for encrypting and decrypting Personally Identifiable Information (PII) fields with customizable functions. It allows you to define your own encryption, decryption, and hashing methods, as well as the fields that should be treated as PII.

[![npm version](https://badge.fury.io/js/@zakyyudha%2Fhabibi.svg)](https://badge.fury.io/js/@zakyyudha%2Fhabibi)
[![GitHub issues](https://img.shields.io/github/issues/zakyyudha/habibi)](https://github.com/zakyyudha/habibi/issues)
[![GitHub stars](https://img.shields.io/github/stars/zakyyudha/habibi)](https://github.com/zakyyudha/habibi/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Installation

You can install the package via npm:

```bash
npm install @zakyyudha/habibi
```

## Usage
First, import the Habibi class and the necessary types:

```typescript
import { Habibi, Config } from 'habibi';
```

## Example
Here's an example of how to use the Habibi class:

```typescript
const config: Config = {
    piiFields: ['nik', 'phoneNumber', 'email'],
    encryptFn: (str: string) => 'ENCRYPTED_' + str,
    decryptFn: (str: string) => str.replace('ENCRYPTED_', ''),
    hashFn: (str: string) => 'HASHED_' + str,
    logger: (err: Error | any, key: string) => {
        console.log(err, 'Error while processing fields ' + key);
    },
    stopOnError: false
};

const habibi = new Habibi(config);

const data = {
    nik: '123456',
    phoneNumber: '555-555-5555',
    email: 'test@example.com',
};

const encryptedData = habibi.encryptPIIFields(data);
console.log(encryptedData);

const decryptedData = habibi.decryptPIIFields(encryptedData);
console.log(decryptedData);
```

## API
The Habibi class allows you to create an instance with customizable PII fields, encryption, decryption, and hashing functions.

### Constructor
```typescript
constructor(config: Config = {})
```
- `config` (optional): An object containing:
  - `piiFields` (string[]): An array of field names to be treated as PII.
  - `encryptFn` (EncryptDecryptFunction): A function to encrypt PII fields.
  - `decryptFn` (EncryptDecryptFunction): A function to decrypt PII fields.
  - `hashFn` (EncryptDecryptFunction): A function to hash PII fields.
  - `logger` (Logger): A function to log errors.
  - `stopOnError` (boolean): A flag to stop processing on error.

### Methods
```typescript
encryptPIIFields(obj: any): any
```
Encrypts the PII fields in the given object.

- `obj`: The object containing PII fields to be encrypted.
- Returns: A new object with encrypted PII fields.

```typescript
decryptPIIFields(obj: any): any
```
Decrypts the PII fields in the given object.
- `obj`: The object containing PII fields to be decrypted.
- Returns: A new object with decrypted PII fields.

### Types
A type alias for a function that takes a string and returns a string.
```typescript
type EncryptDecryptFunction = (str: string) => string;
```
An interface for the configuration object.
```typescript
interface Config {
    piiFields?: string[];
    encryptFn?: EncryptDecryptFunction;
    decryptFn?: EncryptDecryptFunction;
    hashFn?: EncryptDecryptFunction;
    logger?: Logger;
    stopOnError?: boolean;
}
```

### Configuration
The Habibi class can be configured with the following options:

- `piiFields`: An array of strings representing the fields that need to be encrypted or decrypted. Defaults to ['nik', 'phoneNumber', 'email'].
- `encryptFn`: A function that takes a string and returns its encrypted version. Defaults to `str => 'ENCRYPTED_' + str`.
- `decryptFn`: A function that takes a string and returns its decrypted version. Defaults to `str => str.replace('ENCRYPTED_', '')`.
- `hashFn`: A function that takes a string and returns its hashed version. Defaults to str => 'HASHED_' + str.
- `logger`: A function that logs errors encountered during processing. Defaults to `console.log`.
- `stopOnError`: A boolean that determines whether to stop processing when an error is encountered. Defaults to `false`
