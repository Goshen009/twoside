import argon2 from 'argon2';

class Password {
	static async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }
  
  static async verify(hash: string, password: string) {
  	return await argon2.verify(hash, password);
  }
}

export default Password;