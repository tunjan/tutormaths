const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase URL or service role key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Emptying and deleting 'annotations' bucket...");
  
  // 1. List files in backgrounds/ and exports/
  const pathsToDelete = [];
  
  const { data: bgFiles, error: bgError } = await supabase.storage.from('annotations').list('backgrounds', { limit: 100 });
  if (bgFiles) {
    bgFiles.forEach(f => pathsToDelete.push(`backgrounds/${f.name}`));
  }
  
  const { data: expFiles, error: expError } = await supabase.storage.from('annotations').list('exports', { limit: 100 });
  if (expFiles) {
    expFiles.forEach(f => pathsToDelete.push(`exports/${f.name}`));
  }
  
  // Also try listing root
  const { data: rootFiles, error: rootError } = await supabase.storage.from('annotations').list('', { limit: 100 });
  if (rootFiles) {
    rootFiles.forEach(f => {
      if (f.name !== 'backgrounds' && f.name !== 'exports') {
        pathsToDelete.push(f.name);
      }
    });
  }

  if (pathsToDelete.length > 0) {
    console.log(`Found ${pathsToDelete.length} files. Deleting them...`);
    const { error: deleteFilesError } = await supabase.storage.from('annotations').remove(pathsToDelete);
    if (deleteFilesError) {
      console.error("Error deleting files:", deleteFilesError);
    }
  }

  // 2. Delete the bucket
  const { error: deleteBucketError } = await supabase.storage.deleteBucket('annotations');
  if (deleteBucketError) {
    console.error("Error deleting bucket:", deleteBucketError.message);
  } else {
    console.log("Bucket 'annotations' successfully deleted!");
  }
}

run();
