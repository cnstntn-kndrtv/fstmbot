//@ts-check

module.exports = class Spinner {
    constructor() {
        this.spinChars = ['🚦', '🚥'];
        this.spinNextIndex = 0;
        this._counter = 0;
    }

    spin(counter, ...msg) {
        counter = (counter) ? counter : ++ this._counter;
        this.singleLineConsoleLog(this.spinChars[this.spinNextIndex++], counter, msg);
        this.spinNextIndex = (this.spinNextIndex == this.spinChars.length) ? 0 : this.spinNextIndex;
    }

    singleLineConsoleLog(...msg) {
        let str = ``;
        if (msg.length > 1) {
            for (let i = 0; i < msg.length; i++) {
                str += `${msg[i]} `;
            }
        } else str = msg[0];
        process.stdout.write(`\r${str}`);
    }
}