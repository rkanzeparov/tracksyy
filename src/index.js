const TelegramBot = require('node-telegram-bot-api')
const config = require('./config')
const mongoose = require('mongoose')
const helper = require('./helper')
const kb = require('./keybord-buttons')
const keyboard = require('./keyboard')
const database = require('../database.json')
var cron = require('node-cron')
var emoji = require('node-emoji').emoji;

mongoose.connect(config.DB_URL, {
    useMongoClient: true
})
    .then(() => console.log("Mongo connected"))
    .catch((err) => console.log(err))


require('./model/subs-general')
require('./model/user')
require('./model/sub')
const SubsGeneral = mongoose.model('subgen')
const Subs = mongoose.model('sub')
const User = mongoose.model('users')

const ACTION_TYPE = {
    TOGGLE_SUB: 'ts',
    TOGGLE_RM: 'rm',
    CHANGE_PRICE: 'cp',
    DAILY: 'dl',
    WEEKLY: 'wl',
    MONTHLY: 'ml',
    YEARLY: 'yl',
    CHANGE_DATE: 'dt',
    CHANGE_ON: 'con',
    CHANGE_OFF: 'coff',
    NAME: 'n',
    CATEGORY: 'cat',
    NEXT: 'nt'
}

var newSubs = {
    name: "",
    price: 0,
    uid: "",
    category: "",
    url: "",
    date: 'Нет даты'
}

var sub_idd = '';

var namebool = false
var pricebool = false
var categorybool = false
var urlbool = false
var datebool = false
var typebool = false
var startI = 0
var datachangebool = false
var boolspis = false
var pingbool = false
var tasks = {}


var changebool = false
var changeDatabool = false
//new Subs(newSubs).save()

//
// database.subsGeneral.forEach(f => new SubsGeneral(f).save())

helper.logStart()






//--------------------

const TOKEN = '1612733052:AAFRgy6DhSq'

const bot = new TelegramBot(TOKEN, {
    polling: true
})

