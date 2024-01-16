const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

module.exports = function compile() {
  const source = fs.readFileSync(
    path.resolve(__dirname, './../src/index.html'),
    'utf8',
  );
  const template = Handlebars.compile(source);
  const data = { title: 'My Title' };
  const html = template(data);

  fs.writeFileSync(path.resolve(__dirname, './../src/output.html'), html);
};
