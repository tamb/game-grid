const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

function compile() {
  const source = fs.readFileSync(
    path.resolve(__dirname, './../src/index.html'),
    'utf8',
  );
  registerAllPartials();
  const template = Handlebars.compile(source);
  const html = template();

  fs.writeFileSync(path.resolve(__dirname, './../src/output.html'), html);
};

function registerAllPartials() {
  const partialsDir = path.resolve(__dirname, './../src/partials');
  const filenames = fs.readdirSync(partialsDir);

  filenames.forEach(function (filename) {
    const matches = /^([^.]+).hbs$/.exec(filename);
    if (!matches) {
      return;
    }
    const name = matches[1];
    const template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
    Handlebars.registerPartial(name, template);
  });
}

compile();