bot.on('message', (msg) => {
    //console.log(msg)
    const chatId= helper.getChatId(msg)
    console.log(newSubs)


    if(namebool) {
        console.log(msg.text)
        newSubs.name = msg.text
        namebool = false
        bot.sendMessage(helper.getChatId(msg), 'Нажмите сохранить или продолжите заполнение')
    }

    if(pricebool) {
        console.log(msg.text)
        newSubs.price = msg.text
        pricebool = false
        bot.sendMessage(helper.getChatId(msg), 'Нажмите сохранить или продолжите заполнение')
    }

    if(urlbool) {
        console.log(msg.text)
        newSubs.url = msg.text
        urlbool = false
        bot.sendMessage(helper.getChatId(msg), 'Нажмите сохранить или продолжите заполнение')
    }

    if(categorybool) {
        console.log(msg.text)
        newSubs.category = msg.text
        categorybool = false
        bot.sendMessage(helper.getChatId(msg), 'Нажмите сохранить или продолжите заполнение')
    }

    if(datebool) {
        console.log(msg.text)
        newSubs.date = msg.text
        datebool = false
        bot.sendMessage(helper.getChatId(msg), 'Нажмите сохранить или продолжите заполнение')
    }


    if(changebool) {
        if(msg.text !== kb.subs.name_change) {
            console.log(msg.text)
                try {
                    newSubs.price = msg.text
                } catch (e) {
                    console.log(e)
                }
            bot.sendMessage(chatId, 'Нажмите - Сохранить')
            changebool = false
        } else {
            bot.sendMessage(chatId, 'Введите цену')
        }
    }



    if(parseDate(msg.text) !== null && !datebool) {
        console.log(msg.text)
        //changeDatabool = true
    }

    if(changeDatabool) {
        try {
            if(msg.text !== kb.subs.name_change_date) {
            console.log(msg.text)

                newSubs.date = msg.text

            bot.sendMessage(chatId, 'Выберите', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Ежендневно',
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.DAILY,
                                    sub_id: sub_idd
                                })
                            },
                            {
                                text: 'Еженедельно',
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.WEEKLY,
                                    sub_id: sub_idd
                                })
                            },
                            {
                                text: 'Ежемесячно',
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.MONTHLY,
                                    sub_id: sub_idd
                                })
                            },
                            {
                                text: 'Ежегодно',
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.YEARLY,
                                    sub_id: sub_idd
                                })
                            }
                        ]
                    ]
                }
            })
            changeDatabool = false
        } else {
            bot.sendMessage(chatId, 'Введите дату')
        }
        } catch (e) {
            console.log(e)
        }
    }

    if(datachangebool) {
        if(msg.text !== kb.subs.name_change) {
            console.log(msg.text)
            try {
                newSubs.date = msg.text
            } catch (e) {
                console.log(e)
            }
            bot.sendMessage(chatId, 'Нажмите - Сохранить')
            datachangebool = false
        } else {
        bot.sendMessage(chatId, 'Введите дату')
        }
    }



    switch (msg.text) {
        case kb.menu.stat:
            showStatistic(chatId, msg.from.id)
            break
        case kb.ping.on:
            //showStatistic(chatId, msg.from.id)
            break
        case kb.ping.off:
            for(var o in tasks.valueOf()) {
                tasks[o].stop()
            }
            tasks = {}

            Subs.find({}).then(subs => {
                subs.map(s => {
                s.unsub = 'Выключено';
                s.save();
            })}).catch(err => console.log(err))
            bot.sendMessage(chatId, 'Выключено')
            break
        case kb.home.spis:
            pingbool = false
            showFavouriteSubsDateSpis(chatId, msg.from.id)
            break
        case kb.home.spis:
            pingbool = false
            showFavouriteSubsDateSpis(chatId, msg.from.id)
            break
        case kb.home.favourite:
            boolspis = false
            pingbool = false
            showFavouriteSubs(chatId, msg.from.id)
            break
        case kb.subs.mysub:
            bot.sendMessage(chatId, 'Чтобы создать подписку необходимо:\n1. Ввести название подписки (обязательное поле) - /name' +
                '\n2. Стоимость подписки - /price\n3. Дату списания /date\n4. Категорию /category\n5. Ссылку на подписку /url\n6. Тип подписки /type', {
                reply_markup: {keyboard: keyboard.mysubs}
            })
            break
        case kb.subs.cat:
            SubsGeneral.find({}).then(subs => {
                console.log(subs)

                var html = subs.map((s, i) => {
                    return `${s.category}`
                })

                html = new Set(html)
                var masAr = new Array();
                var masArbet = new Array()
                var i = 0
                for (let item of html.values()) {
                    console.log(item)
                    if (i % 2 === 0) {
                        console.log('if')
                        masArbet.push({text: item, callback_data: JSON.stringify({category: item})})
                        console.log(masArbet)
                    } else {
                        console.log('else')
                        masArbet.push({text: item, callback_data: JSON.stringify({category: item})})
                        console.log(masArbet)
                        masAr.push(masArbet)
                        masArbet = new Array()
                    }
                    i++
                }

                console.log(masAr)


                // var categories = '';
                // for (let item of html.values()) categories += item + '\n'
                // console.log(categories)
                //html += 'Создать свою подписку - /newsubscription'
                // sendHTML(chatId, categories, 'subs')


                bot.sendMessage(chatId, 'Выберите категорию',
                    {
                        reply_markup: {
                            inline_keyboard:
                            masAr
                        }
                    }
                )


            })

            break
        case kb.home.subsAdd:
            console.log("bef")
            boolspis = false
            pingbool = false
            bot.sendMessage(chatId, 'Выбери свою подписку из списка ниже или используй кнопку "Категории" для поиска по тематическим подпискам. Если не нашёл свою подписку, то ты всегда можешь создать её сам нажав на кнопку "Создать подписку"', {
                reply_markup: {
                    keyboard: keyboard['subs']
                }
            })
            console.log("aft")


            startI = 0
            sendFilmsByQueryIndex(chatId, {}, startI)
            break
        case kb.home.ping:
            boolspis = false
            showFavouriteSubsDatePing(chatId, msg.from.id)
            break
            //
            // User.findOne({telegramId: chatId})
            //     .then(user => {
            //         console.log(user)
            //         if(user) {
            //                 Subs.find(({name: {'$in': user.mysubs}}))
            //                 .then((sub)=> {
            //                     console.log(sub.length)
            //                     let html = ''
            //
            //                     if (sub.length) {
            //                         html += 'Мои подписки: \n'
            //                         html += sub.map((s, i) => {
            //                             if(s.uid === 'Ежедневно') {
            //                                 cron.schedule(`*/${10} * * * * *`, function() {
            //                                     bot.sendMessage(chatId, s.name + ' ' + s.uid, {
            //                                         reply_markup: {keyboard: keyboard.home}
            //                                     })
            //
            //                                 });
            //                             }
            //                             if(s.uid === 'Ежемесячно') {
            //                                 cron.schedule(`*/${30} * * * * *`, function() {
            //                                     bot.sendMessage(chatId, s.name + ' ' + s.uid, {
            //                                         reply_markup: {keyboard: keyboard.home}
            //                                     })
            //
            //                                 });
            //                             }
            //                             if(s.uid === 'Ежегодно') {
            //                                 cron.schedule(`*/${40} * * * * *`, function() {
            //                                     bot.sendMessage(chatId, s.name + ' ' + s.uid, {
            //                                         reply_markup: {keyboard: keyboard.home}
            //                                     })
            //
            //                                 });
            //                             }
            //                             if(s.uid === 'Еженедельно') {
            //                                 cron.schedule(`*/${20} * * * * *`, function() {
            //                                     bot.sendMessage(chatId, s.name + ' ' + s.uid, {
            //                                         reply_markup: {keyboard: keyboard.home}
            //                                     })
            //
            //                                 });
            //                             }
            //
            //                                 if(s.uid === 'Ежедневно'
            //                                 || s.uid === 'Ежемесячно'
            //                                 || s.uid === 'Ежегодно'
            //                                 || s.uid === 'Еженедельно') {
            //                                 return `<b>${i + 1}</b> ${s.name} - <b>${s.date}</b> - <b>${s.uid}</b>  (/s${s._id})`
            //                             }
            //                         }).join('\n')
            //                     }
            //                     sendHTML(chatId, html, 'home')
            //                     // if(sub.length) {
            //                     //     html += sub.map((s, i) => {
            //                     //         return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
            //                     //     }).join('\n')
            //                     // }
            //                 }).catch(e => console.log(e))
            //         } else {
            //             sendHTML(chatId, 'Вы пока ничего не добавили!!', 'home')
            //         }
            //     }).catch(e => console.log(e))
            //






            // var i = 5
            // cron.schedule(`*/${i} * * * * *`, function() {
            //     bot.sendMessage(chatId, 'Подписка', {
            //         reply_markup: {keyboard: keyboard.home}
            //     })
            //
            // });
            break

        case kb.film.random:
            sendFilmsByQuery(chatId, {})
            break
        case kb.film.comedy:
            sendFilmsByQuery(chatId, {})
            break
        case kb.back:
            bot.sendMessage(chatId, 'Посчитаем подписки?', {
                reply_markup: {keyboard: keyboard.home}
            })
            boolspis = false
            pingbool = false
            break
        case kb.subs.cancel:
            bot.sendMessage(chatId, 'Посчитаем подписки', {
                reply_markup: {keyboard: keyboard.home}
            })

            setTimeout(() => {

                bot.sendMessage(chatId, 'Посчитаем подписки', {
                    reply_markup: {keyboard: keyboard.home}
                })
                newSubs.name = ""
                newSubs.price = 0
                newSubs.category = ""
                newSubs.url = ""
                newSubs.date = 'Нет даты'
                newSubs.uid = ""
            }, 3000)
            break
        case kb.subs.cancel_date:
            bot.sendMessage(chatId, 'Сохранено, посчитаем подписки', {
                reply_markup: {keyboard: keyboard.home}
            })

            setTimeout(() => {

                bot.sendMessage(chatId, 'Посчитаем подписки', {
                    reply_markup: {keyboard: keyboard.home}
                })
                newSubs.name = ""
                newSubs.price = 0
                newSubs.category = ""
                newSubs.url = ""
                newSubs.date = 'Нет даты'
                newSubs.uid = ""
            }, 3000)
            break
        case kb.subs.create:
            if (newSubs.name !== "") {


                var newsub = new Subs(newSubs).save().then(_ => {
                    console.log("Ok")
                    console.log(newsub)


                }).catch(err => console.log(err))

                let userPromise


                User.findOne({telegramId: msg.from.id})
                    .then(user => {
                        if (user) {
                            {
                                console.log(newsub)
                                user.mysubs.push(newSubs.name)
                            }
                            userPromise = user
                        } else {
                            userPromise = new User({
                                telegramId: msg.from.id,
                                mysubs: [newSubs.name]
                            })
                        }


                        userPromise.save().then(_ => {
                            console.log("ok")
                        }).catch(err => console.log(err))
                    }).catch(err => console.log(err))

                setTimeout(() => {

                    bot.sendMessage(chatId, 'Посчитаем подписки', {
                        reply_markup: {keyboard: keyboard.home}
                    })
                    newSubs.name = ""
                    newSubs.price = 0
                    newSubs.category = ""
                    newSubs.url = ""
                    newSubs.date = 'Нет даты'
                    newSubs.uid = ""
                }, 3000)


            } else {
                bot.sendMessage(chatId, 'Название не введено')
            }

            break
        case kb.subs.name_change_date:
            try {
                console.log(newSubs.price)
                console.log(newSubs.date)

                if(newSubs.date !== 'Нет даты') {

                    Subs.findOne({_id: sub_idd})
                        .then(sub => {
                            if (sub) {
                                sub.date = newSubs.date
                                sub.save().then(_ => {
                                    console.log("ok")
                                }).catch(err => console.log(err))

                            }
                        }).catch(err => console.log(err))
                    //sendHTML(chatId, 'Введите дату в формате Д/М/ГГГГ. Например, 1/1/2000', 'changeData')
                    //changeDatabool = true

                    setTimeout(() => {

                        bot.sendMessage(chatId, 'Новая подписка сохранена. Посчитаем подписки', {
                            reply_markup: {keyboard: keyboard.home}
                        })
                        newSubs.name = ""
                        newSubs.price = 0
                        newSubs.category = ""
                        newSubs.url = ""
                        newSubs.date = 'Нет даты'
                        newSubs.uid = ""
                    }, 3000)
                } else {
                    sendHTML(chatId, 'Выберите подписку', 'changePrice')
                }

            } catch (e) {
                console.log(e)
                sendHTML(chatId, 'Введите дату в формате Д/М/ГГГГ', 'changePrice')
            }
            break
        case kb.subs.name_change:
            try {
                console.log(newSubs.price)
                console.log(newSubs.date)
                if (newSubs.price !== 0) {
                    //sendHTML(chatId, 'Введите дату в формате Д/М/ГГГГ. Например, 1/1/2000', 'changeData')
                    //changeDatabool = true
                    if (newSubs.date !== 'Нет даты' || newSubs.date !== 'Ежемесячно') {


                        var newsub = new Subs(newSubs).save().then(_ => {
                            console.log("Ok")
                            console.log(newsub)


                        }).catch(err => console.log(err))

                        let userPromise


                        User.findOne({telegramId: msg.from.id})
                            .then(user => {
                                if (user) {
                                    {
                                        console.log(newsub)
                                        user.mysubs.push(newSubs.name)
                                    }
                                    userPromise = user
                                } else {
                                    userPromise = new User({
                                        telegramId: msg.from.id,
                                        mysubs: [newSubs.name]
                                    })
                                }


                                userPromise.save().then(_ => {
                                    console.log("ok")
                                }).catch(err => console.log(err))
                            }).catch(err => console.log(err))

                        setTimeout(() => {

                            bot.sendMessage(chatId, 'Новая подписка сохранена. Посчитаем подписки', {
                                reply_markup: {keyboard: keyboard.home}
                            })
                            newSubs.name = ""
                            newSubs.price = 0
                            newSubs.category = ""
                            newSubs.url = ""
                            newSubs.date = 'Нет даты'
                            newSubs.uid = ""
                        }, 3000)


                    } else {
                        bot.sendMessage(chatId, 'Дата не введена. Нажмите ввести дату')
                    }


                }
            } catch (e) {
                console.log(e)
                sendHTML(chatId, 'Введите цену в рублях', 'changePrice')
            }
            break
    }
})
//
 bot.onText(/\/name/,msg => {
     const text = `Введите название подписки`
     console.log(keyboard.home)
     bot.sendMessage(helper.getChatId(msg), text, {
         reply_markup: {keyboard: keyboard.mysubs}
     })
     namebool = true
     console.log(namebool)
 })

 bot.onText(/\/price/,msg => {
     const text = `Введите цену подписки`
     console.log(keyboard.home)
     bot.sendMessage(helper.getChatId(msg), text, {
         reply_markup: {keyboard: keyboard.mysubs}
     })
     pricebool = true
 })
 bot.onText(/\/date/,msg => {
     const text = `Введите дату последнего списания у подписки в формате Д.М.ГГГГ. Например, 1/1/2000`
     console.log(keyboard.home)
     bot.sendMessage(helper.getChatId(msg), text, {
         reply_markup: {keyboard: keyboard.mysubs}
     })
     datebool = true
 })

 bot.onText(/\/category/,msg => {
     const text = `Введите категорию подписки`
     console.log(keyboard.home)
     bot.sendMessage(helper.getChatId(msg), text, {
         reply_markup: {keyboard: keyboard.mysubs}
     })
     categorybool = true
 })

