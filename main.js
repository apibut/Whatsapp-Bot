/*Mat and Zhoe*/
const conn = require("./mat/connect")
const wa = require("./mat/helper")
const fs = require("fs")
const requests = require("node-fetch")
const clc = require('chalk');
const FormData =require('form-data');
const {Duplex} = require('stream');
const { exec } = require("child_process");
const util = require("util")
const speed = require('performance-now')


conn.connectToWhatsApp()
const event = conn.Whatsapp

const APIKUY = "Chat me for Apikey https://wa.me/6281396061030"
var tmp_ids = []
var respon_tag = {}
var respon_pm = {}
var wait = {
    Modepublic: {
        status: true
    },
    pmAutoRead: {
        status: false
    },
    gAutoRead: {
        status: false
    },
    responder: {
        tag: {
            status: false,
            GROUP: [],
            message: {}
        },
        pm: {
            status: false,
            message: "apa tod"
        },
        welcome: {
            status: false,
            GROUP: [],
            message: {}
        },
        leave: {
            status: false,
            GROUP: [],
            message: {}
        }
    }
}
function modecmd(sender){
    if(wait.Modepublic.status){
        return true
    }else{
        if(sender === event.user.jid){
            return true
        }else{
            return false
        }
    }
}

event.on('message-new', async(chat) =>{
    const owner = ["6282260888474@s.whatsapp.net","6281396061030@s.whatsapp.net", event.user.jid]
    console.log("NEW MESSAGE")
    const msg = wa.serialize(chat)
    const text = msg.text
    const cmd = msg.text.toLowerCase()
    const sender = msg.sender
    const to = msg.key.remoteJid
    const msg_id = msg.key.id
    const args = cmd.split(' ')
    console.log(clc.blue("=============================================="));
    console.log(clc.red("[ SENDER ] : "+ sender));
    console.log(clc.yellow("[ TO ] : "+to));
    console.log(clc.green("[ MSG ] : "+ text));
    console.log(clc.blue("=============================================="));
    if(msg.key.fromMe){
        tmp_ids.push(msg_id)
        if (cmd == "mode public"){
            if (wait.Modepublic.status){
                wa.sendMessage(to, 'Mode Public already active')
            } else {
                wait.Modepublic.status = true
                wa.sendMessage(to, 'Success activated Mode Public')
            }
        } else if (cmd == "mode self"){
            if (!wait.Modepublic.status){
                wa.sendMessage(to, 'Mode Self already active')
            } else {
                wait.Modepublic.status = false
                wa.sendMessage(to, 'Success activated Mode Self')
            }
        }
    }
    if (msg.quoted){
        if (text == "img2url"){
            if (Object.keys(msg.quoted)[0] === "imageMessage"){
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                const stream = fs.createReadStream(file);
                const form = new FormData();
                form.append('img', stream);
                const res = await requests('http://hujanapi.xyz/api/image2url?apikey='+APIKUY, { method: 'POST', body: form })
                const ret =  await res.json()
                wa.sendMessage(to, ret.result.url)
                fs.unlinkSync(file)
            }
        } else if (text == "to sscode"){
            if (Object.keys(msg.quoted)[0] === "conversation"){
                xtext = msg.quoted.conversation
                const code = await requests('http://hujanapi.xyz/api/sscode?query='+xtext+'&apikey='+APIKUY)
                const mat = await code.json()
                wa.sendMediaURL(to,mat.result)
            }
        } else if (text == "totext"){
            if (Object.keys(msg.quoted)[0] === "audioMessage") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                const stream = fs.createReadStream(file);
                const form = new FormData();
                form.append('audio', stream);
                const res = await requests('http://hujanapi.xyz/api/stt?apikey='+APIKUY, { method: 'POST', body: form })
                const ret =  await res.json()
                wa.sendMessage(to, ret.result)
                fs.unlinkSync(file)
            }
        } else if (text == "toimg"){
            if (Object.keys(msg.quoted)[0] === "stickerMessage") {
                msg.message = msg.quoted
                gerak = msg.quoted.stickerMessage.firstFrameSidecar
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.png')
                exec(`ffmpeg -i ${file} ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert sticker to image❌')
                    buffer = fs.readFileSync(mat)
                    wa.sendImage(to, mat)
                    fs.unlinkSync(mat)
                })
            }
        } else if (text == "sticker"){
            if (Object.keys(msg.quoted)[0] === "imageMessage") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.webp')
                exec(`ffmpeg -i ${file} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert image to sticker❌')
                    buffer = fs.readFileSync(mat)
                    wa.sendSticker(to, mat)
                    fs.unlinkSync(mat)
                })
            } else if (Object.keys(msg.quoted)[0] === "videoMessage") {
                msg.message = msg.quoted
                const file = await event.downloadAndSaveMediaMessage(msg, msg_id)
                mat = wa.getRandom('.webp')
                exec(`ffmpeg -i ${file} -ss 00:00:00 -t 00:00:15 ${mat}`, (err) => {
                    fs.unlinkSync(file)
                    if (err) return wa.sendMessage(to, 'Failed to convert video to sticker❌')
                    buffer = fs.readFileSync(mat)
                    wa.sendSticker(to, mat)
                    fs.unlinkSync(mat)
                })
            }
        } else if (text == "delete"){
            idx = msg.message.extendedTextMessage.contextInfo.stanzaId
            if (tmp_ids.includes(idx)) {
                event.deleteMessage(to, { id: idx, remoteJid: to, fromMe: true })
            } else {
                wa.sendMessage(to, "Error❌, Bot Cannot Unsend message other people!")
            }
        }
    }
    if (wait.responder.tag.status){
        if (msg.mentionedJid){
            if (msg.mentionedJid.includes(event.user.jid)){
                if(respon_tag[sender]){
                    if(respon_tag[sender] > 0){return}
                    respon_tag[sender] += 1
                }else{
                    respon_tag[sender] = 1
                }
                wa.sendMessage(to, wait.responder.tag.message[to])
            } 
        }
    }
    if (wait.responder.pm.status){
        if (!msg.isGroup){
            if(respon_pm[sender]){
                if(respon_pm[sender] > 0){return}
                respon_pm[sender] += 1
            }else{
                respon_pm[sender] = 1
            }
            wa.sendMessage(to, wait.responder.pm)
        }
    }
    if (chat){
        //console.log(chat)
        if (cmd.startsWith("!")) {
            if (owner.includes(sender)){
                const sep = text.split("\n")
                let exc = text.replace(sep[0]+"\n", "")
                const print = function(text){
                    wa.sendMessage(to, util.format(text))
                }
                console.log(exc)
                eval("(async () => {try{"+exc+"}catch(e){wa.sendMessage(to,  e.toString())}})()")
            }
        }
        if (cmd === "hi"){
            if (!modecmd(sender)) return
                wa.sendReply(to, "hai juga")
                wa.sendReplyWA(to, "Hey @!", "HujanAPI.xyz", [sender])
        } else if (cmd === "me"){
            if (!modecmd(sender)) return
                wa.sendContact(to, sender, "Your Contact")
        } else if (cmd === "owner"){
            if (!modecmd(sender)) return
            wa.sendContact(to, "6281396061030@s.whatsapp.net", "Owner")
        } else if (cmd === "settings"){
            if (!modecmd(sender)) return
            let mat = "*Settings*\n"
            if (wait.responder.tag.status == true) { mat += "\n⋄ Respontag < *On* >\n  └ "+wait.responder.tag.message[to]+" < MSG >" } else if (wait.responder.tag.status == false) { mat += "\n⋄ Respontag < *Off* >\n  └ "+wait.responder.tag.message[to]+" < MSG >" }
            if (wait.responder.pm.status == true) { mat += "\n⋄ Responpm < *On* >\n  └ "+wait.responder.pm.message[to]+" < MSG >" } else if (wait.responder.pm.status == false) { mat += "\n⋄ Responpm < *Off* >\n  └ "+wait.responder.pm.message[to]+" < MSG >" }
            if (wait.responder.welcome.status == true) { mat += "\n⋄ Welcome < *On* >\n  └ "+wait.responder.welcome.message[to]+" < MSG >" } else if (wait.responder.welcome.status == false) { mat += "\n⋄ Welcome < *Off* >\n  └ "+wait.responder.welcome.message[to]+" < MSG >" }
            if (wait.responder.leave.status == true) { mat += "\n⋄ Leave < *On* >\n  └ "+wait.responder.leave.message[to]+" < MSG >" } else if (wait.responder.leave.status == false) { mat += "\n⋄ Leave < *Off* >\n  └ "+wait.responder.leave.message[to]+" < MSG >" }
            wa.sendReply(to, mat)
        } else if (cmd === "help"){
            if (!modecmd(sender)) return
            let mode = ""
            if(wait.Modepublic.status){ mode += "Mode Public" } else if(!wait.Modepublic.status) { mode += "Mode Self" }
            const cr1 = '6281396061030@s.whatsapp.net'
            const cr2 = '6282260888474@s.whatsapp.net'
            let mat = '*< Help Messages >*\n\n'
            mat += `_${mode}_\n\n`
            mat += '_Creator:_\n'
            mat += '1. @!\n'
            mat += '2. @!\n'
            mat += 'Github: https://github.com/mamet8/Whatsapp-Bot\n\n'
            mat += '_Command:_ *NO PREFIX*\n'
            mat += '> Hi\n'
            mat += '> Owner\n'
            mat += '> Me\n'
            mat += '> Speed\n'
            mat += '> Settings\n'
            mat += '> grouplist\n'
            mat += '> Tagall\n'
            mat += '> Grouplink\n'
            mat += '> Admingroup\n'
            mat += '> Ownergroup\n'
            mat += '> Fakereply <msg you>|<msg target>|<@>\n'
            mat += '> Hidetag\n'
            mat += '> Getpict <@>\n'
            mat += '> Getbio <@>\n'
            mat += '> Respontag\n'
            mat += '> Welcome\n'
            mat += '> Leave\n'
            mat += '\n'
            mat += '\n*Media:*\n'
            mat += '> Ig\n'
            mat += '> Youtube\n'
            mat += '> Dobgin <text>\n'
            mat += '> Nekobin <text>\n'
            mat += '> Nickff <id>\n'
            mat += '> Nickml <id>|<serverid>\n'
            mat += '> Nickcodm <id>\n'
            mat += '> Ceklistrik <nopelanggan>\n'
            mat += '> Cektelkom <nopelanggan>\n'
            mat += '> Sscode <text>\n'
            mat += '> Herolistml\n'
            mat += '> Heroml <hero>\n'
            mat += '> Charsgenshin\n'
            mat += '> Chargi <hero>\n'
            mat += '> Urlshortener1 <url>\n'
            mat += '> Urlshortener2 <url>\n'
            mat += '> Ssweb <url>\n'
            mat += '> Zippydl <url>\n'
            mat += '> Solidfilesdl <url>\n'
            mat += '> Mediafiredl <url>\n'
            mat += '> Fancytext <text>\n'
            mat += '> Cersex\n'
            mat += '> Quotes\n'
            mat += '> Quoteid\n'
            mat += '> Quotesanime\n'
            mat += '> Randomcat\n'
            mat += '> Randomloli\n'
            mat += '> Randomblowjob\n'
            mat += '> Randomhentai\n'
            mat += '> Randomkiss\n'
            mat += '> Randomhug\n'
            mat += '> Randomcry\n'
            mat += '> Randomanime\n'
            mat += '> Randomwaifu\n'
            mat += '> Shopee <text>\n'
            mat += '> Xvideos <text>\n'
            mat += '> Xnxx <text>\n'
            mat += '> FFlogo <text>|<hero>\n'
            mat += '> MLlogo <text>|<hero>\n'
            mat += '> Listhero mllogo\n'
            mat += '> Listhero fflogo\n'
            mat += '\n*Reply Command:*\n'
            mat += '> Img2url\n'
            mat += '> Totext\n'
            mat += '> To sscode'
            mat += '> Toimg'
            wa.sendMention(to, mat, [cr1,cr2])
        } else if (cmd === "speed"){
            if (!modecmd(sender)) return
            const timestamp = speed();
            const latensi = speed() - timestamp
            wa.sendMessage(to, "*Speed:* "+latensi.toFixed(4)+" _Second_")
        } else if (cmd === "halo"){
            if (!modecmd(sender)) return
            wa.sendMessage(to, "halo juga")
        } else if (cmd == "!leave") {
            if (!event.user.jid) return
            wa.leaveGroup(to)
        } else if (cmd == "tagall") {
            if (!msg.isGroup) return wa.sendMessage(to, 'Only Group')
            if (!modecmd(sender)) return
            const ginfo = await wa.getGroup(to)
            var xyz = await wa.getParticipantIds(to)
            let mids = []
            let fox = "*Tag All Groups*\n"
            let no = 0
            for (let mem of xyz) {
                no += 1
                fox += "\n" + no + ". @!"
                mids.push(mem)
            }
            fox += "\n\nName: "+ginfo.subject+"\nMember: "+mids.length+"\n\n𝗦𝗘𝗟𝗙𝗕𝗢𝗧-𝗪𝗔"
            wa.sendReplyWA(to, fox, "HujanAPI.xyz", mids)
        } else if (cmd == "admingroup") {
            if (!modecmd(sender)) return
            var xyz = await wa.getAdminIds(to)
            let mids = []
            let fox = "*Admin Groups*\n"
            let no = 0
            for (let mem of xyz) {
                no += 1
                fox += "\n" + no + ". @!"
                mids.push(mem)
            }
            fox += "\n\nTotal: "+mids.length
            wa.sendMention(to, fox, mids)
        } else if (cmd == "ownergroup") {
            var admin = await wa.getOwnerIds(to)
            let xyz = "*Owner Groups*\n"
            xyz += "\n@!"
            wa.sendMention(to, xyz, admin[0])
        } else if (cmd == "grouplist") {
            if (!modecmd(sender)) return
            var glist = await wa.getGroups(to)
            let gid = []
            let fox = "*Groups List*\n"
            let no = 0
            for (let a of glist) {
                const name = event.contacts[a].name
                const groupid = event.contacts[a].jid
                no += 1
                fox += "\n"+no+". "+name+" | "+groupid
                gid.push(a)
            }
            fox += "\n\nTotal: "+gid.length
            wa.sendMessage(to, fox)
        } else if (cmd.startsWith("grouplink")){
            if (!modecmd(sender)) return
            const code = await wa.getGroupInvitationCode(to)
            wa.sendMessage(to, code)
        } else if (cmd.startsWith("groupinfo")){
            if (!modecmd(sender)) return
            const pict = await wa.getPict(to)
            const g = await wa.getGroup(to)
            const admin = await wa.getAdminIds(to)
            const owner = await wa.getOwnerIds(to)
            const members = await wa.getParticipantIds(to)
            let gdesc = ""
            if (g.desc == undefined){
                gdesc += "None"
            } else { gdesc += g.desc }
            let ginfo = "*- Group Information -*\n"
            ginfo += "\n*Group Name:*  _"+g.subject+"_"
            ginfo += "\n*Group ID:*  _"+g.id+"_"
            ginfo += "\n*Owner:* @!"
            ginfo += "\n\n*- Member Information -*"
            ginfo += "\n*Admin:*  _"+admin.length+"_"
            ginfo += "\n*Participant:*  _"+members.length+"_"
            ginfo += "\n\n*- History Information -*"
            //ginfo += "\n*Created:*  _{}_"
            ginfo += "\n\n*- Description -*"
            ginfo += "\n "+gdesc
            wa.sendMediaURL(to, pict, ginfo, owner)
        } else if (cmd.startsWith("getpict")) {
            if (!modecmd(sender)) return
            mentioned = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
            const pict = wa.getPict(mentioned)
            wa.sendMediaURL(to, pict)
        } else if (cmd.startsWith("getbio")) {
            if (!modecmd(sender)) return
            mentioned = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
            const pdata = await event.getStatus(mentioned)
            if (pdata.status == 401) {
                wa.sendMessage(to, "Status Profile Not Found")
            } else  {
                wa.sendMessage(to, pdata.status)
            }
        } else if (cmd.startsWith("hidetag")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('hidetag' + " ", "")
            wa.hideTag(to, xtext)
        } else if (cmd.startsWith("fakereply")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('fakereply' + " ", "")
            pemisah = xtext.split("|")
            user = m.message.extendedTextMessage.contextInfo.mentionedJid[0]
            wa.fakeReply(to, user, pemisah[0], pemisah[1])
        } else if (cmd.startsWith("demote")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return  wa.sendMessage(to, "No target..")
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                user = m.message.extendedTextMessage.contextInfo.mentionedJid
                await wa.demoteAdmin(to, user)
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
        } else if (cmd.startsWith("promote")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return  wa.sendMessage(to, "No target..")
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                user = m.message.extendedTextMessage.contextInfo.mentionedJid
                await wa.promoteAdmin(to, user)
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
        } else if (cmd.startsWith("kick")) {
            if (!modecmd(sender)) return
            if(args.length === 1) return  wa.sendMessage(to, "No target..")
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                user = m.message.extendedTextMessage.contextInfo.mentionedJid
                await wa.kickMember(to, user)
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }
        } else if (txt.startsWith("add")) {
            if (!modecmd(sender)) return
            admin = await wa.getAdminIds(to)
            if (admin.includes(event.user.jid) == true){
                const xtext = txt.replace('add' + " ", "")
                if (xtext.startsWith('08')) return wa.sendMessage(to, 'Use country code number')
                try {
                    num = `${xtext.replace(/ /g, '')}@s.whatsapp.net`
                    event.groupAdd(to, [num])
                } catch (e) {
                    console.log('Error :', e)
                    wa.sendMessage(to, 'Gagal menambahkan target, mungkin karena di private')
                }
            }else{
                wa.sendReply(to, "Bot Not Admin!")
            }

//============[ Media ]============\\
        } else if (txt.startsWith("stickerline")) {
            if (!modecmd(sender)) return
            const xtext = txt.replace('stickerline' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/stickerline?url="+xtext+"&apikey="+APIKUY)
            const data = await response.json()
            const cok = data.result
            for (var iu = 0; iu < data.length; iu++) {
                if (data[iu].animation == true) {
                    wa.sendStickerUrl(to, data[iu].url)
                } else {
                    wa.sendStickerUrl(to, data[iu].url)
                }
            }
        } else if (cmd.startsWith("dogbin")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('dogbin' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/dogbin?text="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMessage(to, mat.result)
        } else if (cmd.startsWith("nekobin")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('nekobin' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/nekobin?text="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMessage(to, mat.result)
        } else if (cmd.startsWith("ceklistrik")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('ceklistrik' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/listrik?nop="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            if (mat.status == '422') {
                const crot = mat.meesage
                wa.sendMessage(to,"[ ERROR ]\n\n"+crot)
            } else if (mat.status == '200'){
                let crot = "*Tagihan PLN*\n"
                crot += "\nName: "+mat.result.name
                crot += "\nID Customer: "+mat.result.no_pel
                crot += "\nPeriode: "+mat.result.periode
                crot += "\nFee Admin: "+mat.result.fee_admin
                crot += "\nAmount: "+mat.result.amount
                wa.sendMessage(to,crot)
            }
        } else if (cmd.startsWith("cektelkom")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('cektelkom' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/telkom?nop="+xtext+ "&apikey="+APIKUY)
            const mat = await response.json()
            if (mat.status == '400') {
                const crot = mat.meesage
                wa.sendMessage(to,"[ ERROR ]\n\n"+crot)
            } else if (mat.result.error == false){
                let crot = "*Tagihan PLN*\n"
                crot += "\nCustomer Name: "+mat.result.customer_name
                crot += "\nID Customer: "+mat.result.customer_number
                crot += "\nFee Admin: "+mat.result.fee_admin
                crot += "\nTagihan: "+mat.result.tagihan
                crot += "\nTotal: "+mat.result.total
                wa.sendMessage(to,crot)
            } else if (mat.result.error == "Maaf, sedang error..."){
                wa.sendMessage(to, "[ ERROR ]\n Nomor ID Salah")
            }
        } else if (cmd.startsWith("sscode")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('sscode' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/sscode?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to,mat.result)
        } else if (cmd.startsWith("nickff")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return wa.sendReply(to, "Ex: *nickff [id ff]*\nContoh : *nickff 866740835*")
            const xtext = cmd.replace('nickff' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/nickff?id="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendReply(to, mat.result)
        } else if (cmd.startsWith("nickcodm")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return wa.sendReply(to, "Ex: *nickcodm [id codm]*\nContoh : *nickcodm 7852089867668209248*")
            const xtext = cmd.replace('nickff' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/nickcodm?id="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendReply(to, mat.result)
        } else if (cmd.startsWith("nickml")) {
            if (!modecmd(sender)) return
            if (args.length === 1) return wa.sendReply(to, "Ex: *nickml [id ml]|[serverid]*\nContoh : *nickml 1161941|2002*")
            const xtext = cmd.replace('nickml' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/nickml?id="+pemisah[0]+"&serverid="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendReply(to, mat.result)
        } else if (cmd.startsWith("cocofundl")) {
            if (!modecmd(sender)) return
            const xtext = text.replace('cocofundl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/cocofun?url="+xtext+"&apikey=" + APIKUY)
            const data = await response.json()
            const cok = data.result
            wa.sendMediaURL(to, data.result.url, "*COCOFUN DOWNLOAD*")
        } else if (cmd == "herolistml") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/listheroml?apikey=" + APIKUY)
            const data = await response.json()
            const asu = data.result
            let fox = "*List Hero*\n"
            let no = 0
            for (var a = 0; a < asu.length; a++) {
                no += 1
                fox += "\n" + no + ". " + asu[a].name
            }
            wa.sendMessage(to, fox)
        } else if (cmd.startsWith("heroml")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('heroml' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/heroml?hero="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.results
            let fox = "*Detail Hero*\n"
            fox += "\n*Title :* " + asu.name
            fox += "\n*Quotes :* " + asu.quotes
            fox += "\n*Role :* " + asu.role
            fox += "\n*Line Recommendation :* " + asu.line_recommendation
            fox += "\n*Price :* "
            fox += "\n    *BP:* "+asu.price.battlepoint
            fox += "\n    *DM:* "+asu.price.diamond
            fox += "\n    *Ticket:* "+asu.price.ticket
            fox += "\n\n*Attributes :*"
            fox += "\n    *Ability Critical Rate :* "+asu.attributes.ability_crit_rate
            fox += "\n    *Attack Speed :* "+asu.attributes.attack_speed
            fox += "\n    *Basic Attck CritRate :* "+asu.attributes.basic_atk_crit_rate
            fox += "\n    *HP :* "+asu.attributes.hp
            fox += "\n    *Hp Regen :* "+asu.attributes.hp_regen
            fox += "\n    *Magic Power :* "+asu.attributes.magic_power
            fox += "\n    *Mana :* "+asu.attributes.mana
            fox += "\n    *Mana Regen :* "+asu.attributes.mana_regen
            fox += "\n    *Movement Speed :* "+asu.attributes.movement_speed
            fox += "\n    *Pyhsical Attack :* "+asu.attributes.physical_attack
            fox += "\n    *Pyhsical Defense :* "+asu.attributes.physical_defense
            wa.sendMediaURL(to, asu.img, fox)
        } else if (cmd == "charsgenshin") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/gichars?apikey=" + APIKUY)
            const data = await response.json()
            const liyue = data.result.liyue
            const mondstadt = data.result.mondstadt
            let fex = "\n\n*List Character Mondstadt*\n"
            let num = 0
            let fox = "*List Character Liyue*\n"
            let no = 0
            for (var a = 0; a < liyue.length; a++) {
                no += 1
                fox += "\n"+no+". "+liyue[a]
            }
            for (var a = 0; a < mondstadt.length; a++) {
                num += 1
                fex += "\n"+num+". "+mondstadt[a]
            }
            const mat = fox+" "+fex
            wa.sendMessage(to, mat)
        } else if (cmd.startsWith("chargi")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('chargi' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/gichar?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            let fox = "*Detail Character*\n"
            fox += "\n*Title :* " + asu.title
            fox += "\n*Info :* " + asu.intro
            wa.sendMediaURL(to, asu.cover1, fox)
            await wa.sendMediaURL(to, asu.cv[0].audio[2])
        } else if (cmd.startsWith("lirik")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('lirik' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/lirik?query="+xtext+"&apikey="+APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result.lyric)
        } else if (cmd.startsWith("chord")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('chord' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/chord?query="+xtext+"&apikey="+APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result)
        } else if (cmd.startsWith("wikipedia")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('wikipedia' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/wikipedia?query=" + xtext + "&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            const pp = datas.result.img
            let fox = "*_WIKIPEDIA_*\n"
            fox += "\n*Title :* " + asu.title
            fox += "\n*Result :*\n" + asu.info
            for (var a = 0; a < pp.length; a++) {}
            wa.sendMediaURL(to, pp[0], fox)
        } else if (cmd.startsWith("gsmarena")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('gsmarena' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/gsmarena?query=" + xtext + "&apikey=" + APIKUY)
            const datas = await response.json()
            let fox = "*Result GSMarena*\n"
            fox += "\n*Title :*\n" + datas.result.title
            fox += "\n\n*Spesifikasi :*\n" + datas.result.spec
            wa.sendMediaURL(to, datas.result.img, fox)
        } else if (cmd.startsWith("artinama")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('artinama' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/artinama?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            wa.sendMessage(to, asu.result)
        } else if (cmd.startsWith("artimimpi")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('artimimpi' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/artimimpi?query="+xtext+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            wa.sendMessage(to, asu.result)
        } else if (cmd.startsWith("jodoh")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('jodoh' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/ramalanjodoh?name1="+pemisah[0]+"&name2="+pemisah[1]+"&apikey="+APIKUY)
            const datas = await response.json()
            const asu = datas.result
            let fox = '*Ramalan Jodoh*\n\n'
            fox += `*${asu.nama1}* dan *${asu.nama2}*\n`
            fox += '*Sisi Positif*: '+asu.positif
            fox += '\n*Sisi Negatif*: '+asu.negatif
            fox += '\n\n '+asu.desk
            wa.sendMediaURL(to, asu.img, fox)
        } else if (cmd.startsWith("urlshortener1")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('urlshortener1' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/shorturl?url="+xtext+"&apikey="+APIKUY)
            const anu = await response.json()
            wa.sendMessage(to, anu.result.Short)
        } else if (cmd.startsWith("urlshortener2")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('urlshortener2' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/cuttly?url="+xtext+"&apikey="+APIKUY)
            const anu = await response.json()
            wa.sendMessage(to, anu.result.Short)
        } else if (cmd.startsWith("ssweb")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('ssweb' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/ssweb?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, response, "*Your requests*")
        } else if (cmd.startsWith("mediafiredl")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('mediafiredl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/mediafire?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = '*Mediafire Download*\n\n'
            fox += '*Title:* '+mat.result.title
            fox += '\n*Size:* '+mat.result.size
            fox += '\n*Type:* '+mat.result.type
            fox += '\n*Link Download:* '+mat.result.url
            wa.sendMessage(to, fox)
        } else if (cmd.startsWith("zippydl")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('zippydl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/zippydl?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = '*Zippyshare Download*\n\n'
            fox += '\n*Size:* '+mat.size
            fox += '\n*Link Download:* '+mat.link
            wa.sendMessage(to, fox)
        } else if (cmd.startsWith("solidfilesdl")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('solidfilesdl' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/solidfiles?url="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            let fox = '*Solidfiles Download*\n\n'
            fox += '*Title:* '+mat.result.title
            fox += '\n*Size:* '+mat.result.size
            fox += '\n*Link Download:* '+mat.result.url
            wa.sendMessage(to, fox)
        } else if (cmd.startsWith("fancytext")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('fancytext' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/fancy?query="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            const asu = mat.result.data
            let fox = '*Fancytext*\n\n'
            let no = 0
            for (var a = 0; a < asu.length; a++) {
                no += 1
                fox += "\n" + no + ". " + asu[a]
            }
            wa.sendMessage(to, fox)
        } else if (cmd.startsWith("shopee")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('shopee' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/shopee?query="+xtext+"&count=10&apikey="+APIKUY)
            const datas = await response.json()
            const img = 'https://igo.space/wp-content/uploads/2020/09/logo.png'
            const asu = datas.result.items
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Shopee Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].name+"```\n"+asu[a].link_produk+"```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```shopee "+xtext+"|number```"
                wa.sendMediaURL(to, img, fox, [sender])
            }
            if (pemisah.length == 2) {
                const num = pemisah[1]
                const value = Number(pemisah[1])
                let fox = "*_Detail Product Shopee*_\n"
                fox += "\nTitle : " + asu[value].name
                fox += "\nShop Loc : " + asu[value].shop_loc
                fox += "\nLink Product : " + asu[value].link_produk
                fox += "\nPrice : " + asu[value].price
                fox += "\nPrice Min and Max : " +asu[value].price_min+" "+asu[value].price_max
                fox += "\nDesc : " + asu[value].desc
                fox += "\n\n\nSource : " + datas.result.source
                wa.sendMediaURL(to, asu[value].image_cover, fox)
            }
        } else if (cmd.startsWith("xvideos")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace("xvideos ", "")
            pemisah = xtext.split("|")
            const search = pemisah[0]
            const response = await requests("http://hujanapi.xyz/api/xvideos?query="+search+"&count=10&apikey="+APIKUY)
            const datas = await response.json()
            const img = 'https://seeklogo.com/images/X/xvideos-logo-77E7B4F168-seeklogo.com.png'
            const asu = datas.result
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Xvideos Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].title+"```\n"+asu[a].url+"```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```xvideos "+xtext+"|number```"
                wa.sendMediaURL(to, img, fox, [sender])
            }
            if (pemisah.length == 2) {
                const num = pemisah[1]
                const value = Number(pemisah[1])
                let fox = "*_Detail Video*_\n"
                fox += "\nTitle : " + asu[value].title
                fox += "\nDuration : " + asu[value].duration
                fox += "\nChannel : " + asu[value].channel
                fox += "\nLink : " + asu[value].url
                fox += "\n\n\nSource : xvideos.com"
                wa.sendMediaURL(to, asu[value].image, fox)
            }
        } else if (cmd.startsWith("xnxx")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('xnxx' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/xnxx?query="+xtext+"&count=10&apikey="+APIKUY)
            const datas = await response.json()
            const img = 'https://yt3.ggpht.com/ytc/AAUvwngpbURJyno0rvS4aza889YDF7-oXbRyopWO0bZO=s900-c-k-c0x00ffffff-no-rj'
            const asu = datas.result
            if (pemisah.length == 1)  {
                let num = 0
                let fox = "*_Xnxx Search_*\n\n"
                for (var a = 0; a < asu.length; a++) {
                    num += 1
                    fox += "```"+asu[a].title+"```\n"+asu[a].url+"```("+num+")```\n"
                }
                fox += "\n\n*Hey* @! *For detail*:\n```xnxx "+xtext+"|number```"
                wa.sendMediaURL(to, img, fox, [sender])
            }
            if (pemisah.length == 2) {
                const num = pemisah[1]
                const value = Number(pemisah[1])
                let fox = "*_Detail Video*_\n"
                fox += "\nTitle : " + asu[value].title
                fox += "\nDuration : " + asu[value].duration
                fox += "\nChannel : " + asu[value].channel
                fox += "\nLink : " + asu[value].url
                fox += "\n\n\nSource : xnxx.com"
                wa.sendMediaURL(to, asu[value].image, fox)
            }
        } else if (cmd.startsWith("cersex")) {
            if (!modecmd(sender)) return
            const xtext = cmd.replace('cersex' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/cersex?apikey=" + APIKUY)
            const datas = await response.json()
            const asu = datas.result
            var img = asu.img
            let fox = `*${asu.title}*`
            fox += "\n\n" + asu.result
            wa.sendMediaURL(to, asu.img[0], fox)
        } else if (cmd == "randompantun") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/pantun?apikey=" + APIKUY)
            const data = await response.json()
            const crot = data.result
            wa.sendMessage(to, crot.result)
        } else if (cmd == "quoteid") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/quotesid?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result.quotes)
        } else if (cmd == "quotes") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/quotesen?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMessage(to, data.result.quotes)
        } else if (cmd == "quotesanime") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/quoteanime?apikey=" + APIKUY)
            const data = await response.json()
            const res = data.result.quote+"\n\nAnime:"+data.result.anime+"\nCharacter"+data.result.character
            wa.sendMessage(to, res)
        } else if (cmd == "randomcat") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomcat?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.result.url, "*_Random Cat_* @!", [sender])
        } else if (cmd.startsWith("fflogo")) {
            if (!modecmd(sender)) return
            try{
                const xtext = cmd.replace('fflogo' + " ", "")
                pemisah = xtext.split("|")
                const response = await requests("http://hujanapi.xyz/api/fftext?text="+pemisah[0]+"&hero="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                wa.sendMediaURL(to, mat.result, "*Your requests*")
            }catch{
                wa.sendReply(to, "Error, hero not found. Please type *listhero mllogo* for see all hero")
            }
        } else if (cmd.startsWith("listhero fflogo")) {
            if (!modecmd(sender)) return
            const list = ["A124","Alok","Alvaro","Andrew","Antonio","Caroline","Hayato","Kapella","Kelly","Kla","Laura","Maxim","Miguel","Misa","Moco","Nikita","Notora","Olivia","Paloma","Rafael","Shani","Steffie"]
            let fox = "*List Hero FFLOGO*\n"
            let no = 0
            for (let i of list) {
                no += 1
                fox += "\n" + no + ". "+i
            }
            wa.sendReply(to, fox)
        } else if (cmd.startsWith("mllogo")) {
            if (!modecmd(sender)) return
            try{
                const xtext = cmd.replace('mllogo' + " ", "")
                pemisah = xtext.split("|")
                const response = await requests("http://hujanapi.xyz/api/mltext?text="+pemisah[0]+"&hero="+pemisah[1]+"&apikey="+APIKUY)
                const mat = await response.json()
                wa.sendMediaURL(to, mat.result, "*Your requests*")
            }catch{
                wa.sendReply(to, "Error, hero not found. Please type *listhero mllogo* for see all hero")
            }
        } else if (cmd.startsWith("listhero mllogo")) {
            if (!modecmd(sender)) return
            const list = ["Aldous","Alice 2","Angela 2","Argus 2","Chou","Chou 2","Estes","Eudora","Eudora 2","Granger","Granger 2","Gusion 3","Hanabi 2","Hanzo","Helcurt","Layla 3","Lesley 4","Lunox 2","Odette 3","Saber","Thamuz","Vexana","Argus","Dyrroth","Esmeralda 2","Kadita 2","Lancelot","Leomord 2","Lylia","Vale","Valir","X.Borg","Zhask","Alice","Alpha","Athena","Badang","Balmond","Bane","Diggie","Esmeralda","Fanny 2","Fanny 3","Freya","Guinevere","Gusion","Gusion 2","Hanabi","Harith","Harith 2","Hayabusa 2","Kadita","Kagura 2","Kagura 3","Karina 2","Kimmy","Layla 2","Leomord","Lesley 2","Lesley 3","Lunox","Martis","Miya 2","Nana","Nana 2","Natalia","Natalia 2","Odette 2","Pharsa","Rafaela 2","Selena 2","Zilong","Alucard","Angela","Bruno","Chang'e","Claude","Fanny","Hayabusa","Hilda","Hylos","Kagura","Karina","Karrie","Layla","Lesley","Lolita","Minotaur","Minsittar","Miya","Moskov","Odette","Rafaela","Selena"]
            let fox = "*List Hero MLLOGO*\n"
            let no = 0
            for (let i of list) {
                no += 1
                fox += "\n" + no + ". "+i
            }
            wa.sendReply(to, fox)
        } else if (txt.startsWith("wetglass")) {
            const xtext = txt.replace('wetglass' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/wetglass?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("thunder")) {
            const xtext = txt.replace('thunder' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/thunder?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("blackpink")) {
            const xtext = txt.replace('blackpink' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/blackpink?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("skyonline")) {
            const xtext = txt.replace('skyonline' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/skyonline?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("greenneon")) {
            const xtext = txt.replace('greenneon' + " ", "")
            const response = await requests("http://hujanapi.xyz/api/greenneon?text="+xtext+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("glitchtext")) {
            const xtext = txt.replace('glitchtext' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/glitch_text?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("marvelavengers")) {
            const xtext = txt.replace('marvelavengers' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/marvelavengers?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("marvelstudio")) {
            const xtext = txt.replace('marvelstudio' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/marvelstudio?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("wolfblack")) {
            const xtext = txt.replace('wolfblack' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/wolf_black?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")
        } else if (txt.startsWith("pornhub")) {
            const xtext = txt.replace('pornhub' + " ", "")
            pemisah = xtext.split("|")
            const response = await requests("http://hujanapi.xyz/api/pornhub?text1="+pemisah[0]+"&text2="+pemisah[1]+"&apikey="+APIKUY)
            const mat = await response.json()
            wa.sendMediaURL(to, mat.result, "*Your Requests*")

        } else if (txt.startsWith("youtube")) {
            const xtext = txt.replace("youtube" + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Youtube 」"
            res += "\n├ Usage : "
            res += "\n│ • Youtube"
            res += "\n│ • Youtube Search <query>"
            res += "\n│ • Youtube Mp3 <URL>"
            res += "\n│ • Youtube Mp4 <url>"
            res += "\n╰───「 Hello World 」"
            if (xtext == "youtube") { 
                wa.sendMessage(to, res)
            } else if (cond[0] == "search") {
                const response = await requests("http://hujanapi.xyz/api/ytsearch?query="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const asu = data.result
                let fox = "*Youtube Search*\n"
                let no = 0
                for (var a = 0; a < asu.length; a++) {
                    no += 1
                    fox += "\n"+asu[a].title+"\n"+asu[a].url+" ("+no+")"
                }
                wa.sendMessage(to, fox)
            } else if (cond[0] == "mp3") {
                const response = await requests("http://hujanapi.xyz/api/ytdl?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                let yt = "*Youtube MP3*\n\n"
                yt += "Title: _"+data.result.title+"_"
                yt += "\nDuration: _"+data.result.duration+"_"
                yt += "\nChannel: _"+data.result.author+"_"
                yt += "\nsize_audio: _"+data.result.size_audio+"_"
                wa.sendMediaURL(to, data.result.image, yt)
                wa.sendMediaURL(to, data.result.mp3)
            } else if (cond[0] == "mp4") {
                const response = await requests("http://hujanapi.xyz/api/ytdl?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                let yt = "*Youtube MP3*\n\n"
                yt += "Title: _"+data.result.title+"_"
                yt += "\nDuration: _"+data.result.duration+"_"
                yt += "\nChannel: _"+data.result.author+"_"
                yt += "\nsize_audio: _"+data.result.size_video+"_"
                wa.sendMediaURL(to, data.result.image, yt)
                wa.sendMediaURL(to, data.result.mp4)
            }
        } else if (txt.startsWith("ig")) {
            const xtext = txt.replace("ig" + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Instagram 」"
            res += "\n├ Usage : "
            res += "\n│ • Ig"
            res += "\n│ • Ig Profile <username>"
            res += "\n│ • Ig Post <URL>"
            res += "\n│ • Ig Story <username> <count>"
            res += "\n╰───「 Hello World 」"
            if (xtext == "ig") { 
                wa.sendMessage(to, res)
            } else if (cond[0] == "profile") {
                xyz = cond[1].split(" ")
                const response = await requests("http://hujanapi.xyz/api/ig?username="+xyz+"&apikey="+APIKUY)
                const data = await response.json()
                let ig = "  ｢Instagram Profile｣\n"
                ig += "\n• Username : "+data.result.user.username
                ig += "\n• Full Name : "+data.result.user.full_name
                ig += "\n• Biography : "+data.result.user.biography
                ig += "\n• Media Count : "+data.result.user.media_count
                ig += "\n• Followers : "+data.result.user.follower_count
                ig += "\n• Following : "+data.result.user.following_count
                ig += "\n• Private : "+data.result.user.is_private
                ig += "\n• Link : https://www.instagram.com/"+xyz
                photo = data.result.user.hd_profile_pic_url_info.url
                wa.sendMediaURL(to, data.result.user.hd_profile_pic_url_info.url, ig)
            } else if (cond[0] == "post"){
                const response = await requests("http://hujanapi.xyz/api/igpost?url="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const media = data.result.media
                for (var a = 0; a < media.length; a++) {
                    if (media[a].is_video == true){
                        wa.sendMediaURL(to, media[a].video)
                    } else {
                        wa.sendMediaURL(to, media[a].image)
                    }
                }
            } else if (cond[0] == "story"){
                xyz = cond[2].split(" ")
                const response = await requests("http://hujanapi.xyz/api/igstory?username="+cond[1]+"&apikey="+APIKUY)
                const data = await response.json()
                const num = xyz
                if (num <= data.length){
                    number = [num - 1]
                    if("is_video" == true){
                        wa.sendMediaURL(to, data[number].url)
                    } else {
                        wa.sendMediaURL(to, data[number].url)
                    }
                } else { 
                    if (data.length == undefined){
                        wa.sendReply(to, "this account has not created a story or this account is private")
                    }else{ 
                        wa.sendReply(to, 'Hanya ada '+data.length+' Story instagram') 
                    }
                }
            }

        } else if (cmd.startsWith("respontag")) {
            const xtext = cmd.replace("respontag" + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Auto Respon Tag 」"
            res += "\n├ Status : " + wait.responder.tag.status
            res += "\n├ Message : " + wait.responder.tag.message[to]
            res += "\n├ Usage : "
            res += "\n│ • Respontag"
            res += "\n│ • Respontag <on/off>"
            res += "\n│ • Respontag <message>"
            res += "\n╰───「 Hello World 」"
            if (xtext == "respontag") { 
                wa.sendMessage(to, res)
            } else if (cond[0] == "on") {
                if (wait.responder.tag.status){
                    wait.responder.tag.GROUP.push(to)
                    wait.responder.tag.message[to] = "ada apa?"
                    wa.sendMessage(to, `Auto Respon Tag already active *${g.subject}*`)
                } else {
                    wait.responder.tag.status = true
                    wait.responder.tag.GROUP.push(to)
                    wait.responder.tag.message[to] = "ada apa?"
                    wa.sendMessage(to, `Success activated Auto Respon Tag *${g.subject}*`)
                }
            } else if (cond[0] == "off") {
                if (wait.responder.tag.status){
                    wait.responder.tag.GROUP.splice(to)
                    wa.sendMessage(to, "Auto Respon Tag already deactive *"+g.subject+"*")
                } else {
                    wait.responder.tag.status = false
                    wait.responder.tag.GROUP.splice(to)
                    wa.sendMessage(to, "Success deactivated Auto Respon Welcome *"+g.subject+"*")
                }
            } else {
                wait.responder.tag.message[to] = xtext
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Tag has been set to:\n_'+wait.responder.tag.message[to]+'_ \nTo: *'+g.subject+'*')
            }
        } else if (cmd.startsWith("welcome")) {
            const xtext = cmd.replace("welcome" + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Welcome 」"
            res += "\n├ Status : " + wait.responder.welcome.status
            res += "\n├ Message : " + wait.responder.welcome.message[to]
            res += "\n├ Usage : "
            res += "\n│ • Welcome"
            res += "\n│ • Welcome <on/off>"
            res += "\n│ • Welcome <message>"
            res += "\n╰───「 Hello World 」"
            if (xtext == "welcome") { 
                wa.sendMessage(to, res)
            } else if (cond[0] == "on") {
                if (wait.responder.welcome.status){
                    wait.responder.welcome.GROUP.push(to)
                    wait.responder.welcome.message[to] = "Welcome @!"
                    wa.sendMessage(to, `Auto Respon Welcome already active *${g.subject}*`)
                } else {
                    wait.responder.welcome.status = true
                    wait.responder.welcome.GROUP.push(to)
                    wait.responder.welcome.message[to] = "Welcome @!"
                    wa.sendMessage(to, `Success activated Auto Respon Welcome *${g.subject}*`)
                }
            } else if (cond[0] == "off") {
                if (wait.responder.welcome.status){
                    wait.responder.welcome.GROUP.splice(to)
                    wa.sendMessage(to, "Auto Respon Welcome already deactive *"+g.subject+"*")
                } else {
                    wait.responder.welcome.status = false
                    wait.responder.welcome.GROUP.splice(to)
                    wa.sendMessage(to, "Success deactivated Auto Respon Welcome *"+g.subject+"*")
                }
            } else {
                wait.responder.welcome.message[to] = xtext
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Welcome has been set to:\n_'+wait.responder.welcome.message[to]+'_ \nTo: *'+g.subject+'*')
            }
        } else if (cmd.startsWith("leave")) {
            const xtext = cmd.replace("leave" + " ", "")
            cond = xtext.split(" ")
            g = await wa.getGroup(to)
            let res = "╭───「 Leave 」"
            res += "\n├ Status : "+wait.responder.leave.message[to]
            res += "\n├ Message : " +wait.responder.leave.message[to]
            res += "\n├ Usage : "
            res += "\n│ • Leave"
            res += "\n│ • Leave <on/off>"
            res += "\n│ • Leave <message>"
            res += "\n╰───「 Hello World 」"
            if (xtext == "leave") { 
                wa.sendMessage(to, res)
            } else if (cond[0] == "on") {
                if (wait.responder.leave.status){
                    wait.responder.leave.GROUP.push(to)
                    wait.responder.leave.message[to] = "Sayonara @!"
                    wa.sendMessage(to, `Auto Respon Leave already active *${g.subject}*`)
                } else {
                    wait.responder.leave.status = true
                    wait.responder.leave.GROUP.push(to)
                    wait.responder.leave.message[to] = "Sayonara @!"
                    wa.sendMessage(to, `Success activated Auto Respon Leave *${g.subject}*`)
                }
            } else if (cond[0] == "off") {
                if (wait.responder.leave.status){
                    wait.responder.leave.GROUP.splice(to)
                    wa.sendMessage(to, "Auto Respon Leave already deactive *"+g.subject+"*")
                } else {
                    wait.responder.leave.status = false
                    wait.responder.leave.GROUP.splice(to)
                    wa.sendMessage(to, "Success deactivated Auto Respon Leave *"+g.subject+"*")
                }
            } else {
                wait.responder.leave.message[to] = xtext
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Leave has been set to:\n_'+wait.responder.leave.message[to]+'_ \nTo: *'+g.subject+'*')
            }
        } else if (txt.startsWith("responpm msg")) {
            if (owner.includes(sender)){
                const xtext = txt.replace('responpm msg' + " ", "")
                wait.responder.pm = xtext
                wa.sendMessage(to, ' 「 Auto Respon 」\nAuto Respon Private Message has been set to:\n'+wait.responder.pm)
            }
        

//============[ ANIME ]============\\
        } else if (cmd == "randomloli") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomloli?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.result.result, "*RANDOM LOLI*")
        } else if (cmd == "randomblowjob") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomblowjob?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
        } else if (cmd == "randomhentai") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomhentai?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
        } else if (cmd == "randomkiss") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomkiss?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
        } else if (cmd == "randomhug") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomhug?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
        } else if (cmd == "randomcry") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomcry?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
        } else if (cmd == "randomanime") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomanime?apikey=" + APIKUY)
            const data = await response.json()
            wa.sendMediaURL(to, data.url, "*Your requests*")
        } else if (cmd == "randomwaifu") {
            if (!modecmd(sender)) return
            const response = await requests("http://hujanapi.xyz/api/randomwaifu?apikey=" + APIKUY)
            const data = await response.json()
            let fox = "*Nama :* " + data.result.name
            fox += "*\nDeskripsi :* " + data.result.description
            wa.sendMediaURL(to, data.result.image, fox)
        }
    }
   
})
    
event.on('group-participants-update', async (chat) => {
    try {
        const group = await wa.getGroup(chat.jid)
        mem = chat.participants[0]
        if (wait.responder.welcome.status){
            if (chat.action == 'add') {
                mem = chat.participants[0]
                photo = await wa.getPict(mem)
                //pesan = `Halo @! \nSelamat datang di group *${group.subject}*`
                pesan = wait.responder.welcome.message[to]
                wa.sendMediaURL(group.id, photo, pesan, [mem])
            }
        }
        if (wait.responder.leave.status){
            if (chat.action == 'remove') {
                mem = chat.participants[0]
                photo = await wa.getPict(mem)
                pesan = wait.responder.leave.message[to]
                wa.sendMediaURL(group.id, photo, pesan, [mem])
            }
        }
        if (chat.action == 'add') {
            if (chat.participants.includes(event.user.jid)){
                console.log("[ Update Group ] Anda Telah Masuk ke group "+group.subject)
            } else {
                console.log("[ Update Group ] "+mem+" Telah Masuk ke group "+group.subject)
            }
        }
        if (chat.action == 'remove') {
            if (chat.participants.includes(event.user.jid)){
                console.log("[ Update Group ] Anda Telah keluar dari group "+group.subject)
            } else {
                console.log("[ Update Group ] "+mem+" Telah keluar dari group "+group.subject)
            }
        }
    } catch (e) {
        console.log('Error : '+ clc.red(e))
    }
})
