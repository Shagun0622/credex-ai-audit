// app/api/widget/route.ts
export async function GET() {
  const widgetScript = `
(function() {
  // Create widget container
  const container = document.createElement('div');
  container.id = 'ai-spend-widget';
  container.style.cssText = 'border: 1px solid #e2e0db; border-radius: 12px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px 0; background: white; max-width: 400px;';
  
  container.innerHTML = '<h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight: 600;">💰 AI Spend Audit</h3>' +
    '<p style="color: #666; margin-bottom: 15px; font-size: 14px;">Find savings in your AI tools</p>' +
    '<div style="margin-bottom: 12px;">' +
    '<label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">AI Tool</label>' +
    '<select id="widget-tool" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">' +
    '<option value="cursor">Cursor</option>' +
    '<option value="github-copilot">GitHub Copilot</option>' +
    '<option value="chatgpt">ChatGPT</option>' +
    '<option value="claude">Claude</option>' +
    '</select></div>' +
    '<div style="margin-bottom: 15px;">' +
    '<label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Monthly Spend ($)</label>' +
    '<input type="number" id="widget-spend" placeholder="e.g., 20" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">' +
    '</div>' +
    '<button id="widget-button" style="background: #1a3a6b; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; width: 100%; font-size: 14px; font-weight: 500;">' +
    'Check Savings →</button>' +
    '<div id="widget-results" style="margin-top: 15px; font-size: 14px;"></div>' +
    '<div style="margin-top: 12px; font-size: 11px; color: #999; text-align: center;">🔒 Free • No signup • Instant results</div>';
  
  // Find where to insert
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  currentScript.parentNode.insertBefore(container, currentScript);
  
  
  document.getElementById('widget-button').addEventListener('click', async () => {
    const tool = document.getElementById('widget-tool').value;
    const spend = parseInt(document.getElementById('widget-spend').value) || 0;
    const resultsDiv = document.getElementById('widget-results');
    
    if (!spend || spend <= 0) {
      resultsDiv.innerHTML = '<p style="color: #ef4444;">Please enter a valid monthly spend</p>';
      return;
    }
    
    resultsDiv.innerHTML = '<p style="color: #666;">📊 Analyzing...</p>';
    
    // Calculate savings based on tool
    let savings = 0;
    let recommendation = '';
    
    if (tool === 'cursor' && spend > 20) {
      savings = spend - 20;
      recommendation = 'Switch to Pro plan ($20/mo) to save $' + savings + '/month';
    } else if (tool === 'github-copilot' && spend > 10) {
      savings = spend - 10;
      recommendation = 'Switch to Individual plan ($10/mo) to save $' + savings + '/month';
    } else if (tool === 'chatgpt' && spend > 20) {
      savings = spend - 20;
      recommendation = 'Switch to Plus plan ($20/mo) to save $' + savings + '/month';
    } else {
      recommendation = 'Your ' + tool + ' spending of $' + spend + '/month looks optimized!';
    }
    
    if (savings > 0) {
      resultsDiv.innerHTML = '<div style="background: #d1fae5; padding: 12px; border-radius: 8px;">' +
        '<p style="margin: 0; color: #065f46; font-weight: 500;">✓ Save $' + savings + '/month</p>' +
        '<p style="margin: 5px 0 0 0; font-size: 12px; color: #065f46;">' + recommendation + '</p></div>';
    } else {
      resultsDiv.innerHTML = '<div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">' +
        '<p style="margin: 0; color: #374151;">✓ ' + recommendation + '</p></div>';
    }
  });
})();
  `;
  
  return new Response(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}