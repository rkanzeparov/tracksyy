
var cron = require('node-cron')
var task = {}


task['sm'] = cron.schedule(`*/${12} * * * * *`, function() {
    console.log("sm")
});

task['sm2'] = cron.schedule(`*/${15} * * * * *`, function() {
    console.log("sm")
});


for(var o in task.valueOf()) {
    console.log(task[o].stop())
}




// setTimeout(()=> {
//     task['sm'].stop()
// },6000)
//
// setTimeout(()=> {
//     task['sm'].start()
// },12000)