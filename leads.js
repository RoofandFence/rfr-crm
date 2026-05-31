// ============================================================
//  RFR CRM — Webhook Receiver
//  Roof & Fence Rejuvenation
//
//  Environment variables required in Vercel:
//    SUPABASE_URL         — from Supabase project settings
//    SUPABASE_SERVICE_KEY — service role key (NOT the anon key)
// ============================================================

const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (body.company) return res.status(200).json({ success: true });

    const lead = {
      name:                    body.name              || null,
      phone:                   body.phone             || null,
      email:                   body.email             || null,
      preferred_time:          body.preferredTime     || null,
      notes:                   body.notes             || null,
      address:                 body.address           || null,
      city:                    body.city              || null,
      zip:                     body.zip               || null,
      normalized_address:      body.normalizedAddress || null,
      property_lat:            body.propertyLat       ?? null,
      property_lng:            body.propertyLng       ?? null,
      building_footprint_sqft: body.buildingFootprintSqft ?? null,
      property_data_source:    body.propertyDataSource || 'manual',
      home_sqft:               body.homeSqft          || null,
      stories:                 body.stories           || null,
      roof_age:                body.roofAge           || null,
      roof_condition:          body.roofCondition     || null,
      roof_pitch:              body.roofPitch         || null,
      roof_style:              body.roofStyle         || null,
      roof_sections:           body.roofSections      || null,
      roof_features:           body.roofFeatures      || null,
      replacement_quote:       body.replacementQuote  || null,
      known_issues:            body.knownIssues       || null,
      estimated_roof_area:     body.estimatedRoofArea || null,
      treatment_range:         body.estimatedTreatmentRange   || null,
      replacement_range:       body.estimatedReplacementRange || null,
      potential_savings:       body.potentialSavings  || null,
      qualification_score:     body.qualificationScore || null,
      lead_priority:           body.leadPriority      || null,
      utm_source:              body.utmSource         || null,
      utm_medium:              body.utmMedium         || null,
      utm_campaign:            body.utmCampaign       || null,
      source_page:             body.sourcePage        || null,
      lead_source:             body.leadSource        || 'Roof Rejuvenation Estimator',
      status:                  'new'
    };

    const { data, error } = await supabase.from('leads').insert(lead).select('id');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    const newId = data?.[0]?.id;
    console.log('Lead saved successfully:', newId);

    return res.status(200).json({ success: true, id: newId });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
