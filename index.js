const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type('html').send("oi"));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

//const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")


const { MongoClient } = require('mongodb');
const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);
const database = client.db("futebol-virtual-betano");
let db = database.collection("futebol-virtual-betano");
//var jogos = await db.find({}).limit(0).sort({_id: 1}).skip(0).toArray();

let browser, page;

let dadosJogos = {};


async function robo() {

        try {

                // configure the stealth plugin
                puppeteer.use(StealthPlugin())
                // set up the browser and launch it
                const browser = await puppeteer.launch()

                // open a new blank page
                const page = await browser.newPage()

                // navigate the page to the target page
                await page.goto("https://br.betano.com/virtuals/")



               /* browser = await puppeteer.launch();
                page = await browser.newPage();
                await page.setViewport({width: 1920, height: 1080});

                await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0');
                // Navigate the page to a URL
                await page.goto('https://br.betano.com/virtuals/', {
                        waitUntil: 'networkidle0',
                });*/

                roboCarregaPaginaJogo();

        } catch (err) {
                console.error("ERRO 1", err);
        }

}

async function roboCarregaPaginaJogo(){
        try{

                // fecha login
                if (await page.$("#landing-page-modal > div > div.sb-modal__close > button")) {
                        await page.click("#landing-page-modal > div > div.sb-modal__close > button");
                }

                // fecha avisso cookie
                if (await page.$("#app > div > div > section.main-content-wrapper > div.sticky-notification.sticky-notification--bottom > div > div.sticky-notification__actions-container > button:nth-child(2)")) {
                        await page.click("#app > div > div > section.main-content-wrapper > div.sticky-notification.sticky-notification--bottom > div > div.sticky-notification__actions-container > button:nth-child(2)");
                }

                // remove setas para rolar os jogos que bugam
                let el = await page.waitForSelector("#virtuals-upcoming-events-next");
                await el.evaluate(el => el.remove());
                el = await page.waitForSelector("#virtuals-upcoming-events-prev");
                await el.evaluate(el => el.remove());

                // busca listagem de jogos futuros
                //await buscaJogosFuturos();

                // busca resultados dos jogos passados
                await buscaResultadosJogos();


        } catch (error) {
                console.log("ERRO GENERICO", error);
                //await roboCarregaPaginaJogo();
        }
}

async function buscaResultadosJogos(){

        await delay(2000);
        await page.waitForSelector('#app > div > div > section.main-content-wrapper > div.grid__row.main-content-wrapper__content > div.grid__column.grid__column--fluid.grid__column__main-content > section > section > section > div > div.virtuals-stream-container__wrapper > div.tw-relative.tw-flex.tw-items-center.tw-w-full > div.tw-flex.tw-flex-col.tw-items-center.tw-justify-center.tw-rounded-s.tw-cursor-pointer.tw-transition-colors.tw-duration-base.tw-bg-n-17-black-pearl.tw-w-\\[60px\\].tw-h-\\[66px\\].tw-ml-n');
        let btn = await page.$('#app > div > div > section.main-content-wrapper > div.grid__row.main-content-wrapper__content > div.grid__column.grid__column--fluid.grid__column__main-content > section > section > section > div > div.virtuals-stream-container__wrapper > div.tw-relative.tw-flex.tw-items-center.tw-w-full > div.tw-flex.tw-flex-col.tw-items-center.tw-justify-center.tw-rounded-s.tw-cursor-pointer.tw-transition-colors.tw-duration-base.tw-bg-n-17-black-pearl.tw-w-\\[60px\\].tw-h-\\[66px\\].tw-ml-n');
        await btn.click();

        await delay(5000);

        await page.waitForSelector('#app > div > div > section.main-content-wrapper > div.grid__row.main-content-wrapper__content > div.grid__column.grid__column--fluid.grid__column__main-content > section > section > section > div > div.tw-flex.tw-flex-col.tw-bg-n-8-dark-steel.tw-rounded-s.tw-m-n.tw-pb-m > div');
        let listaResultadosJogosArray = await page.$$('#app > div > div > section.main-content-wrapper > div.grid__row.main-content-wrapper__content > div.grid__column.grid__column--fluid.grid__column__main-content > section > section > section > div > div.tw-flex.tw-flex-col.tw-bg-n-8-dark-steel.tw-rounded-s.tw-m-n.tw-pb-m > div')

        for (const el of listaResultadosJogosArray) {
                if(await (await el.getProperty('className')).jsonValue() === ""){
                        //console.log(el);
                        let elHora = await el.$$('span');
                        let horario = await elHora[0].evaluate(el3 => el3.textContent, elHora[0]);
                        //console.log("horario", horario);

                        let elDados = await el.$$('div');
                        //console.log("elDados", elDados);
                        let time1 = await elDados[2].evaluate(el3 => el3.textContent, elDados[2]);
                        //console.log("time1", time1);

                        let time2 = await elDados[6].evaluate(el3 => el3.textContent, elDados[6]);
                        //console.log("time2", time2);

                        let resultadoFinal = await elDados[4].evaluate(el3 => el3.textContent, elDados[4]);
                        //console.log("resultadoFinal", resultadoFinal);

                        let resultadoPrimeiroTempo = await elDados[5].evaluate(el3 => el3.textContent, elDados[5]);
                        resultadoPrimeiroTempo = resultadoPrimeiroTempo.replace(" (", "").replace(") ", "");
                        //console.log("resultadoPrimeiroTempo", resultadoPrimeiroTempo);

                        if(dadosJogos[horario] !== undefined){
                                dadosJogos[horario]["resultadoFinal"] = resultadoFinal;
                                dadosJogos[horario]["resultadoPrimeiroTempo"] = resultadoPrimeiroTempo;
                                dadosJogos[horario]["dataUpd"] = new Date().toISOString();
                                console.log("ATUALIZADO ==============================");
                                console.dir(dadosJogos, { depth: null });

                                // adiciona registro no DB
                                /*try{
                                        await db.insertOne(dadosJogos[horario]);
                                        console.log("ADICIONADO NO DB "+horario);

                                        delete dadosJogos[horario];
                                        console.dir(dadosJogos, { depth: null });

                                } catch (error){
                                        console.log(error);
                                }*/
                        }
                }
        }

        await delay(2000);
        await buscaJogosFuturos();
}


