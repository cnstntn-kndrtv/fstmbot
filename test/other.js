let Plugin = require('../lib/bot/Plugin');

class Bot {
    constructor(){
        this.plugins = {};
    }

    addPlugins(plugins, type) {
        if(type && !this.plugins.hasOwnProperty(type)) this.plugins[type] = {};
        for (var p in plugins) {
            if(type) {
                this.plugins[type][p] = new Plugin(this, plugins[p])
            }
            else this.plugins[p] = new Plugin(this, plugins[p]);
        }
    }
}

let bot = new Bot();
let int = {
    something: () => {
        console.log('!something');
    }
}


let ext = require('../plugins');

bot.addPlugins(int);
bot.addPlugins(ext);

let plugs = {

}

plugs.p = new Plugin(null, ext.test);
plugs.p.execute('1');