bot.onText(/\/url/,msg => {
    const text = `Введите ссылку на подписку`
    console.log(keyboard.home)
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {keyboard: keyboard.mysubs}
    })
    urlbool = true
})

bot.onText(/\/type/,msg => {
    const text = `Введите тип подписки`
    console.log(keyboard.home)
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Ежендневно',
                        callback_data: JSON.stringify({
                            type: ACTION_TYPE.DAILY,
                            sub_id: sub_idd
                        })
                    },
                    {
                        text: 'Еженедельно',
                        callback_data: JSON.stringify({
                            type: ACTION_TYPE.WEEKLY,
                            sub_id: sub_idd
                        })
                    },
                    {
                        text: 'Ежемесячно',
                        callback_data: JSON.stringify({
                            type: ACTION_TYPE.MONTHLY,
                            sub_id: sub_idd
                        })
                    },
                    {
                        text: 'Ежегодно',
                        callback_data: JSON.stringify({
                            type: ACTION_TYPE.YEARLY,
                            sub_id: sub_idd
                        })
                    }
                ]
            ]
        }
    })
    typebool = true
})

bot.onText(/\/start/,msg => {
    const text = `Для управления используй кнопки внизу экрана.` + emoji.arrow_down + `:\n\n1. Для начала расскажи мне, какие у тебя есть подписки через кнопку "Добавить подписки"  ` + emoji.heavy_plus_sign + `\n2.После этого укажи даты списания через кнопку "Дата списания подписок" ` + emoji.calendar + `\n3.Посмотреть все свои подписки ты можешь в разделе "Мои подписки" ` + emoji.bar_chart + `\n4.Ты всегда можешь управлять уведомлениями в соответствующем разделе, чтобы я не беспокоил тебя лишний раз ` + emoji.bell
    console.log(keyboard.home)
    bot.sendMessage(helper.getChatId(msg), text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
})

bot.onText(/\/s(.+)/, (msg, [source, match]) => {

    const sub_id = helper.getItem_id(source)
    const chatId = helper.getChatId(msg)

    console.log(sub_id)
    if(sub_id === 'tart') {
        return
    }

    if(boolspis) {
        Promise.all([
            SubsGeneral.findOne(({_id: sub_id})),
            Subs.findOne(({_id: sub_id})),
            User.findOne({telegramId: msg.from.id})
        ]).then(([sub, mysub, user]) => {

            let isFav = false


            if (user) {
                if (mysub) {
                    console.log(user.mysubs.indexOf(mysub._id))
                }
                if (sub) {
                    isFav = user.subs.indexOf(sub._id) !== -1
                }
            }

            if (mysub) {
                const caption = `Название: ${mysub.name}\nЦена: ${mysub.price}\nКатегория: ${mysub.category}\nДата: ${mysub.date}\n`

                bot.sendMessage(chatId, caption, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Изменить дату',
                                    callback_data: JSON.stringify({
                                        type: ACTION_TYPE.CHANGE_DATE,
                                        sub_id: mysub._id
                                    })
                                }
                            ]
                        ]
                    }
                })
            }
        })
    } else if(pingbool) {
        Promise.all([
            SubsGeneral.findOne(({_id: sub_id})),
            Subs.findOne(({_id: sub_id})),
            User.findOne({telegramId: msg.from.id})
        ]).then(([sub, mysub, user]) => {

            let isFav = false


            if (user) {
                if (mysub) {
                    console.log(user.mysubs.indexOf(mysub._id))
                }
            }

            if (mysub) {
                const caption = `Название: ${mysub.name}\nЦена: ${mysub.price}\nКатегория: ${mysub.category}\nСтатус: ${mysub.unsub}\n`

                if(mysub.unsub === 'Включено') {

                bot.sendMessage(chatId, caption, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Выключить',
                                    callback_data: JSON.stringify({
                                        type: ACTION_TYPE.CHANGE_OFF,
                                        sub_id: mysub._id
                                    })
                                }
                            ]
                        ]
                    }
                }) } else {
                    bot.sendMessage(chatId, caption, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Включить',
                                        callback_data: JSON.stringify({
                                            type: ACTION_TYPE.CHANGE_ON,
                                            sub_id: mysub._id
                                        })
                                    }
                                ]
                            ]
                        }
                    })
                }
            }
        })
    }
    else {
            Promise.all([
                SubsGeneral.findOne(({_id: sub_id})),
                Subs.findOne(({_id: sub_id})),
                User.findOne({telegramId: msg.from.id})
            ]).then(([sub, mysub, user]) => {

                let isFav = false


                if (user) {
                    if (mysub) {
                        console.log(user.mysubs.indexOf(mysub._id))
                    }
                    if (sub) {
                        isFav = user.subs.indexOf(sub._id) !== -1
                    }
                }

                if (mysub) {
                    const caption = `Название: ${mysub.name}\nЦена: ${mysub.price}\nКатегория: ${mysub.category}\nДата: ${mysub.date}\n`

                    bot.sendMessage(chatId, caption, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Удалить',
                                        callback_data: JSON.stringify({
                                            type: ACTION_TYPE.TOGGLE_RM,
                                            sub_id: mysub._id
                                        })
                                    }
                                ]
                            ]
                        }
                    })
                }

                const favText = isFav ? 'Удалить из подписок' : 'Добавить подписку'

                console.log(sub)
                if (sub) {

                    const caption = `Название: ${sub.name}\nЦена: ${sub.price}\nКатегория: ${sub.category}\n`

                    bot.sendPhoto(chatId, sub.url, {
                        caption: caption,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: favText,
                                        callback_data: JSON.stringify({
                                            type: ACTION_TYPE.TOGGLE_SUB,
                                            sub_id: sub._id,
                                            isFav: isFav
                                        })
                                    },
                                    {
                                        text: `Изменить цену`,
                                        // url добавить ниже
                                        callback_data: JSON.stringify({
                                            type: ACTION_TYPE.CHANGE_PRICE,
                                            sub_id: sub._id
                                        })
                                    }
                                ]
                            ]
                        }
                    })
                }
            })
    }

})

