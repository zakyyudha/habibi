type EncryptDecryptFunction = (str: string) => string;
type Logger = (err: Error | any, key: string) => void;

interface Config {
  piiFields?: string[];
  encryptFn?: EncryptDecryptFunction;
  decryptFn?: EncryptDecryptFunction;
  hashFn?: EncryptDecryptFunction;
  logger?: Logger;
  stopOnError?: boolean;
}

class Habibi {
  private readonly piiFields: string[];
  private readonly encryptFn: EncryptDecryptFunction;
  private readonly decryptFn: EncryptDecryptFunction;
  private readonly hashFn: EncryptDecryptFunction;
  private readonly logger: Logger;
  private readonly stopOnError: boolean;

  constructor (config: Config = {}) {
    this.piiFields = config.piiFields || ['nik', 'phoneNumber', 'email'];
    this.encryptFn = config.encryptFn || ((str: string) => 'ENCRYPTED_' + str);
    this.decryptFn = config.decryptFn || ((str: string) => str.replace('ENCRYPTED_', ''));
    this.hashFn = config.hashFn || ((str: string) => 'HASHED_' + str);
    this.logger = config.logger || ((err: Error | any, key: string) => {
      console.log(err, 'Error while processing fields ' + key);
    });
    this.stopOnError = config.stopOnError || false;
  }

  private processField (value: string, key: string, fn: EncryptDecryptFunction, processHash: boolean): any {
    if (value === '') return { value };

    try {
      const processedValue = fn(value);
      if (processHash) {
        return { value: processedValue, hash: this.hashFn(value) };
      }
      return { value: processedValue };
    } catch (err) {
      this.logger(err, key);
      if (this.stopOnError) {
        throw err;
      }
      return { value };
    }
  }

  private processFields (obj: any, fn: EncryptDecryptFunction, processHash: boolean): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.processFields(item, fn, processHash));
    }

    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const result: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (key === '_id') {
          result[key] = value;
        } else if (Array.isArray(value)) {
          result[key] = value.map(item => {
            if (typeof item === 'string' && this.piiFields.includes(key) && item !== '') {
              const { value: processedValue, hash } = this.processField(item, key, fn, processHash);
              if (hash) {
                result[key + 'ByHmac'] = (result[key + 'ByHmac'] || []).concat(hash);
              }
              return processedValue;
            }
            return this.processFields(item, fn, processHash);
          });

          if (processHash && this.piiFields.includes(key)) {
            result[key + 'ByHmac'] = result[key + 'ByHmac'] || value.map(item => {
              if (typeof item === 'string' && item !== '') {
                return this.hashFn(item);
              }
              return this.processFields(item, fn, processHash);
            });
          }
        } else if (typeof value === 'object') {
          result[key] = this.processFields(value, fn, processHash);
        } else if (typeof value === 'string' && this.piiFields.includes(key) && value !== '') {
          const { value: processedValue, hash } = this.processField(value, key, fn, processHash);
          result[key] = processedValue;
          if (hash) {
            result[key + 'ByHmac'] = hash;
          }
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  public decryptPIIFields (obj: any): any {
    return this.processFields(obj, this.decryptFn, false);
  }

  public encryptPIIFields (obj: any): any {
    return this.processFields(obj, this.encryptFn, true);
  }
}

export { Habibi, type EncryptDecryptFunction, type Config };
