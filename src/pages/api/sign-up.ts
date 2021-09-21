import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleClient } from '../../api/google-client';
import { auth, getSpreadsheets } from '../../config/google-sheets';
import { hash } from 'bcryptjs';

interface IUserResponse {
  email: string;
}

interface IUserSignUp {
  email: string;
  name: string;
  password: string;
  code: string;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const sheet = 'Representantes';
  const spreadsheets = await getSpreadsheets();
  const client = new GoogleClient(
    auth,
    spreadsheets,
    process.env.SPREADSHEETID
  );
  const { email, name, password, code }: IUserSignUp = req.body;
  if (code !== process.env.SECURE_CODE) {
    return res.status(400).json('Códe is incorrect');
  }
  const response = await client.findAll<IUserResponse>(sheet);
  const userExists = response.find((user) => {
    return user.email === email;
  });
  if (userExists) {
    return res.status(409).json('Already registered user');
  }
  const passwordHash = await hash(password, 8);
  await client.add(sheet, [name, email, passwordHash]);
  return res.status(200).json({ email, name });
};