bot.on('callback_query', query => {
    const userId = query.from.id
    let data

    try {
        data = JSON.parse(query.data)
    } catch (e) {
        console.log(e)
        throw new Error('Data is not an object')
    }

    console.log(data)

    const { category } = data
    const { type } = data

    if(category) {
        sendFilmsByQuery (userId, {category: category})
    }

    if (type === ACTION_TYPE.TOGGLE_SUB) {
        toggleFavouriteSub(userId, query.id, data)
    }

    if (type === ACTION_TYPE.CHANGE_PRICE) {
        console.log("change price")
        changePriceSub(userId, query.id, data)
    }

    if (type === ACTION_TYPE.CHANGE_DATE) {
        console.log("change price")
        changeDateSub(userId, query.id, data)
    }

    if (type === ACTION_TYPE.CHANGE_ON) {
        console.log("change price")
        changeOnOff(userId,true, query.id, data)
    }

    if (type === ACTION_TYPE.CHANGE_OFF) {
        console.log("change price")
        changeOnOff(userId,false, query.id, data)
    }

    if (type === ACTION_TYPE.DAILY) {
        changeDateLy(userId, query.id,'Ежедневно', data)
    }
    if (type === ACTION_TYPE.WEEKLY) {
        changeDateLy(userId, query.id,'Еженедельно', data)
    }
    if (type === ACTION_TYPE.MONTHLY) {
        changeDateLy(userId, query.id,'Ежемесячно', data)
    }
    if (type === ACTION_TYPE.YEARLY) {
        changeDateLy(userId, query.id,'Ежегодно', data)
    }


    if (type === ACTION_TYPE.NEXT) {
        console.log("change price")
        startI++
        sendFilmsByQueryIndex(userId, {}, startI)
    }

    if (type === ACTION_TYPE.TOGGLE_RM) {
        toggleDelete(userId, query.id, data)
    }

    console.log(query.data)
})

