# A simple online URL path based text editor
Any url path can be inserted in the initial page, like `foo/bar` and it will be used as path key to store text data in MongoDB database.
To keep user's privacy and texts security, AES encryption was applyed over the text data and SHA256 hex encryption over the path, check [Encryption](#encryption) section below.

## Encryption
To keep user's data secure, an encryption method was used, so any raw text is stored.
The back-end has it owns `secret_key` and combines it with `url path` as EncryptionIV when encrypting data.
As the `url path` is also stored encrypted by SHA256 HEX, even software owners or admins won't have access to any raw text or to the user's choosen url path, as only `secret_key` alone can't decrypt text and the stored `url path` is encrypted in a way that it can't be decrypted.

The following diagram shows how the encryption method works
![image](https://github.com/user-attachments/assets/06b885a3-c2c5-4286-bf27-862916c8fc88)

## Project Preview
You can access the project preview by clicking [here](https://online-text-editor-sigma.vercel.app/)
