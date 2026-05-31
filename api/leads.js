// ============================================================
// RFR CRM — Webhook Receiver
// Roof & Fence Rejuvenation
//
// Environment variables required in Vercel:
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY
//   RESEND_API_KEY
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const NOTIFICATION_TO = 'ray@roofandfencerejuvenation.com';
const NOTIFICATION_FROM = 'Roof & Fence Rejuvenation <onboarding@resend.dev>';

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatValue(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  return escapeHtml(value);
}

function buildEmailHtml(body, lead, newId) {
  const score = lead.qualification_score || 0;
  const priority = lead.lead_priority || 'review';
  const badge = priority === 'hot'
    ? 'HOT LEAD'
    : priority === 'low'
      ? 'Low Priority'
      : 'Needs Review';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fa;margin:0;padding:20px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1)">
    <div style="background:#0b1f3a;padding:24px 28px;color:#fff">
      <div style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:6px">Roof &amp; Fence Rejuvenation</div>
      <div style="font-size:24px;font-weight:900;letter-spacing:-.02em">New Roof Lead — ${badge}</div>
    </div>

    <div style="padding:28px">
      <h2 style="margin:0 0 14px;color:#0b1f3a;font-size:20px">Contact Info</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:22px">
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b;width:38%">Name</td><td style="padding:8px 0;border-bottom:1px solid #edf1f6;font-weight:700">${formatValue(lead.name)}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b">Phone</td><td style="padding:8px 0;border-bottom:1px solid #edf1f6;font-weight:700"><a href="tel:${formatValue(lead.phone, '')}" style="color:#c62828">${formatValue(lead.phone)}</a></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b">Email</td><td style="padding:8px 0;border-bottom:1px solid #edf1f6">${formatValue(lead.email)}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b">Best Time</td><td style="padding:8px 0;border-bottom:1px solid #edf1f6">${formatValue(lead.preferred_time)}</td></tr>
        <tr><td style="padding:8px 0;color:#65758b">Address</td><td style="padding:8px 0">${formatValue(lead.address)}</td></tr>
      </table>

      <div style="background:#f5f7fa;border-radius:10px;padding:16px 18px;margin-bottom:22px">
        <div style="font-weight:900;color:#0b1f3a;font-size:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Roof Details</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:5px 0;color:#65758b;width:42%">Home Size</td><td style="padding:5px 0">${lead.home_sqft ? Number(lead.home_sqft).toLocaleString() + ' sq ft' : '—'} · ${lead.stories ? lead.stories + ' stories' : '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Roof Style</td><td style="padding:5px 0">${formatValue(body.roofStyle || lead.roof_style)}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Sections</td><td style="padding:5px 0">${formatValue(body.roofSections || lead.roof_sections)}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Features</td><td style="padding:5px 0">${formatValue(body.roofFeatures || lead.roof_features, 'none')}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Age</td><td style="padding:5px 0">${formatValue(lead.roof_age)}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Condition</td><td style="padding:5px 0">${formatValue(lead.roof_condition)}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Pitch</td><td style="padding:5px 0">${formatValue(lead.roof_pitch)}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Known Issues</td><td style="padding:5px 0">${formatValue(lead.known_issues)}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b">Estimated Roof Area</td><td style="padding:5px 0">${lead.estimated_roof_area ? Number(lead.estimated_roof_area).toLocaleString() + ' sq ft' : '—'}</td></tr>
        </table>
      </div>

      <div style="display:flex;gap:12px;margin-bottom:22px">
        <div style="flex:1;background:#fff7f7;border:1px solid rgba(198,40,40,.2);border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:800;color:#c62828;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Treatment Range</div>
          <div style="font-size:20px;font-weight:900;color:#0b1f3a">${formatValue(lead.treatment_range)}</div>
        </div>
        <div style="flex:1;background:#f5f7fa;border:1px solid #dde3ed;border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:800;color:#65758b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Score</div>
          <div style="font-size:20px;font-weight:900;color:#0b1f3a">${score}/100</div>
        </div>
      </div>

      ${lead.notes ? `<div style="background:#fffdf0;border:1px solid #e8e0a0;border-radius:10px;padding:14px 16px;margin-bottom:22px;color:#5a4f00"><strong>Customer notes:</strong> ${formatValue(lead.notes)}</div>` : ''}

      <a href="https://rfr-crm.vercel.app" style="display:block;text-align:center;background:#c62828;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:900;font-size:15px">Open in CRM</a>
    </div>

    <div style="padding:16px 28px;background:#f5f7fa;font-size:11px;color:#9aafcc;text-align:center">
      Roof &amp; Fence Rejuvenation · Lead ID: ${formatValue(newId, 'pending')}
    </div>
  </div>
</body>
</html>`;
}

async function sendLeadEmail(body, lead, newId) {
  if (!process.env.RESEND_API_KEY) {
    console.log('RESEND_API_KEY missing. Email not sent.');
    return;
  }

  const priority = lead.lead_priority || 'review';
  const subject = priority === 'hot'
    ? `Hot Lead - ${lead.name || 'New submission'} - ${lead.address || ''}`
    : `New Roof Lead - ${lead.name || 'New submission'} - ${lead.address || ''}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: NOTIFICATION_FROM,
      to: [NOTIFICATION_TO],
      subject,
      html: buildEmailHtml(body, lead, newId)
    })
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Resend failed: ${response.status} ${responseText}`);
  }

  console.log('Notification email sent for lead:', newId);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (body.company) {
      console.log('Spam submission blocked');
      return res.status(200).json({ success: true });
    }

    const lead = {
      name:                    body.name || null,
      phone:                   body.phone || null,
      email:                   body.email || null,
      preferred_time:          body.preferredTime || null,
      notes:                   body.notes || null,
      address:                 body.address || null,
      zip:                     body.zip || null,
      in_service_area:         body.inServiceArea ?? null,
      normalized_address:      body.normalizedAddress || null,
      property_lat:            body.propertyLat ?? null,
      property_lng:            body.propertyLng ?? null,
      building_footprint_sqft: body.buildingFootprintSqft ?? null,
      property_data_source:    body.propertyDataSource || 'manual',
      home_sqft:               body.homeSqft || null,
      stories:                 body.stories || null,
      roof_age:                body.roofAge || null,
      roof_condition:          body.roofCondition || null,
      roof_pitch:              body.roofPitch || null,
      roof_complexity:         body.roofComplexity || null,
      roof_style:              body.roofStyle || null,
      roof_sections:           body.roofSections || null,
      roof_features:           body.roofFeatures || null,
      replacement_quote:       body.replacementQuote || null,
      known_issues:            body.knownIssues || null,
      estimated_roof_area:     body.estimatedRoofArea || null,
      treatment_range:         body.estimatedTreatmentRange || null,
      replacement_range:       body.estimatedReplacementRange || null,
      potential_savings:       body.potentialSavings || null,
      qualification_score:     body.qualificationScore || null,
      hard_stop_reason:        body.hardStopReason || null,
      lead_priority:           body.leadPriority || null,
      minimum_project_price:   body.minimumProjectPrice || null,
      base_rate_per_roof_sqft: body.baseRatePerRoofSqft || null,
      utm_source:              body.utmSource || null,
      utm_medium:              body.utmMedium || null,
      utm_campaign:            body.utmCampaign || null,
      utm_term:                body.utmTerm || null,
      utm_content:             body.utmContent || null,
      source_page:             body.sourcePage || null,
      user_agent:              body.userAgent || null,
      lead_source:             body.leadSource || 'Roof Rejuvenation Estimator',
      business_email:          body.businessEmail || null,
      status:                  'new'
    };

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

    try {
      await sendLeadEmail(body, lead, newId);
    } catch (mailErr) {
      console.error('Email notification failed:', mailErr.message);
    }

    return res.status(200).json({ success: true, id: newId });
  } catch (err) {
    console.error('Unexpected error in webhook handler:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