bot.on('inline_query', query => {
    SubsGeneral.find({}).then(subs => {
        const results = subs.map(s => {
            const caption = `Название: ${s.name}\nЦена: ${s.price}\nКатегория: ${s.category}\n@TracksyBot`

            return {
                id: s._id,
                type: 'photo',
                photo_url: s.url,
                thumb_url: s.url,
                // type: 'article',
                // title: s.name,
                // input_message_content: {
                //     message_text: s.name + '\n@rtref_bot'
                // },
                caption: caption,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `Ссылка на отписаться`,
                                callback_data: s.unsub
                            }
                        ]
                    ]
                }
            }
        })

        bot.answerInlineQuery(query.id, results, {
            cache_time: 0
        })
    })
})

function sendFilmsByQuery(chatId, query) {
    SubsGeneral.find(query).then(subs => {
        console.log(subs)

        const html = subs.map((s, i) => {
            return `<b>${i + 1}</b> ${s.name} - /s${s._id}`
        }).join('\n')

        //html += 'Создать свою подписку - /newsubscription'

        sendHTML(chatId, html, 'subs')
    })
}

function sendFilmsByQueryIndex(chatId, query, startIndex) {
    SubsGeneral.find(query).then(subs => {
        //console.log(subs)

        var lenAr = subs.length
        var maxSpot = 6

        if(lenAr % maxSpot !== 0) {
        startIndex = startIndex % (Math.floor(lenAr / maxSpot,0)+1)
            } else {
            startIndex = startIndex % (Math.floor(lenAr / maxSpot,0))
        }
        console.log(startIndex)

        const html = subs.map((s, i) => {
            if(i >= startIndex * maxSpot && i < (startIndex+1) * (maxSpot)) {
                return `<b>${i + 1}</b> ${s.name} - /s${s._id}`
            }
        }).join('\n')

        //html += 'Создать свою подписку - /newsubscription'


        var kbName = 'subs'

        if(html !== '') {
            bot.sendMessage(chatId, html, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Далее',
                                callback_data: JSON.stringify({
                                    type: ACTION_TYPE.NEXT
                                })
                            }
                        ]
                    ]
                }
            })
        }

    })

}

