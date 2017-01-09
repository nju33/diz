const meow = require('meow');

const proc = {
  id: require('./id'),
  date: require('./date')
};

const cli = meow('', {});

switch (cli.input[0]) {
  case 'generate': {
    generate(cli.input[1]);
    return;
  }
  default: {
    console.log(cli.help);
  }
}

function generate(arg) {
  switch (arg) {
    case 'id': {
      proc.id();
      return;
    }
    case 'date': {
      proc.date();
      return;
    }
    default: {
      return;
    }
  }
}
