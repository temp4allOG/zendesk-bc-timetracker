const fs = require('fs');
for (const f of ['manifest.json','assets/iframe.html','src/App.jsx','src/services/businessCentralService.js','src/services/zendeskService.js','webpack.config.prod.js']) {
  if (!fs.existsSync(f)) throw new Error('Missing ' + f);
}
const m = JSON.parse(fs.readFileSync('manifest.json','utf8'));
if (!m.location.support.ticket_sidebar) throw new Error('missing ticket sidebar');
if (!m.parameters.find(p => p.name === 'bc_password' && p.secure)) throw new Error('password must be secure');
const bc = fs.readFileSync('src/services/businessCentralService.js','utf8');
if (!bc.includes('encodeURIComponent')) throw new Error('Business Central URL segments must be encoded');
if (!bc.includes('assertSettings')) throw new Error('settings validation missing');
const app = fs.readFileSync('src/App.jsx','utf8');
if (!app.includes('No Business Central employee matched')) throw new Error('employee match error handling missing');
console.log('Validation passed');
