// ============================================================
//  RFR CRM — Webhook Receiver
//  Roof & Fence Rejuvenation
//
//  Environment variables required in Vercel:
//    SUPABASE_URL         — from Supabase project settings
//    SUPABASE_SERVICE_KEY — service role key (NOT the anon key)
//    IONOS_EMAIL          — ray@roofandfencerejuvenation.com
//    IONOS_EMAIL_PASSWORD — your IONOS email password
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const nodemailer        = require('nodemailer');

// ── IONOS SMTP transporter ──
function createMailer() {
  return nodemailer.createTransport({
    host:   'smtp.ionos.com',
    port:   587,
    secure: false,
    auth: {
      user: process.env.IONOS_EMAIL,
      pass: process.env.IONOS_EMAIL_PASSWORD
    }
  });
}

// ── Format a notification email ──
function buildEmailHtml(body, lead, newId) {
  const score    = lead.qualification_score || 0;
  const priority = lead.lead_priority || 'review';
  const badge    = priority === 'hot'  ? '🔥 HOT LEAD'
                 : priority === 'low'  ? '❄️ Low priority'
                 : '📋 Needs review';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fa;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.1)">

    <!-- Header -->
    <div style="background:#0b1f3a;padding:24px 28px;color:#fff">
      <div style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:6px">Roof &amp; Fence Rejuvenation</div>
      <div style="font-size:22px;font-weight:900;letter-spacing:-.02em">New Roof Lead — ${badge}</div>
    </div>

    <!-- Body -->
    <div style="padding:28px">

      <!-- Contact -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b;font-size:13px;width:38%">Name</td>
            <td style="padding:8px 0;border-bottom:1px solid #edf1f6;font-weight:700">${lead.name || '—'}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b;font-size:13px">Phone</td>
            <td style="padding:8px 0;border-bottom:1px solid #edf1f6;font-weight:700">
              <a href="tel:${lead.phone}" style="color:#c62828">${lead.phone || '—'}</a></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b;font-size:13px">Email</td>
            <td style="padding:8px 0;border-bottom:1px solid #edf1f6">${lead.email || '—'}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid #edf1f6;color:#65758b;font-size:13px">Best time</td>
            <td style="padding:8px 0;border-bottom:1px solid #edf1f6">${lead.preferred_time || '—'}</td></tr>
        <tr><td style="padding:8px 0;color:#65758b;font-size:13px">Address</td>
            <td style="padding:8px 0">${lead.address || '—'}</td></tr>
      </table>

      <!-- Roof Details -->
      <div style="background:#f5f7fa;border-radius:10px;padding:16px 18px;margin-bottom:20px">
        <div style="font-weight:900;color:#0b1f3a;font-size:14px;margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Roof Details</div>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px;width:42%">Home size</td>
              <td style="padding:5px 0;font-size:13px">${lead.home_sqft ? lead.home_sqft.toLocaleString() + ' sq ft' : '—'} · ${lead.stories ? lead.stories + ' stor' + (lead.stories === 1 ? 'y' : 'ies') : '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Roof style</td>
              <td style="padding:5px 0;font-size:13px">${body.roofStyle || '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Sections</td>
              <td style="padding:5px 0;font-size:13px">${body.roofSections || '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Features</td>
              <td style="padding:5px 0;font-size:13px">${body.roofFeatures || 'none'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Age</td>
              <td style="padding:5px 0;font-size:13px">${lead.roof_age || '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Condition</td>
              <td style="padding:5px 0;font-size:13px">${lead.roof_condition || '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Pitch</td>
              <td style="padding:5px 0;font-size:13px">${lead.roof_pitch || '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Est. roof area</td>
              <td style="padding:5px 0;font-size:13px">${lead.estimated_roof_area ? lead.estimated_roof_area.toLocaleString() + ' sq ft' : '—'}</td></tr>
          <tr><td style="padding:5px 0;color:#65758b;font-size:13px">Known issues</td>
              <td style="padding:5px 0;font-size:13px">${lead.known_issues || '—'}</td></tr>
        </table>
      </div>

      <!-- Estimate -->
      <div style="display:flex;gap:12px;margin-bottom:20px">
        <div style="flex:1;background:#fff7f7;border:1px solid rgba(198,40,40,.2);border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:800;color:#c62828;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Treatment Range</div>
          <div style="font-size:20px;font-weight:900;color:#0b1f3a">${lead.treatment_range || '—'}</div>
        </div>
        <div style="flex:1;background:#f5f7fa;border:1px solid #dde3ed;border-radius:10px;padding:14px 16px">
          <div style="font-size:11px;font-weight:800;color:#65758b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Qualification Score</div>
          <div style="font-size:20px;font-weight:900;color:#0b1f3a">${score}/100</div>
        </div>
      </div>

      ${lead.notes ? `<div style="background:#fffdf0;border:1px solid #e8e0a0;border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;color:#5a4f00"><strong>Customer notes:</strong> ${lead.notes}</div>` : ''}

      <!-- CTA -->
      <a href="https://rfr-crm.vercel.app" style="display:block;text-align:center;background:#c62828;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:900;font-size:15px">
        Open in CRM →
      </a>
    </div>

    <div style="padding:16px 28px;background:#f5f7fa;font-size:11px;color:#9aafcc;text-align:center">
      Roof &amp; Fence Rejuvenation · Lead ID: ${newId || 'pending'}
    </div>
  </div>
</body>
</html>`;
}

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
      address:                 body.address              || null,
      zip:                     body.zip                  || null,
      in_service_area:         body.inServiceArea        ?? null,
      normalized_address:      body.normalizedAddress    || null,
      property_lat:            body.propertyLat          ?? null,
      property_lng:            body.propertyLng          ?? null,
      building_footprint_sqft: body.buildingFootprintSqft ?? null,
      property_data_source:    body.propertyDataSource   || 'manual',
      home_sqft:               body.homeSqft        || null,
      stories:                 body.stories         || null,
      roof_age:                body.roofAge         || null,
      roof_condition:          body.roofCondition   || null,
      roof_pitch:              body.roofPitch       || null,
      roof_style:              body.roofStyle       || null,
      roof_sections:           body.roofSections    || null,
      roof_features:           body.roofFeatures    || null,
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

    // ── Send email notification via IONOS ──
    if (process.env.IONOS_EMAIL && process.env.IONOS_EMAIL_PASSWORD) {
      try {
        const mailer   = createMailer();
        const priority = lead.lead_priority || 'review';
        const subject  = priority === 'hot'
          ? `🔥 Hot Lead — ${lead.name || 'New submission'} · ${lead.address || ''}`
          : `New Roof Lead — ${lead.name || 'New submission'} · ${lead.address || ''}`;

        await mailer.sendMail({
          from:    `"RFR Lead Alert" <${process.env.IONOS_EMAIL}>`,
          to:      process.env.IONOS_EMAIL,   // sends to itself; IONOS forwards to your windows email
          subject,
          html:    buildEmailHtml(body, lead, newId)
        });
        console.log('Notification email sent for lead:', newId);
      } catch (mailErr) {
        // Email failure should not block lead save — just log it
        console.error('Email notification failed:', mailErr.message);
      }
    }

    return res.status(200).json({ success: true, id: newId });

  } catch (err) {
    console.error('Unexpected error in webhook handler:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
