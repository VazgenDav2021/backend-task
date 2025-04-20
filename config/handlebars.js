const { engine } = require('express-handlebars');
const path = require('path');

const configureHandlebars = (app) => {
    app.engine(
        'handlebars',
        engine({
            extname: 'handlebars',
            defaultLayout: 'main',
            layoutsDir: path.join(__dirname, '../views/layouts'),
            partialsDir: path.join(__dirname, '../views/partials'),
            helpers: {
                range: function (start, end) {
                    let arr = [];
                    for (let i = start; i <= end; i++) {
                        arr.push(i);
                    }
                    return arr;
                }
            }
        })
    );
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '../views'));
};

module.exports = configureHandlebars;
