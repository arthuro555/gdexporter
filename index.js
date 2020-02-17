require("./getGD").getGD().then(gd => {
    let p = new gd.Project();
    let js = gd.JsPlatform.get();
    console.log(p)
    console.log(gd)
})
