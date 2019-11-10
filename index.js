const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const { promisify } = require('util')
const  sgMail  =  require ( '@sendgrid/mail' );

const GoogleSpreadsheet = require('google-spreadsheet')
const credentials = require('./bugtracker.json')

// configurações
const docId = 'ID-DA-PLANILHA'
const worksheetIndex = 0
const sendGridKey = 'CHAVE-PARA-ENVIO-DE-EMAIL'


app.set('view engine', 'ejs')
app.set('views', path.resolve(__dirname, 'views'))

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('home')
});

app.post('/', async (req, res) => {
try{
    const doc = new GoogleSpreadsheet(docId)
    await promisify(doc.useServiceAccountAuth)(credentials)
    console.log('Planilha aberta')
    const info = await promisify(doc.getInfo)()
    const worksheet = info.worksheets[worksheetIndex]
    await promisify(worksheet.addRow)({
        name: req.body.name,
        email: req.body.email,
        issueType: req.body.issueType,
        source:req.body.source || 'direct',
        howToReproduce: req.body.howToReproduce,
        expectedoutput: req.body.expectedoutput,
        receivedOutput: req.body.receivedOutput,
        userAgent: req.body.userAgent,
        userDate: req.body.userDate
    })

    // se for critico
// usando uma biblioteca Node.js.3 do Twilio SendGrid
// https://github.com/sendgrid/sendgrid-nodejs
if(req.body.issueType === 'CRITICAL'){
    sgMail.setApiKey (sendGridKey);
    const  msg  = {
      to :  'E-MAIL DE ENVIAR PARA E-MAIL X' ,
      from :'E-MAIL DE ENVIAR A PARTIR DO E-MAIL X' ,
      subject :  'BUG Critico Reportado' ,
      text :`
      O usuario ${ req.body.name} reportou um problema.
      `,
      html :`O usuario ${ req.body.name} reportou um problema.`
    };
    await sgMail.send(msg);
    
}

    res.render('sucesso')
}catch(err){
    res.send('Erro ao enviar o formulario')
    console.log(err)
}
})


app.listen(3333, (err) => {
    if (err) {
        console.log('aconteceu um erro', err)
    } else {
        console.log('bugtracker rodando na porta http://localhost:3333')
    }
});