import fs from 'fs';
import csc from 'csv-parser';
import crypto from 'crypto';
import VoterToken from '../model/voterTokenModel';

interface VoterRow {
  email: string;
  name?: string;
  electionId: string;
}

const generateTokenHash = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const importVotersFromCSV = async (
  filePath: string,
  electionId: string
): Promise<{ success: number; errors: string[] }> => {
  const errors: string[] = [];
  let success = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csc())
      .on('data', async (row: VoterRow) => {
        try {
          if (!row.email) {
            errors.push(`Row missing email: ${JSON.stringify(row)}`);
            return;
          }

          //Validate email format
          if (!row.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push(`Invalid email: ${row.email}`);
            return;
          }

          await VoterToken.create({
            email: row.email.toLowerCase(),
            electionId,
            tokenHash: generateTokenHash(),
            used: false,
          });
          success++;
        } catch (err: any) {
          errors.push(`Error processing ${row.email}: ${err.message}`);
        }
      })
      .on('end', () => {
        fs.unlinkSync(filePath); // Delete temp file
        resolve({ success, errors });
      })
      .on('error', reject);
  });
};
