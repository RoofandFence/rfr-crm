// ============================================================
//  RFR CRM — Webhook Receiver + Email Notifications
//  Roof & Fence Rejuvenation
//
//  Environment variables required in Vercel:
//    SUPABASE_URL         — from Supabase project settings
//    SUPABASE_SERVICE_KEY — service role key (NOT the anon key)
//    RESEND_API_KEY       — from resend.com
// ============================================================

const { createClient } = require('@supabase/supabase-js');

// ── Email sender via Resend ──────────────────────────────────
async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Roof and Fence Rejuvenation <noreply@roofandfencerejuvenation.com>',
      to,
      subject,
      html
    })
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Resend error:', err);
  }
}

// ── Internal alert email to Ray ──────────────────────────────
function buildInternalEmail(body, lead, newId) {
  const priority = body.leadPriority || 'low';
  const priorityColor = priority === 'hot' ? '#c62828' : priority === 'review' ? '#92400e' : '#374151';
  const priorityBg    = priority === 'hot' ? '#fff0f0' : priority === 'review' ? '#fffbeb' : '#f3f4f6';

  return `
    <div style="font-family:Inter,ui-sans-serif,system-ui,sans-serif;max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0b1f3a,#132f55);padding:28px 32px;color:#fff">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.6);margin-bottom:6px">New Lead — Roof &amp; Fence Rejuvenation</div>
        <div style="font-size:26px;font-weight:900;letter-spacing:-.03em">${body.name || 'Unknown'}</div>
        <div style="margin-top:10px">
          <span style="display:inline-block;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;background:${priorityBg};color:${priorityColor}">${priority.toUpperCase()} PRIORITY</span>
        </div>
      </div>

      <!-- Contact -->
      <div style="padding:24px 32px;border-bottom:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:12px">Contact</div>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:120px">Phone</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px"><a href="tel:${body.phone}" style="color:#0b1f3a;text-decoration:none">${body.phone || '—'}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Email</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px"><a href="mailto:${body.email}" style="color:#0b1f3a;text-decoration:none">${body.email || '—'}</a></td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Best time</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.preferredTime || '—'}</td>
          </tr>
        </table>
      </div>

      <!-- Property -->
      <div style="padding:24px 32px;border-bottom:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:12px">Property</div>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:120px">Address</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.address || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">City</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.city || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">ZIP</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.zip || '—'}</td>
          </tr>
        </table>
      </div>

      <!-- Estimate -->
      <div style="padding:24px 32px;border-bottom:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:12px">Preliminary Estimate</div>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:160px">Roof area (est.)</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.estimatedRoofArea ? body.estimatedRoofArea.toLocaleString() + ' sq ft' : '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Treatment range</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.estimatedTreatmentRange || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Replacement range</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.estimatedReplacementRange || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Potential savings</td>
            <td style="padding:6px 0;font-weight:700;font-size:14px;color:#166534">${body.potentialSavings || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Qualification score</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.qualificationScore ?? '—'} / 100</td>
          </tr>
        </table>
      </div>

      <!-- Roof Details -->
      <div style="padding:24px 32px;border-bottom:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:12px">Roof Details</div>
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:160px">Age</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.roofAge || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Condition</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.roofCondition || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Pitch</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.roofPitch || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Style</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.roofStyle || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Sections</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.roofSections || '—'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Features</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.roofFeatures || 'none'}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Known issues</td>
            <td style="padding:6px 0;font-weight:600;font-size:14px">${body.knownIssues || '—'}</td>
          </tr>
        </table>
      </div>

      ${body.notes ? `
      <!-- Customer Notes -->
      <div style="padding:24px 32px;border-bottom:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#64748b;margin-bottom:12px">Customer Notes</div>
        <div style="font-size:14px;color:#0f172a;line-height:1.6;background:#f5f7fa;border-radius:10px;padding:14px 16px">${body.notes}</div>
      </div>` : ''}

      <!-- Footer -->
      <div style="padding:20px 32px;background:#f5f7fa;text-align:center">
        <div style="font-size:12px;color:#94a3b8">Lead ID: ${newId || '—'} &nbsp;·&nbsp; Roof and Fence Rejuvenation CRM</div>
      </div>

    </div>
  `;
}

// ── Customer confirmation email ──────────────────────────────
function buildCustomerEmail(name) {
  const firstName = (name || '').split(' ')[0] || 'there';
  return `
    <div style="font-family:Inter,ui-sans-serif,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0b1f3a,#132f55);padding:32px;color:#fff;text-align:center">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.6);margin-bottom:10px">Roof &amp; Fence Rejuvenation</div>
        <div style="font-size:28px;font-weight:900;letter-spacing:-.03em;line-height:1.1">We received your<br>roof information.</div>
      </div>

      <!-- Body -->
      <div style="padding:32px">
        <p style="font-size:16px;color:#0f172a;margin:0 0 18px">Hi ${firstName},</p>
        <p style="font-size:15px;color:#334155;line-height:1.7;margin:0 0 18px">
          Thank you — your preliminary roof information has been received. A member of our team will review your details and reach out within 1 business day. Not every roof qualifies for rejuvenation, and we'll give you a clear recommendation either way.
        </p>
        <div style="background:#f5f7fa;border-left:4px solid #c62828;border-radius:0 10px 10px 0;padding:16px 18px;margin:24px 0">
          <div style="font-size:13px;font-weight:700;color:#0b1f3a;margin-bottom:4px">What happens next</div>
          <div style="font-size:14px;color:#475569;line-height:1.6">We'll review your roof details, confirm whether rejuvenation is a practical option for your property, and follow up with a specific recommendation.</div>
        </div>
        <p style="font-size:14px;color:#64748b;margin:0">Questions in the meantime? Reply to this email or call us directly.</p>
      </div>

      <!-- Footer -->
      <div style="padding:20px 32px;background:#f5f7fa;text-align:center;border-top:1px solid #e2e8f0">
        <div style="font-size:12px;color:#94a3b8">Roof and Fence Rejuvenation &nbsp;·&nbsp; roofandfencerejuvenation.com</div>
      </div>

    </div>
  `;
}

// ── Main handler ─────────────────────────────────────────────
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

    // ── Send emails (non-blocking — lead is already saved) ──
    const emailPromises = [];

    // 1. Internal alert to Ray
    emailPromises.push(
      sendEmail({
        to:      'ray@roofandfencerejuvenation.com',
        subject: `New ${body.leadPriority || 'lead'} — ${body.name || 'Unknown'} · ${body.city || body.zip || 'No location'}`,
        html:    buildInternalEmail(body, lead, newId)
      })
    );

    // 2. Customer confirmation (only if they gave an email)
    if (body.email) {
      emailPromises.push(
        sendEmail({
          to:      body.email,
          subject: 'We received your roof information — Roof and Fence Rejuvenation',
          html:    buildCustomerEmail(body.name)
        })
      );
    }

    await Promise.allSettled(emailPromises);

    return res.status(200).json({ success: true, id: newId });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
