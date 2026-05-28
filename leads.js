// ============================================================
//  RFR CRM — Webhook Receiver
//  Roof & Fence Rejuvenation
//
//  This Vercel serverless function receives the lead data
//  posted by the Roof Rejuvenation Estimator and saves it
//  to your Supabase database.
//
//  Environment variables required in Vercel:
//    SUPABASE_URL         — from Supabase project settings
//    SUPABASE_SERVICE_KEY — service role key (NOT the anon key)
// ============================================================

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {

  // Allow the estimator page to POST here from any domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse body (Vercel parses JSON automatically, but handle string just in case)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Spam guard — reject if honeypot field has a value
    if (body.company) {
      console.log('Spam submission blocked');
      return res.status(200).json({ success: true }); // Return 200 to not tip off bots
    }

    // Map estimator field names → database column names
    const lead = {
      name:                    body.name            || null,
      phone:                   body.phone           || null,
      email:                   body.email           || null,
      preferred_time:          body.preferredTime   || null,
      notes:                   body.notes           || null,
      address:                 body.address         || null,
      zip:                     body.zip             || null,
      in_service_area:         body.inServiceArea   ?? null,
      home_sqft:               body.homeSqft        || null,
      stories:                 body.stories         || null,
      roof_age:                body.roofAge         || null,
      roof_condition:          body.roofCondition   || null,
      roof_pitch:              body.roofPitch       || null,
      roof_complexity:         body.roofComplexity  || null,
      replacement_quote:       body.replacementQuote || null,
      known_issues:            body.knownIssues     || null,
      estimated_roof_area:     body.estimatedRoofArea     || null,
      treatment_range:         body.estimatedTreatmentRange  || null,
      replacement_range:       body.estimatedReplacementRange || null,
      potential_savings:       body.potentialSavings  || null,
      qualification_score:     body.qualificationScore || null,
      hard_stop_reason:        body.hardStopReason    || null,
      lead_priority:           body.leadPriority      || null,
      minimum_project_price:   body.minimumProjectPrice    || null,
      base_rate_per_roof_sqft: body.baseRatePerRoofSqft   || null,
      utm_source:              body.utmSource    || null,
      utm_medium:              body.utmMedium    || null,
      utm_campaign:            body.utmCampaign  || null,
      utm_term:                body.utmTerm      || null,
      utm_content:             body.utmContent   || null,
      source_page:             body.sourcePage   || null,
      user_agent:              body.userAgent    || null,
      lead_source:             body.leadSource   || 'Roof Rejuvenation Estimator',
      business_email:          body.businessEmail || null,
      status:                  'new'
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select('id');

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    const newId = data?.[0]?.id;
    console.log('Lead saved successfully:', newId, '| Priority:', lead.lead_priority, '| Score:', lead.qualification_score);

    return res.status(200).json({ success: true, id: newId });

  } catch (err) {
    console.error('Unexpected error in webhook handler:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
