import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

// Configure for static export
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Read the metadata file
    const metadataPath = join(process.cwd(), 'src', 'components', 'ui', '_metadata.json');
    const metadataContent = readFileSync(metadataPath, 'utf8');
    
    // Generate SHA-256 hash of the metadata content
    const hash = createHash('sha256');
    hash.update(metadataContent);
    const provenanceHash = hash.digest('hex');
    
    return NextResponse.json({
      provenanceHash,
      timestamp: new Date().toISOString(),
      fileSize: metadataContent.length,
      status: 'verified'
    });
  } catch (error) {
    console.error('Error reading metadata file:', error);
    
    // Return fallback hash if file reading fails
    return NextResponse.json({
      provenanceHash: "87a57cb882d4a2dbc0b539e5fe9237eee6ebdf912633720e03ec3fc99f7f27ee",
      timestamp: new Date().toISOString(),
      fileSize: 0,
      status: 'fallback',
      error: 'Failed to read metadata file'
    });
  }
}