const kb = require('./keybord-buttons')

module.exports = {
    home: [
        [kb.home.subsAdd,kb.home.favourite],
        [kb.home.ping],
        [kb.home.spis]
    ],
    films: [
        [kb.film.random],
        [kb.film.action, kb.film.comedy],
        [kb.back]
    ],
    subs: [
        [kb.subs.mysub, kb.subs.cat],
        [kb.subs.search, kb.subs.popular],
        [kb.back]
    ],
    mysubs: [
        [kb.subs.create],
        [kb.subs.cancel]
    ],
    changePrice: [
        [kb.subs.name_change],
        [kb.subs.cancel]
    ],
    changeData: [
        [kb.subs.name_change_date],
        [kb.subs.cancel_date]
    ],
    ping: [
        [kb.ping.off],
        [kb.ping.setting],
        [kb.back]
    ],
    action_add: [
        kb.action.add
    ],
    action_remove: [
        kb.action.remove
    ],
    menu_sub: [
        [kb.menu.stat],
        [kb.back]
    ],
    menu_back: [
        [kb.back]
    ]
}