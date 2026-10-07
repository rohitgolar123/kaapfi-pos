// Runs before every build. Stamps the build so the POS can show "Update available: <name>" instead of reloading by itself.
// To name a release, edit "version" and "releaseName" in package.json before deploying.
const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const builtAt = new Date().toISOString();
const when = new Date(Date.now() + 330 * 60000).toISOString(); // IST
const [, m, d] = when.slice(0, 10).split('-');
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const info = {
  version: pkg.version,
  name: pkg.releaseName || '',
  builtAt,
  label: `v${pkg.version}${pkg.releaseName ? ' — ' + pkg.releaseName : ''} (${Number(d)} ${months[Number(m) - 1]}, ${when.slice(11, 16)})`,
};
const json = JSON.stringify(info, null, 2) + '\n';
fs.writeFileSync(path.join(__dirname, '../src/buildInfo.json'), json);
fs.writeFileSync(path.join(__dirname, '../public/version.json'), json);
console.log('Build stamped:', info.label);
