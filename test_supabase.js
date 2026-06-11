import { createClient } from '@supabase/supabase-js';

const url = "https://hvnincnoslauqzkvelae.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bmluY25vc2xhdXF6a3ZlbGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTk4NTQsImV4cCI6MjA4NjMzNTg1NH0.CIbnp34k3jaNtOiV2wfcLH8EW-Q4wFU9q2TqiP_6MdY";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2bmluY25vc2xhdXF6a3ZlbGFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDc1OTg1NCwiZXhwIjoyMDg2MzM1ODU0fQ.ewKYl3cxGP1Lh7FR0rF-RTRjp3zueOjB4E6Gqd0Q45A";

const anonClient = createClient(url, anonKey);
const serviceClient = createClient(url, serviceKey);

async function run() {
  console.log("Testing Anon Key...");
  let res = await anonClient.from('withdraw_message_templates').select('*');
  console.log("Anon Res:", res.data, res.error);
  
  console.log("Testing Service Key...");
  res = await serviceClient.from('withdraw_message_templates').select('*');
  console.log("Service Res:", res.data, res.error);
}

run();