function sendHTML(chatId, html, kbName = null) {
    const options = {
        parse_mode: 'HTML'
    }

    if (kbName) {
        options['reply_markup'] = {
            keyboard: keyboard[kbName]
        }
    }

    bot.sendMessage(chatId, html, options)
}



function parseDate(str) {
    var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
        , d = (m) ? new Date(m[3], m[2]-1, m[1]) : null
        , nonRolling = (d&&(str==[d.getDate(),d.getMonth()+1,d.getFullYear()].join('/')));
    return (nonRolling) ? d : null;
}
//
//  function changeDataSub(userId,  sub_id) {
//     let userPromise
//      var newsub
//
//      SubsGeneral.findOne(({_id: sub_id})).then(sub => {
//
//          newSubs.name = sub.name
//          newSubs.category = sub.category
//
//          if(newSubs.price !== 0) {
//              console.log(newSubs.price)
//
//              newsub = new Subs(newSubs).save().then(_ => {
//                  console.log("Ok")
//                  console.log(newsub)
//
//
//              }).catch(err => {
//                  console.log(err)
//                  bot.sendMessage(chatId, 'Неправильная дата или цена, нажмите ОТМЕНА и попробуйте снова')
//              })
//          }
//      }).catch(err => console.log(err))
//
//      User.findOne({telegramId: userId}).then(user => {
//          if (user) {
//              {
//                  console.log(newsub)
//                  user.mysubs.push(newSubs.name)
//              }
//              userPromise = user
//          } else {
//              userPromise = new User({
//                  telegramId: msg.from.id,
//                  mysubs: [newSubs.name]
//              })
//          }
//
//
//          userPromise.save().then(_ => {
//              console.log("ok")
//          }).catch(err => console.log(err))
//      }).catch(err => console.log(err))
//
//
//
//
//                 setTimeout(() => {
//
//                     bot.sendMessage(user, 'Посчитаем подписки', {
//                         reply_markup: {keyboard: keyboard.home}
//                     })
//                     newSubs.name = ""
//                     newSubs.price = 0
//                     newSubs.category = ""
//                     newSubs.url = ""
//                     newSubs.date = 'Нет даты'
//                     newSubs.uid = ""
//                     changebool = false
//                     changeDatabool = false
//                 }, 6000)
// }

function changePriceSub(userId, queryId, {sub_id}) {
    let userPromise

    console.log(sub_id)
    sub_idd = sub_id;


    sendHTML(userId, 'Введите цену в рублях', 'changePrice')
    changebool = true


    Promise.all([
        User.findOne({telegramId: userId})
        ,
        SubsGeneral.findOne(({_id: sub_id}))
    ])
        .then(([user, sub])=> {

            console.log(user)
            console.log(sub)

            newSubs.name = sub.name
            newSubs.category = sub.category

            if(newSubs.price !== 0) {
                console.log(newSubs.price)

                var newsub = new Subs(newSubs).save().then(_ => {
                    console.log("Ok")
                    console.log(newsub)


                }).catch(err => console.log(err))


                if (user) {
                    {
                        console.log(newsub)
                        user.mysubs.push(newSubs.name)
                    }
                    userPromise = user
                } else {
                    userPromise = new User({
                        telegramId: msg.from.id,
                        mysubs: [newSubs.name]
                    })
                }


                userPromise.save().then(_ => {
                    console.log("ok")
                }).catch(err => console.log(err))


                setTimeout(() => {

                    bot.sendMessage(user, 'Посчитаем подписки', {
                        reply_markup: {keyboard: keyboard.home}
                    })
                    newSubs.name = ""
                    newSubs.price = 0
                    newSubs.category = ""
                    newSubs.url = ""
                    newSubs.date = 'Нет даты'
                    newSubs.uid = ""
                    changebool = false
                }, 3000)
            } else {

            }
        }).catch(err => console.log(err))

}



function changeOnOff(userId,status, queryId, {sub_id}) {
    console.log(status)
    if(status) {
        Subs.findOne({_id: sub_id})
            .then(sub => {
                if (sub) {
                    sub.unsub = 'Включено'
                    sub.save().then(_ => {
                        console.log("ok")
                    }).catch(err => console.log(err))
                    if(tasks[sub_id]) {
                        tasks[sub_id].start()
                    } else {
                        if (sub.uid === 'Ежедневно') {
                            tasks[sub_id] = cron.schedule(`*/${2} * * * * *`, function () {
                                bot.sendMessage(userId, sub.name + ' ' + sub.uid)
                            });
                        }
                        if (sub.uid === 'Ежемесячно') {
                            tasks[sub_id] = cron.schedule(`*/${5} * * * * *`, function () {
                                bot.sendMessage(userId, sub.name + ' ' + sub.uid)
                            });
                        }
                        if (sub.uid === 'Ежегодно') {
                            tasks[sub_id] = cron.schedule(`*/${7} * * * * *`, function () {
                                bot.sendMessage(userId, sub.name + ' ' + sub.uid)
                            });
                        }
                        if (sub.uid === 'Еженедельно') {
                            tasks[sub_id] = cron.schedule(`*/${7} * * * * *`, function () {
                                bot.sendMessage(userId, sub.name + ' ' + sub.uid)
                            });
                        }
                    }

                }
                bot.sendMessage(userId, 'Новая подписка сохранена. Посчитаем подписки', {
                    reply_markup: {keyboard: keyboard.home}
                })
            }).catch(err => console.log(err))



    } else if(!status) {
        Subs.findOne({_id: sub_id})
            .then(sub => {
                if (sub) {
                    sub.unsub = 'Выключено'
                    sub.save().then(_ => {
                        console.log("ok")
                    }).catch(err => console.log(err))

                }


                bot.sendMessage(userId, 'Новая подписка сохранена. Посчитаем подписки', {
                    reply_markup: {keyboard: keyboard.home}
                })
                tasks[sub_id].stop()
            }).catch(err => console.log(err))
    }



}

