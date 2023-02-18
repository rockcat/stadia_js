class StadiaController {
        
    STADIA_VID = 0x18D1
    STADIA_PID = 0x9400

    STATUS_LEN = 10
    status = [0,0,0,0,0,0,0,0,0,0]

    // controls
    STATUS_DPAD = 0
    STATUS_MENU = 1
    STATUS_ABXY = 2
    STATUS_LANAX = 3
    STATUS_LANAY = 4
    STATUS_RANAX = 5
    STATUS_RANAY = 6
    STATUS_LTRIG = 7
    STATUS_RTRIG = 8
    STATUS_EXTRA = 9

    // DPad
    DBITS       = 0x0F
    DUP         = 0x00
    DUPRIGHT    = 0x01
    DRIGHT      = 0x02
    DRIGHTDOWN  = 0x03
    DDOWN       = 0x04
    DDOWNLEFT   = 0x05
    DLEFT       = 0x06
    DLEFTUP     = 0x07
    DNOTHING    = 0x08

    // Right analogue - clicked = status[menu] & 0x80
    RANACLK     = 0x80
    // Menu buttons
    DOTDOTDOT   = 0x40
    MENU        = 0x20
    STADIA      = 0x10
    RTRIG       = 0x08
    LTRIG       = 0x04
    ASSIST      = 0x02
    SQUARE      = 0x01

    ABUT        = 0x40
    BBUT        = 0x20
    XBUT        = 0x10
    YBUT        = 0x08
    LBUT        = 0x04
    RBUT        = 0x02
    // Left analogue - clicked = status[ABXY] & 0x01
    LANACLK     = 0x01

    constructor() {
        this.removeConnection()
    }

    removeConnection() {
        this.connected = false
        this.device = undefined

    }

    async connect(changedCallback) {
        if (!this.connected) {
            const devices = await navigator.hid.requestDevice({ filters: [
                {vendorId: this.STADIA_VID, productId: this.STADIA_PID}
            ]})
            if (devices[0]) {
                this.device = devices[0]
                try {
                    await this.device.open()
                    this.connected = true
                    this.device.oninputreport = this.inputReport.bind(this)
                    this.setChanged(changedCallback)
                    navigator.hid.addEventListener('disconnect', this.disconnected)
                } catch (e) {
                    console.log(e)
                    this.removeConnection()
                }
            }
        }
        return this.connected
    }

    disconnected(event) {
        if (event.device.productId == this.STADIA_PID) {
            this.connected = false
            this.device = undefined
        }
    }

    setChanged(changedCallback) {
        this.changedCallback = changedCallback
    }

    dPadStatus() {
        const dStatus = this.status[this.STATUS_DPAD] & this.DBITS
        return {
            dup:    (dStatus == this.DUP) || (dStatus == this.DUPRIGHT) || (dStatus == this.DLEFTUP),
            dright: (dStatus == this.DRIGHT) || (dStatus == this.DUPRIGHT) || (dStatus == this.DRIGHTDOWN),
            ddown:  (dStatus == this.DDOWN) || (dStatus == this.DDOWNLEFT) || (dStatus == this.DRIGHTDOWN),
            dleft:  (dStatus == this.DLEFT) || (dStatus == this.DDOWNLEFT) || (dStatus == this.DLEFTUP),
        }
    }

    menuStatus() {
        const menuStatus = this.status[this.STATUS_MENU]
        return {
            dots:   ((menuStatus & this.DOTDOTDOT) != 0),
            menu:   ((menuStatus & this.MENU) != 0),
            stadia: ((menuStatus & this.STADIA) != 0),
            rTrig:  ((menuStatus & this.RTRIG) != 0),
            lTrig:  ((menuStatus & this.LTRIG) != 0),
            assist: ((menuStatus & this.ASSIST) != 0),
            square: ((menuStatus & this.SQUARE) != 0)
        }
    }

    buttonStatus() {
        const buttons = this.status[this.STATUS_ABXY]
        return {
            a:      ((buttons & this.ABUT) != 0),
            b:      ((buttons & this.BBUT) != 0),
            x:      ((buttons & this.XBUT) != 0),
            y:      ((buttons & this.YBUT) != 0),
            left:   ((buttons & this.LBUT) != 0),
            right:  ((buttons & this.RBUT) != 0),
        }
    }

    triggers() {
        return {
            left: this.status[this.STATUS_LTRIG],
            right: this.status[this.STATUS_RTRIG]
        }
    }

    leftAnalogue() {
        return {
            x:      this.status[this.STATUS_LANAX],
            y:      this.status[this.STATUS_LANAY],
            pressed: ((this.status[this.STATUS_ABXY] & this.LANACLK) != 0)
        }
    }

    rightAnalogue() {
        return {
            x:      this.status[this.STATUS_RANAX],
            y:      this.status[this.STATUS_RANAY],
            pressed: ((this.status[this.STATUS_MENU] & this.RANACLK) != 0)
        }
    }

    statusObject() {
        return {
            raw: this.status,
            dpad: this.dPadStatus(),
            menu: this.menuStatus(),
            left: this.leftAnalogue(),
            right: this.rightAnalogue(),
            buttons: this.buttonStatus(),
            triggers: this.triggers()
        }
    }

    inputReport (event) {
        const { data, device, reportId } = event;

        for(let i=0; i < this.STATUS_LEN; i++) {
            this.status[i] = data.getUint8(i)
        }

        if (this.changedCallback) {
            this.changedCallback(this.statusObject())
        }

    }

    toBinary (num, size=8) {
        return num.toString(2).padStart(size,0)
    }

    // Helper to display raw data
    statusTable () {
        var out = `
            <table>
                <tr>
                    <td>DPad</td><td>Menu</td><td>&nbsp;ABXYLR</td><td>LAX</td><td>LAY</td><td>RAX</td><td>RAY</td><td>LT</td><td>RT</td>
                </tr>
                <tr>`
        out += '<td>' + this.toBinary(this.status[0]) + '</td>'
        out += '<td>' + this.toBinary(this.status[1]) + '</td>'
        out += '<td>' + this.toBinary(this.status[2]) + '</td>'

        out += '<td>' + this.status[3].toString() + '</td>'
        out += '<td>' + this.status[4].toString() + '</td>'
        out += '<td>' + this.status[5].toString() + '</td>'
        out += '<td>' + this.status[6].toString() + '</td>'
        out += '<td>' + this.status[7].toString() + '</td>'
        out += '<td>' + this.status[8].toString() + '</td>'

        out += '<td>' + this.toBinary(this.status[9]) + '</td> '
        out += '</tr></table>'

        return out
    }

}

export default StadiaController