async function buscaJogosFuturos(){

        await page.waitForSelector('#app > div > div > section.main-content-wrapper > div.grid__row.main-content-wrapper__content > div.grid__column.grid__column--fluid.grid__column__main-content > section > section > section > div > div.virtuals-stream-container__wrapper > div.tw-relative.tw-flex.tw-items-center.tw-w-full > div.virtuals-swiper-wrapper > div > div.swiper-wrapper > div.swiper-slide');
        let listaProximosJogosArray = await page.$$('#app > div > div > section.main-content-wrapper > div.grid__row.main-content-wrapper__content > div.grid__column.grid__column--fluid.grid__column__main-content > section > section > section > div > div.virtuals-stream-container__wrapper > div.tw-relative.tw-flex.tw-items-center.tw-w-full > div.virtuals-swiper-wrapper > div > div.swiper-wrapper > div.swiper-slide')

        for (const el of listaProximosJogosArray) {
                // remove o primeiro jogo pq ja esta rolando
                if(await (await el.getProperty('className')).jsonValue() !== "swiper-slide swiper-slide-active"){
                        await el.click();
                        await delay(5000);

                        let info = await el.$$('.tw-leading-s');

                        let time1 = await info[0].evaluate(el3 => el3.textContent, info[0]);
                        time1 = time1.slice(0, -1);
                        let time2 = await info[1].evaluate(el3 => el3.textContent, info[1]);
                        let horario = await info[2].evaluate(el3 => el3.textContent, info[2]);

                        console.log("horario", horario);
                        console.log("time 1", time1);
                        console.log("time 2", time2);

                        // verifica se ja existe o jogo cadastrado
                        if(dadosJogos[horario] === undefined){
                                dadosJogos[horario] = {"time1": time1, "time2": time2, "dataAdd": new Date().toISOString()}

                                /*console.log("dadosJogos");
                                console.dir(dadosJogos, { depth: null });*/

                                let odds = {};

                                let listaDadosJogoArray = await page.$$('div.markets__market');
                                for (const el2 of listaDadosJogoArray) {

                                        let header = await el2.$$('div.markets__market__header__title > span');
                                        let txtHeader = await header[0].evaluate(el3 => el3.textContent, header[0]);
                                        txtHeader = txtHeader.replace(time1, "Time 1").replace(time2, "Time 2");
                                        console.log("header", txtHeader);
                                        odds[txtHeader] = {}

                                        let listaOddsJogoArray = await el2.$$('div.selections > button');
                                        for (const el2 of listaOddsJogoArray) {
                                                let textoBotao = await page.evaluate(el3 => el3.getAttribute("aria-label").slice(0, -1), el2);
                                                //console.log("texto botao", textoBotao);

                                                let regex = new RegExp("Bet on (.+) with odds (.+)").exec(textoBotao);
                                                let txt = regex[1]
                                                let odd = parseFloat(regex[2]);
                                                //console.log("RegExp", new RegExp("Bet on (.+) with odds (.+)").exec(textoBotao));
                                                //console.log("odd", odd);
                                                //console.log("texto", txt);
                                                odds[txtHeader][txt] = odd;
                                        }
                                }

                                dadosJogos[horario]["odds"] = odds;
                                console.log("dadosJogos2");
                                console.dir(dadosJogos, { depth: null });
                        }



                }

        }

        await buscaResultadosJogos();
}

function delay(time) {
        return new Promise(function(resolve) {
                setTimeout(resolve, time)
        });
}

robo();