function changeDateSub(userId, queryId, {sub_id}) {

    console.log(sub_id)


    sendHTML(userId, 'Введите дату в формате Д/М/ГГГ', 'changeData')
    changeDatabool = true
    sub_idd = sub_id

}




function changeDateLy(userId, queryId, text, {sub_id}) {

    if (typebool) {
        newSubs.uid = text
        typebool = false
        bot.sendMessage(userId, 'Нажмите сохранить или продолжите заполнение')
    } else {

        console.log(sub_id)

        Subs.findOne({_id: sub_idd})
            .then(sub => {
                if (sub) {
                    sub.uid = text
                    sub.save().then(_ => {
                        console.log("ok")
                    }).catch(err => console.log(err))

                }
            }).catch(err => console.log(err))

        sendHTML(userId, 'Нажмите сохранить', 'changeData')

    }
}

function toggleFavouriteSub(userId, queryId, {sub_id, isFav}) {
    let userPromise

    User.findOne({telegramId: userId})
        .then(user => {
            if(user) {
                if(isFav) {
                    user.subs = user.subs.filter(sUuid => sUuid !== sub_id)
                } else {
                    user.subs.push(sub_id)
                }
                userPromise = user
            } else {
                userPromise = new User({
                    telegramId: userId,
                    subs: [sub_id]
                })
            }

            const  answerText = isFav ? 'Удалено' : 'Добавлено'

            userPromise.save().then(_ => {
                bot.answerCallbackQuery({
                    callback_query_id: queryId,
                    text: answerText
                })
            }).catch(err => console.log(err))
        }).catch(err => console.log(err))
}

function showStatistic(chatId, telegramId) {
    console.log("statistic")
    User.findOne({telegramId})
        .then(user => {
            console.log(user)
            if(user) {
                Promise.all([
                    SubsGeneral.find(({_id: {'$in': user.subs}}))
                    ,
                    Subs.find(({name: {'$in': user.mysubs}}))
                ])
                    .then(([subgeneral, sub])=> {
                        console.log(subgeneral.length)
                        console.log(sub.length)
                        let html = ''
                        let sumgen = 0;
                        let summy = 0;
                        let sum = 0;

                        if (subgeneral.length) {
                            html += 'Общие подписки: \n'
                            html += subgeneral.map((s, i) => {
                                return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                            }).join('\n')
                            html += '\n'
                            sumgen = subgeneral.reduce((acc, val) => {
                                return acc + val.price
                            },0)
                            html += 'Сумма общих подписок - ' + sumgen + '\n\n'
                            console.log(sumgen)
                            sum += sumgen
                        }
                        if (sub.length) {
                            html += 'Мои подписки: \n'
                            html += sub.map((s, i) => {
                                return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                            }).join('\n')
                            summy = sub.reduce((acc, val) => {
                                return acc + val.price
                            },0)
                            html += '\nСумма моих подписок - ' + summy + '\n'
                            console.log(summy)
                            sum += summy
                        }

                        if (sum !== 0) {
                            html += '\nОбщая ежемесячная сумма подписок: ' + sum + '\n'
                        }

                        // if(sub.length) {
                        //     html += sub.map((s, i) => {
                        //         return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                        //     }).join('\n')
                        // }
                        if(sub.length === 0 && subgeneral.length === 0) {
                            html = 'Вы пока ничего не добавили!'
                        }

                        sendHTML(chatId, html, 'menu_back')
                    }).catch(e => console.log(e))
            } else {
                sendHTML(chatId, 'Вы пока ничего не добавили!!', 'menu_back')
            }
        }).catch(e => console.log(e))
}

function showFavouriteSubs(chatId, telegramId) {
    console.log("favourite")
    User.findOne({telegramId})
        .then(user => {
            console.log(user)
            if(user) {
                Promise.all([
                    SubsGeneral.find(({_id: {'$in': user.subs}}))
                    ,
                    Subs.find(({name: {'$in': user.mysubs}}))
                ])
                    .then(([subgeneral, sub])=> {
                        console.log(subgeneral.length)
                        console.log(sub.length)
                        let html = ''

                        if (subgeneral.length) {
                            html += 'Общие подписки: \n'
                            html += subgeneral.map((s, i) => {
                                return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                            }).join('\n')
                            html += '\n'
                        }
                        if (sub.length) {
                            html += 'Мои подписки: \n'
                            html += sub.map((s, i) => {
                                return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                            }).join('\n')
                        }
                        // if(sub.length) {
                        //     html += sub.map((s, i) => {
                        //         return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                        //     }).join('\n')
                        // }
                        if(sub.length === 0 && subgeneral.length === 0) {
                            html = 'Вы пока ничего не добавили!'
                        }

                        sendHTML(chatId, html, 'menu_sub')
                    }).catch(e => console.log(e))
            } else {
                sendHTML(chatId, 'Вы пока ничего не добавили!!', 'menu_sub')
            }
        }).catch(e => console.log(e))
}


function showFavouriteSubsDateSpis(chatId, telegramId) {

    boolspis = true
    console.log("favourite")
    User.findOne({telegramId})
        .then(user => {
            console.log(user)
            if(user) {
                Promise.all([
                    SubsGeneral.find(({_id: {'$in': user.subs}}))
                    ,
                    Subs.find(({name: {'$in': user.mysubs}}))
                ])
                    .then(([subgeneral, sub])=> {
                        console.log(subgeneral.length)
                        console.log(sub.length)
                        let html = ''

                        // if (subgeneral.length) {
                        //     html += 'Общие подписки: \n'
                        //     html += subgeneral.map((s, i) => {
                        //         return `<b>${i+1}</b> ${s.name} - <b>${s.date}</b> - <b>${s.uid}</b> (/s${s._id})`
                        //     }).join('\n')
                        //     html += '\n'
                        // }
                        if (sub.length) {
                            html += 'Мои подписки: \n'
                            html += sub.map((s, i) => {
                                return `<b>${i+1}</b> ${s.name} - <b>${s.date}</b> - <b>${s.uid}</b>  (/s${s._id})`
                            }).join('\n')
                        }
                        // if(sub.length) {
                        //     html += sub.map((s, i) => {
                        //         return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                        //     }).join('\n')
                        // }
                        if(sub.length === 0 && subgeneral.length === 0) {
                            html = 'Вы пока ничего не добавили!'
                        }

                        sendHTML(chatId, html, 'changeData')
                    }).catch(e => console.log(e))
            } else {
                sendHTML(chatId, 'Вы пока ничего не добавили!!', 'changeData')
            }
        }).catch(e => console.log(e))
}



function showFavouriteSubsDatePing(chatId, telegramId) {

    pingbool = true
    console.log("favourite")
    User.findOne({telegramId})
        .then(user => {
            console.log(user)
            if(user) {
                Promise.all([
                    SubsGeneral.find(({_id: {'$in': user.subs}}))
                    ,
                    Subs.find(({name: {'$in': user.mysubs}}))
                ])
                    .then(([subgeneral, sub])=> {
                        console.log(subgeneral.length)
                        console.log(sub.length)
                        let html = ''

                        // if (subgeneral.length) {
                        //     html += 'Общие подписки: \n'
                        //     html += subgeneral.map((s, i) => {
                        //         return `<b>${i+1}</b> ${s.name} - <b>${s.date}</b> - <b>${s.uid}</b> (/s${s._id})`
                        //     }).join('\n')
                        //     html += '\n'
                        // }
                        if (sub.length) {
                            html += 'Выберите подписки для отсылки уведомления: \n'
                            html += sub.map((s, i) => {
                                return `<b>${i+1}</b> ${s.name} - <b>${s.date} - ${s.uid}</b> Статус - <b>${s.unsub}</b>  (/s${s._id})`
                            }).join('\n')
                        }
                        // if(sub.length) {
                        //     html += sub.map((s, i) => {
                        //         return `<b>${i+1}</b> ${s.name} - <b>${s.price}</b> (/s${s._id})`
                        //     }).join('\n')
                        // }
                        if(sub.length === 0 && subgeneral.length === 0) {
                            html = 'Вы пока ничего не добавили!'
                        }

                        sendHTML(chatId, html, 'ping')
                    }).catch(e => console.log(e))
            } else {
                sendHTML(chatId, 'Вы пока ничего не добавили!!', 'home')
            }
        }).catch(e => console.log(e))
}

function toggleDelete(userId, queryId, {sub_id}) {
    let userPromise

    Promise.all([
        User.findOne({telegramId: userId})
        ,
        Subs.findOne(({_id: sub_id}))
    ])
        .then(([user, sub])=> {

                user.mysubs = user.mysubs.filter(sUuid => sUuid !== sub.name)
                userPromise = user




            const  answerText = 'Удалено'

            userPromise.save().then(_ => {
                bot.answerCallbackQuery({
                    callback_query_id: queryId,
                    text: answerText
                })
            }).catch(err => console.log(err))

            Subs.findOneAndRemove({_id: sub_id}, function(err){ console.log(err)});
        }).catch(err => console.log(err))


}
// let userPromise
//
// console.log(sub_id)
//
// sendHTML(userId, 'Введите дату в формате Д/М/ГГГГ. Например, 1/1/2000', 'changeData')
// changeDatabool = true
//
// Promise.all([
//     User.findOne({telegramId: userId})
//     ,
//     SubsGeneral.findOne(({_id: sub_id}))
// ])
//     .then(([user, sub])=> {
//
//         console.log(user)
//         console.log(sub)
//
//         newSubs.name = sub.name
//         newSubs.category = sub.category
//
//         if(newSubs.date !== 'Нет даты' || newSubs.date !== 'Ежемесячно') {
//             console.log(newSubs.date)
//
//             var newsub = new Subs(newSubs).save().then(_ => {
//                 console.log("Ok")
//                 console.log(newsub)
//
//
//             }).catch(err => console.log(err))
//
//
//             if (user) {
//                 {
//                     console.log(newsub)
//                     user.mysubs.push(newSubs.name)
//                 }
//                 userPromise = user
//             } else {
//                 userPromise = new User({
//                     telegramId: msg.from.id,
//                     mysubs: [newSubs.name]
//                 })
//             }
//
//
//             userPromise.save().then(_ => {
//                 console.log("ok")
//             }).catch(err => console.log(err))
//
//
//             setTimeout(() => {
//
//                 bot.sendMessage(user, 'Посчитаем подписки', {
//                     reply_markup: {keyboard: keyboard.home}
//                 })
//                 newSubs.name = ""
//                 newSubs.price = 0
//                 newSubs.category = ""
//                 newSubs.url = ""
//                 newSubs.date = 'Нет даты'
//                 newSubs.uid = ""
//                 changeDatabool = false
//             }, 3000)
//         }
//     }).catch(err => console.log(err))